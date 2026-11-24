import { SITE_CONFIG } from "@/lib/constants";
import { getProductBySlugOrId } from "@/data/products";

export interface ShippingQuoteOption {
  serviceId: number;
  serviceName: string;
  carrier: string;
  originalPrice: number;
  price: number;
  isFreeShipping: boolean;
  deliveryDays: number;
  source: "superfrete" | "fallback";
}

export interface PackageSpec {
  weight: number;
  height: number;
  width: number;
  length: number;
}

const SUPERFRETE_BASE_URL =
  process.env.SUPERFRETE_API_URL || "https://api.superfrete.com";
const SUPERFRETE_TOKEN = process.env.SUPERFRETE_TOKEN || "";
const FROM_POSTAL_CODE = (process.env.SUPERFRETE_FROM_POSTAL_CODE || "03968000").replace(
  /\D/g,
  ""
);

function getSuperFreteHeaders() {
  return {
    Authorization: `Bearer ${SUPERFRETE_TOKEN}`,
    "User-Agent": `AtelieSueliCroche/1.0 (${SITE_CONFIG.email})`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export function isSuperFreteConfigured(): boolean {
  return Boolean(SUPERFRETE_TOKEN && FROM_POSTAL_CODE.length === 8);
}

/**
 * Consolida peso e dimensões das peças de crochê dobradas na mesma caixa/embalagem,
 * respeitando limites mínimos e máximos dos Correios/SuperFrete.
 */
export function buildConsolidatedPackage(
  items: Array<{ slug: string; quantity: number }>
): PackageSpec {
  let totalWeight = 0;
  let totalHeight = 0;
  let maxWidth = 22;
  let maxLength = 28;

  for (const item of items) {
    const prod = getProductBySlugOrId(item.slug);
    const qty = Math.max(1, item.quantity);
    const w = prod?.weightKg ?? 1.1;
    const h = prod?.pkgHeightCm ?? 10;
    const width = prod?.pkgWidthCm ?? 28;
    const length = prod?.pkgLengthCm ?? 34;

    totalWeight += w * qty;
    // Peças de crochê são maleáveis e comprimem levemente quando empilhadas
    totalHeight += Math.ceil(h * (qty === 1 ? 1 : 1 + (qty - 1) * 0.7));
    maxWidth = Math.max(maxWidth, width);
    maxLength = Math.max(maxLength, length);
  }

  return {
    weight: Number(Math.min(29.5, Math.max(0.3, totalWeight)).toFixed(2)),
    height: Math.min(60, Math.max(4, totalHeight || 10)),
    width: Math.min(60, Math.max(12, maxWidth)),
    length: Math.min(70, Math.max(18, maxLength)),
  };
}

function buildFallbackOptions(
  destinationCep: string,
  subtotal: number,
  extraProdDays = 2
): ShippingQuoteOption[] {
  const cleanCep = destinationCep.replace(/\D/g, "");
  const isSp = cleanCep.startsWith("0") || cleanCep.startsWith("1");
  const isSudesteSul = /^[0-389]/.test(cleanCep);
  const freeEligible = subtotal >= SITE_CONFIG.freeShippingThreshold;

  const pacPrice = isSp ? 16.9 : isSudesteSul ? 21.9 : 28.9;
  const sedexPrice = isSp ? 22.9 : isSudesteSul ? 34.9 : 48.9;

  return [
    {
      serviceId: 2,
      serviceName: "PAC Econômico",
      carrier: "Correios",
      originalPrice: pacPrice,
      price: freeEligible ? 0 : pacPrice,
      isFreeShipping: freeEligible,
      deliveryDays: (isSp ? 4 : isSudesteSul ? 6 : 9) + extraProdDays,
      source: "fallback",
    },
    {
      serviceId: 1,
      serviceName: "SEDEX Expresso",
      carrier: "Correios",
      originalPrice: sedexPrice,
      price: sedexPrice,
      isFreeShipping: false,
      deliveryDays: (isSp ? 2 : isSudesteSul ? 3 : 5) + extraProdDays,
      source: "fallback",
    },
  ];
}

interface RawSuperFreteQuote {
  id: number;
  name: string;
  price?: string | number;
  discount?: string | number;
  delivery_time?: number;
  has_error?: boolean;
  company?: {
    id?: number;
    name?: string;
  };
}

export async function calculateSuperFreteRates({
  destinationCep,
  subtotal,
  items,
  extraProductionDays = 2,
}: {
  destinationCep: string;
  subtotal: number;
  items: Array<{ slug: string; quantity: number }>;
  extraProductionDays?: number;
}): Promise<ShippingQuoteOption[]> {
  const cleanToCep = destinationCep.replace(/\D/g, "");
  if (cleanToCep.length !== 8) {
    return [];
  }

  if (!isSuperFreteConfigured()) {
    return buildFallbackOptions(cleanToCep, subtotal, extraProductionDays);
  }

  const pkg = buildConsolidatedPackage(items);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);

    const response = await fetch(`${SUPERFRETE_BASE_URL}/api/v0/calculator`, {
      method: "POST",
      headers: getSuperFreteHeaders(),
      signal: controller.signal,
      cache: "no-store",
      body: JSON.stringify({
        from: { postal_code: FROM_POSTAL_CODE },
        to: { postal_code: cleanToCep },
        services: "1,2,17,3",
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: Math.max(50, Number(subtotal.toFixed(2))),
          use_insurance_value: false,
        },
        package: {
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: pkg.weight,
        },
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      return buildFallbackOptions(cleanToCep, subtotal, extraProductionDays);
    }

    const raw = (await response.json()) as RawSuperFreteQuote[];
    if (!Array.isArray(raw)) {
      return buildFallbackOptions(cleanToCep, subtotal, extraProductionDays);
    }

    const valid = raw
      .filter((q) => !q.has_error && Number(q.price) > 0)
      .map((q) => ({
        serviceId: Number(q.id),
        serviceName: q.name || "Entrega Padrão",
        carrier: q.company?.name || "Correios",
        originalPrice: Number(Number(q.price).toFixed(2)),
        price: Number(Number(q.price).toFixed(2)),
        isFreeShipping: false,
        deliveryDays: Number(q.delivery_time || 5) + extraProductionDays,
        source: "superfrete" as const,
      }))
      .sort((a, b) => a.originalPrice - b.originalPrice);

    if (valid.length === 0) {
      return buildFallbackOptions(cleanToCep, subtotal, extraProductionDays);
    }

    // Regra B2C: se subtotal >= R$ 150, a modalidade mais econômica sai com Frete Grátis!
    if (subtotal >= SITE_CONFIG.freeShippingThreshold) {
      valid[0] = {
        ...valid[0],
        price: 0,
        isFreeShipping: true,
      };
    }

    return valid;
  } catch {
    return buildFallbackOptions(cleanToCep, subtotal, extraProductionDays);
  }
}

export interface SuperFreteCartOrderInput {
  orderCode: string;
  serviceId: number;
  totalValue: number;
  recipient: {
    name: string;
    cpf: string;
    phone: string;
    email?: string;
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: Array<{
    slug: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export async function createSuperFreteCartLabel(input: SuperFreteCartOrderInput): Promise<{
  ok: boolean;
  superfreteOrderId?: string;
  trackingCode?: string;
  status?: string;
  error?: string;
}> {
  if (!isSuperFreteConfigured()) {
    return { ok: false, error: "SUPERFRETE_TOKEN não configurado no servidor." };
  }

  const senderDoc = (process.env.SUPERFRETE_SENDER_DOCUMENT || "").replace(/\D/g, "");
  const recipientDoc = (input.recipient.cpf || "").replace(/\D/g, "");

  if (!recipientDoc || recipientDoc.length < 11) {
    return {
      ok: false,
      error: "O pedido precisa ter o CPF da cliente preenchido para gerar etiqueta na SuperFrete.",
    };
  }

  const pkg = buildConsolidatedPackage(
    input.items.map((i) => ({ slug: i.slug, quantity: i.quantity }))
  );

  const payload = {
    from: {
      name: process.env.SUPERFRETE_SENDER_NAME || "Sueli Aparecida de Jesus",
      postal_code: FROM_POSTAL_CODE,
      address: process.env.SUPERFRETE_SENDER_STREET || "Avenida Francisco de Santa Maria",
      number: process.env.SUPERFRETE_SENDER_NUMBER || "844",
      district: process.env.SUPERFRETE_SENDER_DISTRICT || "Jardim Conquista",
      city: process.env.SUPERFRETE_SENDER_CITY || "Sao Paulo",
      state_abbr: process.env.SUPERFRETE_SENDER_STATE || "SP",
      document: senderDoc,
    },
    to: {
      name: input.recipient.name,
      postal_code: input.recipient.cep.replace(/\D/g, ""),
      address: input.recipient.street,
      number: input.recipient.number,
      complement: input.recipient.complement || "",
      district: input.recipient.neighborhood,
      city: input.recipient.city,
      state_abbr: input.recipient.state.toUpperCase(),
      document: recipientDoc,
      email: input.recipient.email || undefined,
    },
    service: input.serviceId || 2,
    products: input.items.map((item) => ({
      name: item.name.slice(0, 60),
      quantity: String(item.quantity),
      unitary_value: String(item.unitPrice.toFixed(2)),
    })),
    volumes: {
      height: pkg.height,
      width: pkg.width,
      length: pkg.length,
      weight: pkg.weight,
    },
    options: {
      insurance_value: Number(input.totalValue.toFixed(2)),
      receipt: false,
      own_hand: false,
      non_commercial: true,
    },
    platform: "Atelie Sueli Croche",
    tag: input.orderCode,
  };

  try {
    const res = await fetch(`${SUPERFRETE_BASE_URL}/api/v0/cart`, {
      method: "POST",
      headers: getSuperFreteHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const errDetail =
        data?.message ||
        (data?.errors ? JSON.stringify(data.errors) : "Falha ao criar etiqueta na SuperFrete.");
      return { ok: false, error: errDetail };
    }

    return {
      ok: true,
      superfreteOrderId: data.id,
      trackingCode: data.tracking || undefined,
      status: data.status || "pending",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro de conexão com a SuperFrete.",
    };
  }
}

export async function checkoutAndPrintSuperFreteLabel(superfreteOrderId: string): Promise<{
  ok: boolean;
  labelUrl?: string;
  trackingCode?: string;
  status?: string;
  error?: string;
}> {
  if (!isSuperFreteConfigured()) {
    return { ok: false, error: "SUPERFRETE_TOKEN não configurado." };
  }

  try {
    const checkoutRes = await fetch(`${SUPERFRETE_BASE_URL}/api/v0/checkout`, {
      method: "POST",
      headers: getSuperFreteHeaders(),
      body: JSON.stringify({ orders: [superfreteOrderId] }),
    });

    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) {
      return {
        ok: false,
        error:
          checkoutData?.message ||
          "Não foi possível emitir com saldo (verifique o saldo da carteira SuperFrete ou pague pelo app SuperFrete).",
      };
    }

    const printRes = await fetch(`${SUPERFRETE_BASE_URL}/api/v0/tag/print`, {
      method: "POST",
      headers: getSuperFreteHeaders(),
      body: JSON.stringify({ orders: [superfreteOrderId] }),
    });
    const printData = await printRes.json();

    const info = await getSuperFreteOrderInfo(superfreteOrderId);

    return {
      ok: true,
      labelUrl: printData?.url || info.labelUrl,
      trackingCode: info.trackingCode,
      status: info.status || "released",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao emitir etiqueta.",
    };
  }
}

export async function getSuperFreteOrderInfo(superfreteOrderId: string): Promise<{
  ok: boolean;
  status?: string;
  trackingCode?: string;
  labelUrl?: string;
  carrier?: string;
  error?: string;
}> {
  if (!isSuperFreteConfigured() || !superfreteOrderId) {
    return { ok: false, error: "ID da etiqueta ausente." };
  }

  try {
    const res = await fetch(
      `${SUPERFRETE_BASE_URL}/api/v0/order/info/${encodeURIComponent(superfreteOrderId)}`,
      {
        method: "GET",
        headers: getSuperFreteHeaders(),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { ok: false, error: "Não foi possível consultar a etiqueta na SuperFrete." };
    }

    const data = await res.json();
    return {
      ok: true,
      status: data?.status,
      trackingCode: data?.tracking || undefined,
      labelUrl: data?.print?.url || undefined,
      carrier: data?.service?.company?.name || "Correios",
    };
  } catch {
    return { ok: false, error: "Erro de rede ao consultar SuperFrete." };
  }
}

export async function cancelSuperFreteLabel(superfreteOrderId: string, reason: string) {
  if (!isSuperFreteConfigured() || !superfreteOrderId) return;
  try {
    await fetch(`${SUPERFRETE_BASE_URL}/api/v0/order/cancel`, {
      method: "POST",
      headers: getSuperFreteHeaders(),
      body: JSON.stringify({
        order: {
          id: superfreteOrderId,
          description: reason.slice(0, 100),
        },
      }),
    });
  } catch {
    // Ignora falha silenciosamente se a etiqueta já tiver sido cancelada ou postada
  }
}

export function mapSuperFreteStatusToStore(sfStatus: string): {
  storeStatus: "pending" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
  title: string;
  description: string;
} {
  const normalized = (sfStatus || "").toLowerCase();
  switch (normalized) {
    case "pending":
      return {
        storeStatus: "in_production",
        title: "Etiqueta preparada na SuperFrete",
        description: "Sua embalagem está sendo preparada pela Sueli para postagem.",
      };
    case "released":
      return {
        storeStatus: "in_production",
        title: "Etiqueta de envio emitida!",
        description: "Código de pré-postagem gerado. Em breve sua caixa será entregue na agência!",
      };
    case "posted":
      return {
        storeStatus: "shipped",
        title: "Encomenda postada na transportadora!",
        description: "Sua peça artesanal já saiu do Ateliê Sueli Crochê rumo à sua casa.",
      };
    case "in_transit":
      return {
        storeStatus: "shipped",
        title: "Encomenda em trânsito",
        description: "Seu pacote está viajando entre as unidades da transportadora.",
      };
    case "out_for_delivery":
      return {
        storeStatus: "shipped",
        title: "Oba! Saiu para entrega ao destinatário",
        description: "Prepare-se: o entregador está a caminho do seu endereço hoje!",
      };
    case "delivered":
      return {
        storeStatus: "delivered",
        title: "Encomenda entregue com sucesso!",
        description: "Seu crochê artesanal chegou! Esperamos que traga muito aconchego para o seu lar.",
      };
    case "canceled":
    case "cancelled":
      return {
        storeStatus: "paid",
        title: "Etiqueta logística cancelada para ajuste",
        description: "Uma nova etiqueta de envio será emitida pelo Ateliê.",
      };
    default:
      return {
        storeStatus: "shipped",
        title: `Atualização logística (${sfStatus})`,
        description: "Nova movimentação registrada pela SuperFrete.",
      };
  }
}
