-- =============================================================================
-- Ateliê Sueli Crochê — Catálogo Autêntico (10 Fotos Reais) & Integração SuperFrete
-- =============================================================================

-- 1. Dimensões de pacote dobrado nos produtos (para cálculo real na SuperFrete)
alter table public.products
  add column if not exists weight_kg numeric(6,3) not null default 1.100,
  add column if not exists pkg_height_cm integer not null default 12,
  add column if not exists pkg_width_cm integer not null default 28,
  add column if not exists pkg_length_cm integer not null default 34;

-- 2. Campos de sincronização SuperFrete e CPF do destinatário na tabela orders
alter table public.orders
  add column if not exists customer_cpf text,
  add column if not exists superfrete_service_id integer,
  add column if not exists superfrete_service_name text,
  add column if not exists superfrete_order_id text,
  add column if not exists superfrete_label_url text,
  add column if not exists superfrete_status text,
  add column if not exists last_synced_at timestamptz;

create index if not exists idx_orders_superfrete_id on public.orders (superfrete_order_id);

-- 3. Chave de idempotência para eventos vindos de Webhook da SuperFrete
alter table public.order_tracking_events
  add column if not exists external_event_key text unique;

-- 4. RPC Segura para processar Webhooks da SuperFrete (idempotente)
create or replace function public.process_superfrete_webhook(
  p_superfrete_id text,
  p_tracking_code text,
  p_sf_status text,
  p_mapped_order_status text,
  p_event_title text,
  p_event_description text default null,
  p_event_location text default 'SuperFrete / Transportadora',
  p_label_url text default null,
  p_event_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  dedup_key text := coalesce(p_event_key, p_superfrete_id || ':' || p_sf_status || ':' || coalesce(p_tracking_code, ''));
begin
  select * into target_order
  from public.orders o
  where (p_superfrete_id is not null and o.superfrete_order_id = p_superfrete_id)
     or (p_tracking_code is not null and o.tracking_code = upper(trim(p_tracking_code)))
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'order_not_found');
  end if;

  update public.orders
  set superfrete_status = p_sf_status,
      tracking_code = coalesce(nullif(upper(trim(p_tracking_code)), ''), tracking_code),
      superfrete_label_url = coalesce(nullif(trim(p_label_url), ''), superfrete_label_url),
      status = case
        when target_order.status = 'cancelled' then 'cancelled'
        when p_mapped_order_status in ('pending', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled')
          then p_mapped_order_status
        else target_order.status
      end,
      last_synced_at = now(),
      updated_at = now()
  where id = target_order.id;

  insert into public.order_tracking_events (
    order_id,
    status,
    title,
    description,
    location,
    external_event_key
  )
  values (
    target_order.id,
    coalesce(p_mapped_order_status, target_order.status),
    p_event_title,
    p_event_description,
    p_event_location,
    dedup_key
  )
  on conflict (external_event_key) do nothing;

  return jsonb_build_object(
    'ok', true,
    'order_code', target_order.order_code,
    'new_status', p_mapped_order_status
  );
end;
$$;

grant execute on function public.process_superfrete_webhook(text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- 5. Atualiza catálogo oficial com as 10 peças autênticas fotografadas da Sueli
delete from public.products where image_url like '/images/products/rug-%' or image_url like '/images/products/hero-rug%';

insert into public.products (
  legacy_id, slug, name, description, price, original_price, image_url,
  category, room, dimensions, material, stock_quantity, is_made_to_order,
  production_days, weight_kg, pkg_height_cm, pkg_width_cm, pkg_length_cm,
  featured, bestseller, active
)
values
  ('1', 'tapete-sala-coracoes-relevo-cinza-branco', 'Tapete de Sala Retangular Corações em Relevo Cinza & Branco', 'Peça protagonista assinada com etiqueta artesanal do Ateliê Sueli Crochê: tapete retangular amplo trabalhado em cinza suave com 3 corações centrais em crochê filê e barrado rendado branco.', 189.90, 229.90, '/images/products/sueli-tapete-sala-coracoes-cinza-branco.jpg', 'Retangular', 'Sala', '150cm x 95cm', 'Barbante 100% Algodão nº 8 Encorpado', 3, false, 8, 1.350, 13, 30, 36, true, true, true),
  ('2', 'jogo-quarto-3-tapetes-ovais-areia-marinho', 'Jogo de Quarto 3 Tapetes Ovais Brisa Areia & Azul Marinho', 'Conjunto completo com 3 tapetes ovais coordenados para laterais e pé da cama em areia natural e barrado largo azul marinho com contorno cru.', 219.90, 259.90, '/images/products/sueli-jogo-quarto-oval-areia-marinho.jpg', 'Oval', 'Quarto', '1 Oval Maior (115x75cm) + 2 Laterais (90x60cm)', 'Barbante Algodão Macio nº 6 e nº 8', 3, false, 8, 1.450, 14, 30, 36, true, true, true),
  ('3', 'jogo-banheiro-5-pecas-rubi-areia-caixa-acoplada', 'Jogo de Banheiro Completo Rubi & Areia (5 Peças c/ Caixa Acoplada)', 'Conjunto completo de 5 peças retangulares em vermelho rubi com moldura areia: bancada, saída do box, pé do vaso, tampa do vaso e capa para caixa acoplada.', 229.90, 274.90, '/images/products/sueli-jogo-banheiro-5-pecas-vermelho.jpg', 'Jogo de Banheiro', 'Banheiro', '5 peças coordenadas com caixa acoplada', 'Barbante 100% Algodão Alta Absorção', 4, false, 7, 1.750, 16, 32, 38, true, true, true),
  ('4', 'kit-6-sousplats-mesa-posta-vermelho-verde', 'Kit 6 Sousplats de Crochê Mesa Posta Imperial (Vermelho & Verde)', 'Kit com 6 lugares americanos redondos (38cm de diâmetro cada) confeccionados com base firme e bico rendado clássico da Sueli.', 159.90, 189.90, '/images/products/sueli-kit-sousplat-vermelho-verde.jpg', 'Mesa Posta', 'Mesa Posta', '38cm de diâmetro cada (6 unidades)', 'Fio 100% Algodão nº 6 Macio', 5, false, 5, 0.650, 8, 26, 26, true, true, true),
  ('5', 'kit-capas-liquidificador-batedeira-cafe-areia', 'Kit Capas de Crochê para Liquidificador e Batedeira Café & Areia', 'Dupla encantadora: 1 capa de liquidificador + 1 capa de batedeira tecidas em ponto blocos areia natural e marrom café com etiqueta de madeira Sueli.', 119.90, 145.00, '/images/products/sueli-kit-capas-liquidificador-batedeira.jpg', 'Capas & Cozinha', 'Cozinha', 'Veste liquidificadores e batedeiras padrão', 'Barbante 100% Algodão nº 6', 6, false, 5, 0.550, 8, 22, 28, true, true, true),
  ('6', 'capa-botijao-gas-croche-chevron-preto-cru', 'Capa para Botijão de Gás 13kg em Crochê Chevron Preto & Cru', 'Capa para botijão de 13kg (P13) confeccionada em barbante encorpado preto com saia trabalhada em chevron cru, picô preto e amarração traseira.', 109.90, 134.90, '/images/products/sueli-capa-botijao-preto-cru.jpg', 'Capas & Cozinha', 'Cozinha', 'Padrão Botijão P13 (13kg)', 'Barbante Ecológico nº 6 Alta Firmeza', 5, false, 5, 0.750, 10, 25, 30, true, true, true),
  ('7', 'jogo-passadeira-3-pecas-cinza-preto-jardim-rosa', 'Jogo de Passadeira 3 Peças Jardim Cinza, Preto & Rosa', 'Conjunto oval de 3 peças para cozinhas e corredores: base cinza mescla, moldura preta e trilha central florida em rosa vibrante com folhas verdes.', 199.90, 239.90, '/images/products/sueli-jogo-passadeira-cinza-rosa.jpg', 'Passadeira', 'Cozinha', '1 Passadeira (145x50cm) + 2 Tapetes (72x50cm)', 'Barbante Algodão nº 8', 3, false, 7, 1.600, 15, 30, 38, false, false, true),
  ('8', 'jogo-banheiro-lavanda-real-tranca-tricolor', 'Jogo de Banheiro Lavanda Real com Trança Tricolor', 'Conjunto oval em lilás lavanda com detalhe artesanal trançado em roxo, lilás e branco e tampa do vaso com redinha interna.', 149.90, 179.90, '/images/products/sueli-jogo-banheiro-lavanda-lilas.jpg', 'Jogo de Banheiro', 'Banheiro', 'Tapete Oval 75x52cm + Capa Tampa do Vaso', 'Barbante 100% Algodão Macio', 4, false, 6, 0.900, 10, 26, 32, false, false, true),
  ('9', 'jogo-quarto-passadeira-encanto-pink-lilas', 'Jogo de Quarto 3 Peças Passadeira Encanto Pink & Lilás', 'Conjunto com 1 passadeira longa e 2 tapetes retangulares em rosa pink com moldura em blocos lilás claro e bico coroa.', 209.90, 249.00, '/images/products/sueli-jogo-quarto-passadeira-pink.jpg', 'Passadeira', 'Quarto', '1 Passadeira (150x55cm) + 2 Tapetes (80x52cm)', '100% Algodão Hipoalergênico', 2, false, 7, 1.650, 15, 30, 38, false, false, true),
  ('10', 'passadeira-corredor-classica-cinza-claro-preto', 'Passadeira de Corredor Clássica Cinza Claro & Preto', 'Passadeira alongada em cinza claro com faixas duplas pretas e bico rendado pontiagudo com etiqueta artesanal Sueli.', 154.90, 184.90, '/images/products/sueli-passadeira-corredor-cinza-preto.jpg', 'Passadeira', 'Sala', '160cm x 58cm', 'Barbante Algodão nº 8 Firme', 4, false, 6, 1.250, 12, 28, 35, false, false, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  original_price = excluded.original_price,
  image_url = excluded.image_url,
  category = excluded.category,
  room = excluded.room,
  dimensions = excluded.dimensions,
  material = excluded.material,
  weight_kg = excluded.weight_kg,
  pkg_height_cm = excluded.pkg_height_cm,
  pkg_width_cm = excluded.pkg_width_cm,
  pkg_length_cm = excluded.pkg_length_cm,
  updated_at = now();
