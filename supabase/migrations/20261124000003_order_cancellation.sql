-- =============================================================================
-- Ateliê Sueli Crochê — Cancelamento Seguro de Pedido pela Cliente
-- =============================================================================

alter table public.orders
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_at timestamptz;

-- RPC segura para permitir que a própria cliente cancele pedidos ainda não enviados
-- (status 'pending' ou 'paid'), tanto logada quanto informando código + telefone/email
create or replace function public.cancel_customer_order(
  p_order_code text,
  p_reason text default 'Cancelado pela cliente no site',
  p_contact text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_code text := upper(replace(trim(p_order_code), '#', ''));
  clean_digits text := regexp_replace(coalesce(p_contact, ''), '\D', '', 'g');
  current_uid uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  target_order public.orders%rowtype;
  is_authorized boolean := false;
begin
  select * into target_order
  from public.orders o
  where upper(o.order_code) = clean_code
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Pedido não encontrado.');
  end if;

  -- Verifica propriedade: usuário autenticado dono do pedido, admin, ou confirmação de telefone/e-mail
  if current_uid is not null and (
    target_order.user_id = current_uid
    or lower(coalesce(target_order.customer_email, '')) = current_email
    or public.is_store_admin()
  ) then
    is_authorized := true;
  elsif p_contact is not null and (
    lower(coalesce(target_order.customer_email, '')) = lower(trim(p_contact))
    or (
      length(clean_digits) >= 8
      and right(regexp_replace(target_order.customer_phone, '\D', '', 'g'), 8) = right(clean_digits, 8)
    )
  ) then
    is_authorized := true;
  end if;

  if not is_authorized then
    return jsonb_build_object(
      'ok', false,
      'message', 'Confirme o WhatsApp ou e-mail usado na compra para cancelar este pedido.'
    );
  end if;

  if target_order.status = 'cancelled' then
    return jsonb_build_object('ok', true, 'message', 'Este pedido já estava cancelado.');
  end if;

  if target_order.status not in ('pending', 'paid') then
    return jsonb_build_object(
      'ok', false,
      'message', 'Este pedido já entrou em produção ou transporte. Fale com a Sueli no WhatsApp para solicitar o cancelamento.'
    );
  end if;

  update public.orders
  set status = 'cancelled',
      cancellation_reason = coalesce(nullif(trim(p_reason), ''), 'Solicitado pela cliente no site'),
      cancelled_at = now(),
      updated_at = now()
  where id = target_order.id;

  insert into public.order_tracking_events (order_id, status, title, description, location)
  values (
    target_order.id,
    'cancelled',
    'Pedido cancelado pela cliente',
    coalesce(nullif(trim(p_reason), ''), 'Cancelamento realizado pelo painel da loja'),
    'Loja Online — Ateliê Sueli Crochê'
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'cancelled',
    'message', format('Pedido #%s cancelado com sucesso.', target_order.order_code)
  );
end;
$$;

grant execute on function public.cancel_customer_order(text, text, text) to anon, authenticated;
