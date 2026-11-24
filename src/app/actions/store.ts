"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { SITE_CONFIG, buildWhatsAppUrl, formatBRL } from "@/lib/constants";

export interface CouponResult {
  valid: boolean;
  code?: string;
  discountAmount: number;
  description?: string;
  message: string;
}

const LOCAL_COUPONS: Record<
  string,
  { type: "percentage" | "fixed"; value: number; minOrder: number; description: string }
> = {
  BEMVINDA10: {
    type: "percentage",
    value: 10,
    minOrder: 80,
    description: "10% OFF de primeira compra no Ateliê Sueli Crochê",
  },
  ATELIE5: {
    type: "percentage",
    value: 5,
    minOrder: 0,
    description: "5% OFF especial seguidores @atelie_sueli_croche",
  },
  MIMOSUELI: {
    type: "fixed",
    value: 20,
    minOrder: 220,
    description: "R$ 20 OFF em compras acima de R$ 220",
  },
};

export async function validateCouponAction(
  rawCode: string,
  subtotal: number
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discountAmount: 0, message: "Digite um código de cupom." };
  }

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code: code,
        order_subtotal: subtotal,
      });

      if (!error && data && typeof data === "object" && "valid" in data) {
        const res = data as {
          valid: boolean;
          code?: string;
          discount_amount?: number;
          description?: string;
          message?: string;
        };
        if (res.valid) {
          return {
            valid: true,
            code: res.code || code,
            discountAmount: Number(res.discount_amount || 0),
            description: res.description,
            message: res.description || `Cupom ${code} aplicado!`,
          };
        }
        return {
          valid: false,
          discountAmount: 0,
          message: res.message || "Cupom inválido ou expirado.",
        };
      }
    } catch {
      // Continua para validação fallback
    }
  }

  const fallback = LOCAL_COUPONS[code];
  if (!fallback) {
    return { valid: false, discountAmount: 0, message: "Cupom não encontrado ou expirado." };
  }

  if (subtotal < fallback.minOrder) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Pedido mínimo de ${formatBRL(fallback.minOrder)} para usar o cupom ${code}.`,
    };
  }

  const discountAmount =
    fallback.type === "percentage"
      ? Number(((subtotal * fallback.value) / 100).toFixed(2))
      : Math.min(fallback.value, subtotal);

  return {
    valid: true,
    code,
    discountAmount,
    description: fallback.description,
    message: `${fallback.description} aplicado!`,
  };
}

export interface CreateOrderInput {
  customerName: string;
  customerCpf?: string;
  customerEmail?: string;
  customerPhone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  notes?: string;
  paymentMethod: "pix" | "whatsapp_card";
  couponCode?: string;
  shippingAmount: number;
  shippingCarrier?: string;
  superfreteServiceId?: number;
  superfreteServiceName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  items: Array<{
    slug: string;
    name: string;
    color: string;
    size: string;
    unitPrice: number;
    quantity: number;
  }>;
}

export interface CreateOrderResponse {
  ok: boolean;
  orderCode: string;
  total: number;
  subtotal: number;
  couponDiscount: number;
  pixDiscount: number;
  shippingAmount: number;
  pixKey: string;
  whatsappUrl: string;
  savedInDatabase: boolean;
  error?: string;
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  if (!input.items || input.items.length === 0) {
    return {
      ok: false,
      orderCode: "",
      total: 0,
      subtotal: 0,
      couponDiscount: 0,
      pixDiscount: 0,
      shippingAmount: 0,
      pixKey: SITE_CONFIG.pixKey,
      whatsappUrl: "",
      savedInDatabase: false,
      error: "Seu carrinho está vazio.",
    };
  }

  const subtotal = Number(
    input.items
      .reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
      .toFixed(2)
  );

  let couponDiscount = 0;
  let validCouponCode: string | undefined;
  if (input.couponCode) {
    const couponCheck = await validateCouponAction(input.couponCode, subtotal);
    if (couponCheck.valid) {
      couponDiscount = couponCheck.discountAmount;
      validCouponCode = couponCheck.code;
    }
  }

  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const pixDiscount =
    input.paymentMethod === "pix"
      ? Number(((afterCoupon * SITE_CONFIG.pixDiscountPercent) / 100).toFixed(2))
      : 0;

  // Se a cliente escolheu upgrade expresso (ex: SEDEX pago mesmo acima de R$ 150), respeita o valor da modalidade escolhida;
  // caso contrário, pedidos >= R$ 150 na modalidade econômica saem grátis.
  const isExpressUpgrade =
    input.superfreteServiceId === 1 && input.shippingAmount > 0;
  const shippingAmount = isExpressUpgrade
    ? Math.max(0, input.shippingAmount)
    : subtotal >= SITE_CONFIG.freeShippingThreshold
    ? 0
    : Math.max(0, input.shippingAmount);

  const total = Number(
    Math.max(0, afterCoupon - pixDiscount + shippingAmount).toFixed(2)
  );

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `ASC-${randomSuffix}`;

  let savedInDatabase = false;

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_code: orderCode,
          user_id: user?.id || null,
          customer_name: input.customerName.trim(),
          customer_cpf: input.customerCpf?.replace(/\D/g, "") || null,
          customer_email: (input.customerEmail?.trim() || user?.email || null),
          customer_phone: input.customerPhone.trim(),
          cep: input.cep.trim(),
          street: input.street.trim(),
          number: input.number.trim(),
          complement: input.complement?.trim() || null,
          neighborhood: input.neighborhood.trim(),
          city: input.city.trim(),
          state: input.state.trim().toUpperCase(),
          notes: input.notes?.trim() || null,
          payment_method: input.paymentMethod,
          coupon_code: validCouponCode || null,
          subtotal,
          discount_amount: couponDiscount,
          pix_discount_amount: pixDiscount,
          shipping_amount: shippingAmount,
          shipping_carrier: input.shippingCarrier || "Correios",
          superfrete_service_id: input.superfreteServiceId || 2,
          superfrete_service_name: input.superfreteServiceName || "PAC",
          total,
          status: "pending",
          utm_source: input.utmSource || null,
          utm_medium: input.utmMedium || null,
          utm_campaign: input.utmCampaign || null,
        })
        .select("id")
        .single();

      if (!orderError && orderRow?.id) {
        const itemsPayload = input.items.map((item) => ({
          order_id: orderRow.id,
          product_slug: item.slug,
          product_name: item.name,
          selected_color: item.color,
          selected_size: item.size,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: Number((item.unitPrice * item.quantity).toFixed(2)),
        }));

        await supabase.from("order_items").insert(itemsPayload);

        // Cria o evento inicial da linha do tempo de acompanhamento da cliente
        await supabase.from("order_tracking_events").insert({
          order_id: orderRow.id,
          status: "pending",
          title: `Pedido #${orderCode} registrado no Ateliê Sueli Crochê`,
          description:
            input.paymentMethod === "pix"
              ? "Aguardando confirmação do PIX para iniciar a separação/produção das suas peças."
              : "Aguardando confirmação do pagamento via Cartão para iniciar sua encomenda.",
          location: "Loja Online — Ateliê Sueli Crochê",
        });

        savedInDatabase = true;
      }
    } catch {
      savedInDatabase = false;
    }
  }

  const itemsText = input.items
    .map(
      (i, idx) =>
        `${idx + 1}. *${i.name}*\n   Cor: ${i.color} | Medida: ${i.size}\n   Qtd: ${i.quantity}x — ${formatBRL(i.unitPrice * i.quantity)}`
    )
    .join("\n\n");

  const paymentLabel =
    input.paymentMethod === "pix"
      ? `PIX com 5% OFF (Chave: ${SITE_CONFIG.pixKey})`
      : "Cartão de Crédito (Link de Pagamento até 6x sem juros)";

  const whatsappMessage = [
    `Olá, Sueli! Acabei de gerar o pedido *#${orderCode}* no site do *Ateliê Sueli Crochê*!`,
    ``,
    `*Itens do Pedido:*`,
    itemsText,
    ``,
    `*Resumo:*`,
    `Subtotal: ${formatBRL(subtotal)}`,
    validCouponCode ? `Cupom (${validCouponCode}): -${formatBRL(couponDiscount)}` : null,
    pixDiscount > 0 ? `Desconto PIX (5%): -${formatBRL(pixDiscount)}` : null,
    `Frete (${input.superfreteServiceName || "SuperFrete"}): ${shippingAmount === 0 ? "Grátis" : formatBRL(shippingAmount)}`,
    `*Total Final: ${formatBRL(total)}*`,
    ``,
    `*Forma de Pagamento:* ${paymentLabel}`,
    `*Entrega:* ${input.street}, ${input.number}${input.complement ? ` (${input.complement})` : ""} - ${input.neighborhood}, ${input.city}/${input.state} - CEP ${input.cep}`,
    input.notes ? `*Observações:* ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ok: true,
    orderCode,
    total,
    subtotal,
    couponDiscount,
    pixDiscount,
    shippingAmount,
    pixKey: SITE_CONFIG.pixKey,
    whatsappUrl: buildWhatsAppUrl(whatsappMessage),
    savedInDatabase,
  };
}

export async function subscribeLeadAction(data: {
  name?: string;
  email?: string;
  phone?: string;
  utmSource?: string;
}) {
  if (!data.email && !data.phone) {
    return { ok: false, message: "Informe seu WhatsApp ou e-mail para liberar o cupom." };
  }

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      await supabase.from("leads").insert({
        name: data.name?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        source: "first_purchase_coupon",
        utm_source: data.utmSource || null,
      });
    } catch {
      // Continua entregando o cupom ao cliente
    }
  }

  return {
    ok: true,
    coupon: SITE_CONFIG.firstPurchaseCoupon,
    message: `Cupom ${SITE_CONFIG.firstPurchaseCoupon} liberado! Use no carrinho para ganhar 10% OFF.`,
  };
}

export async function submitCustomOrderAction(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pieceType: string;
  room: string;
  desiredDimensions: string;
  colorPalette: string;
  notes?: string;
}) {
  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      await supabase.from("custom_orders").insert({
        customer_name: data.customerName.trim(),
        customer_phone: data.customerPhone.trim(),
        customer_email: data.customerEmail?.trim() || null,
        piece_type: data.pieceType,
        room: data.room,
        desired_dimensions: data.desiredDimensions.trim(),
        color_palette: data.colorPalette.trim(),
        notes: data.notes?.trim() || null,
      });
    } catch {
      // Continua com envio ao WhatsApp da Sueli
    }
  }

  const msg = [
    `Olá, Sueli! Vim pelo site do *Ateliê Sueli Crochê* e gostaria de um orçamento *Sob Medida*:`,
    ``,
    `• *Nome:* ${data.customerName}`,
    `• *Tipo de Peça:* ${data.pieceType}`,
    `• *Ambiente:* ${data.room}`,
    `• *Medidas desejadas:* ${data.desiredDimensions}`,
    `• *Cores de preferência:* ${data.colorPalette}`,
    data.notes ? `• *Detalhes extras:* ${data.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ok: true,
    whatsappUrl: buildWhatsAppUrl(msg),
  };
}

export async function submitReviewAction(data: {
  productSlug: string;
  customerName: string;
  customerCity?: string;
  rating: number;
  comment: string;
}) {
  if (!data.customerName.trim() || data.comment.trim().length < 5) {
    return { ok: false, message: "Escreva seu nome e um comentário com pelo menos 5 caracteres." };
  }

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      await supabase.from("reviews").insert({
        product_slug: data.productSlug,
        customer_name: data.customerName.trim(),
        customer_city: data.customerCity?.trim() || null,
        rating: Math.min(5, Math.max(1, data.rating)),
        comment: data.comment.trim(),
        approved: true,
      });
      revalidatePath(`/produto/${data.productSlug}`);
    } catch {
      // Ignora erro caso tabela ainda não tenha sido migrada
    }
  }

  return {
    ok: true,
    message: "Muito obrigada pelo carinho! Sua avaliação foi enviada para o Ateliê Sueli Crochê.",
  };
}
