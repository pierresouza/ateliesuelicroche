-- =============================================================================
-- Ateliê Sueli Crochê — Sistema de Contas de Clientes & Rastreamento de Entrega
-- =============================================================================

-- 1. Perfis de Clientes (vinculado ao Supabase Auth)
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  default_cep text,
  default_street text,
  default_number text,
  default_complement text,
  default_neighborhood text,
  default_city text,
  default_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

create policy "Users view own profile" on public.customer_profiles
  for select to authenticated using (auth.uid() = id);

create policy "Users upsert own profile" on public.customer_profiles
  for insert to authenticated with check (auth.uid() = id and role = 'customer');

create policy "Users update own profile" on public.customer_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Trigger automático para criar perfil ao cadastrar cliente no Supabase Auth
create or replace function public.handle_new_customer_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_customer_user();

-- 2. Evolução da tabela orders para vínculo com cliente e rastreio de entrega
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists shipping_carrier text default 'Correios',
  add column if not exists tracking_code text,
  add column if not exists tracking_url text,
  add column if not exists estimated_delivery_date date,
  add column if not exists production_note text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_customer_email on public.orders (lower(customer_email));
create index if not exists idx_orders_order_code on public.orders (order_code);

-- 3. Histórico / Linha do Tempo de Eventos de Entrega
create table if not exists public.order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  title text not null,
  description text,
  location text default 'Ateliê Sueli Crochê — São Paulo, SP',
  created_at timestamptz not null default now()
);

create index if not exists idx_tracking_events_order_id on public.order_tracking_events (order_id);

alter table public.order_tracking_events enable row level security;

-- Helper para verificar se o usuário logado é Admin (Sueli)
create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.customer_profiles
    where id = auth.uid() and role = 'admin'
  )
  or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- Ajusta políticas RLS de orders para que cada cliente veja apenas seus próprios pedidos
-- (por user_id ou pelo mesmo e-mail autenticado), enquanto Admin gerencia todos
drop policy if exists "Authenticated read update orders" on public.orders;
drop policy if exists "Authenticated read order items" on public.order_items;

create policy "Customers read own orders" on public.orders
  for select to authenticated
  using (
    auth.uid() = user_id
    or lower(coalesce(customer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_store_admin()
  );

create policy "Admins manage all orders" on public.orders
  for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

create policy "Customers read own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.user_id = auth.uid()
          or lower(coalesce(o.customer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
          or public.is_store_admin()
        )
    )
  );

create policy "Public insert initial tracking event" on public.order_tracking_events
  for insert with check (true);

create policy "Customers read own tracking events" on public.order_tracking_events
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_tracking_events.order_id
        and (
          o.user_id = auth.uid()
          or lower(coalesce(o.customer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
          or public.is_store_admin()
        )
    )
  );

create policy "Admins manage tracking events" on public.order_tracking_events
  for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

-- 4. RPC Segura para consulta rápida por Código do Pedido + E-mail ou Telefone
create or replace function public.lookup_order_tracking(
  p_order_code text,
  p_contact text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_code text := upper(replace(trim(p_order_code), '#', ''));
  clean_digits text := regexp_replace(coalesce(p_contact, ''), '\D', '', 'g');
  matched_order public.orders%rowtype;
  items_json jsonb;
  events_json jsonb;
begin
  select * into matched_order
  from public.orders o
  where upper(o.order_code) = clean_code
    and (
      lower(coalesce(o.customer_email, '')) = lower(trim(p_contact))
      or (
        length(clean_digits) >= 8
        and right(regexp_replace(o.customer_phone, '\D', '', 'g'), 8) = right(clean_digits, 8)
      )
    )
  limit 1;

  if not found then
    return jsonb_build_object(
      'found', false,
      'message', 'Pedido não localizado. Confira o código (#ASC-XXXX) e o WhatsApp ou e-mail usado na compra.'
    );
  end if;

  select coalesce(jsonb_agg(row_to_json(oi)), '[]'::jsonb)
  into items_json
  from public.order_items oi
  where oi.order_id = matched_order.id;

  select coalesce(
    jsonb_agg(row_to_json(ev) order by ev.created_at desc),
    '[]'::jsonb
  )
  into events_json
  from public.order_tracking_events ev
  where ev.order_id = matched_order.id;

  return jsonb_build_object(
    'found', true,
    'order', jsonb_build_object(
      'id', matched_order.id,
      'order_code', matched_order.order_code,
      'customer_name', matched_order.customer_name,
      'city', matched_order.city,
      'state', matched_order.state,
      'cep', matched_order.cep,
      'payment_method', matched_order.payment_method,
      'total', matched_order.total,
      'shipping_amount', matched_order.shipping_amount,
      'status', matched_order.status,
      'shipping_carrier', matched_order.shipping_carrier,
      'tracking_code', matched_order.tracking_code,
      'tracking_url', matched_order.tracking_url,
      'estimated_delivery_date', matched_order.estimated_delivery_date,
      'production_note', matched_order.production_note,
      'created_at', matched_order.created_at,
      'updated_at', matched_order.updated_at
    ),
    'items', items_json,
    'events', events_json
  );
end;
$$;

grant execute on function public.lookup_order_tracking(text, text) to anon, authenticated;
