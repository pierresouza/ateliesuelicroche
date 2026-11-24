-- =============================================================================
-- Ateliê Sueli Crochê — Schema Completo E-commerce B2C + RLS + Keep-Alive
-- Projeto Supabase: vaoxdmdoqtkbbkccmnxh
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Categorias e Ambientes
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  room_type text,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Produtos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text unique not null,
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  pix_discount_percent numeric(5,2) not null default 5.00,
  image_url text not null,
  category text not null,
  room text not null default 'Sala',
  dimensions text not null,
  material text not null default 'Barbante 100% Algodão Ecológico',
  care_instructions text not null default 'Lavar à mão ou na máquina em ciclo delicado com sabão neutro. Secar à sombra.',
  stock_quantity integer not null default 3,
  is_made_to_order boolean not null default false,
  production_days integer not null default 7,
  rating numeric(3,2) not null default 5.00,
  reviews_count integer not null default 12,
  featured boolean not null default false,
  bestseller boolean not null default false,
  active boolean not null default true,
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_active on public.products (active);

-- 3. Cupons de Desconto (validados apenas via RPC segura)
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order_value numeric(10,2) not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Pedidos B2C
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  cep text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  notes text,
  payment_method text not null check (payment_method in ('pix', 'whatsapp_card', 'whatsapp_custom')),
  coupon_code text,
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  pix_discount_amount numeric(10,2) not null default 0,
  shipping_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  selected_color text not null,
  selected_size text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- 5. Avaliações Verificadas
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  customer_name text not null,
  customer_city text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Leads (Cupom 1ª Compra / Newsletter) & Encomendas Sob Medida
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  source text not null default 'first_purchase_coupon',
  utm_source text,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  piece_type text not null,
  room text not null,
  desired_dimensions text not null,
  color_palette text not null,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- 7. Keep-Alive Heartbeat (evita hibernação no Free Tier do Supabase)
create table if not exists public.keepalive_heartbeat (
  id integer primary key default 1 check (id = 1),
  last_ping_at timestamptz not null default now(),
  ping_count bigint not null default 1,
  source text default 'cron'
);

insert into public.keepalive_heartbeat (id, last_ping_at, ping_count, source)
values (1, now(), 1, 'initial_migration')
on conflict (id) do nothing;

-- =============================================================================
-- Funções RPC Seguras
-- =============================================================================

create or replace function public.ping_keepalive(ping_source text default 'cron')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_ts timestamptz := now();
  total_pings bigint;
begin
  insert into public.keepalive_heartbeat (id, last_ping_at, ping_count, source)
  values (1, current_ts, 1, ping_source)
  on conflict (id) do update
    set last_ping_at = current_ts,
        ping_count = public.keepalive_heartbeat.ping_count + 1,
        source = ping_source
  returning ping_count into total_pings;

  return jsonb_build_object(
    'ok', true,
    'project', 'atelie-sueli-croche',
    'pinged_at', current_ts,
    'ping_count', total_pings
  );
end;
$$;

grant execute on function public.ping_keepalive(text) to anon, authenticated;

create or replace function public.validate_coupon(coupon_code text, order_subtotal numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  found_coupon public.coupons%rowtype;
  calculated_discount numeric(10,2);
begin
  select * into found_coupon
  from public.coupons
  where upper(code) = upper(trim(coupon_code))
    and active = true
    and (expires_at is null or expires_at > now())
  limit 1;

  if not found then
    return jsonb_build_object('valid', false, 'message', 'Cupom inválido ou expirado.');
  end if;

  if order_subtotal < found_coupon.min_order_value then
    return jsonb_build_object(
      'valid', false,
      'message', format('Pedido mínimo de R$ %s para este cupom.', to_char(found_coupon.min_order_value, 'FM999G990D00'))
    );
  end if;

  if found_coupon.discount_type = 'percentage' then
    calculated_discount := round((order_subtotal * found_coupon.discount_value) / 100.0, 2);
  else
    calculated_discount := least(found_coupon.discount_value, order_subtotal);
  end if;

  return jsonb_build_object(
    'valid', true,
    'code', upper(found_coupon.code),
    'discount_type', found_coupon.discount_type,
    'discount_value', found_coupon.discount_value,
    'discount_amount', calculated_discount,
    'description', found_coupon.description
  );
end;
$$;

grant execute on function public.validate_coupon(text, numeric) to anon, authenticated;

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;
alter table public.custom_orders enable row level security;
alter table public.keepalive_heartbeat enable row level security;

-- Leitura pública apenas do catálogo e avaliações aprovadas
create policy "Public read active categories" on public.categories
  for select using (active = true or auth.role() = 'authenticated');

create policy "Public read active products" on public.products
  for select using (active = true or auth.role() = 'authenticated');

create policy "Authenticated manage products" on public.products
  for all to authenticated using (true) with check (true);

create policy "Authenticated manage categories" on public.categories
  for all to authenticated using (true) with check (true);

create policy "Authenticated manage coupons" on public.coupons
  for all to authenticated using (true) with check (true);

create policy "Public read approved reviews" on public.reviews
  for select using (approved = true or auth.role() = 'authenticated');

create policy "Public submit reviews" on public.reviews
  for insert with check (rating between 1 and 5 and char_length(comment) >= 5);

create policy "Public create orders" on public.orders
  for insert with check (total >= 0);

create policy "Authenticated read update orders" on public.orders
  for all to authenticated using (true) with check (true);

create policy "Public create order items" on public.order_items
  for insert with check (quantity > 0);

create policy "Authenticated read order items" on public.order_items
  for select to authenticated using (true);

create policy "Public insert leads" on public.leads
  for insert with check (true);

create policy "Authenticated read leads" on public.leads
  for select to authenticated using (true);

create policy "Public insert custom orders" on public.custom_orders
  for insert with check (true);

create policy "Authenticated manage custom orders" on public.custom_orders
  for all to authenticated using (true) with check (true);

create policy "Public read keepalive" on public.keepalive_heartbeat
  for select using (true);

-- Cupons iniciais
insert into public.coupons (code, description, discount_type, discount_value, min_order_value, active)
values
  ('BEMVINDA10', '10% OFF na sua primeira compra no Ateliê Sueli Crochê', 'percentage', 10, 80, true),
  ('ATELIE5', '5% OFF cumulativo com carinho da Sueli', 'percentage', 5, 0, true),
  ('MIMOSUELI', 'R$ 20 OFF em compras acima de R$ 220', 'fixed', 20, 220, true)
on conflict (code) do nothing;
