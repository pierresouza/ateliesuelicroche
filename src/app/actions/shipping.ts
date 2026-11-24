"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import {
  calculateSuperFreteRates,
  checkoutAndPrintSuperFreteLabel,
  createSuperFreteCartLabel,
  getSuperFreteOrderInfo,
  mapSuperFreteStatusToStore,
  type ShippingQuoteOption,
} from "@/lib/superfrete";

export async function quoteShippingAction(input: {
  destinationCep: string;
  subtotal: number;
  items: Array<{ slug: string; quantity: number }>;
  extraProductionDays?: number;
}): Promise<{
  ok: boolean;
  city?: string;
  uf?: string;
  options: ShippingQuoteOption[];
  error?: string;
}> {
  const digits = input.destinationCep.replace(/\D/g, "");
  if (digits.length !== 8) {
    return { ok: false, options: [], error: "Digite um CEP válido com 8 números." };
  }

  let city = "";
  let uf = "";

  try {
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      cache: "force-cache",
    });
    const viaCepData = await viaCepRes.json();
    if (viaCepData?.erro) {
      return { ok: false, options: [], error: "CEP não encontrado." };
    }
    city = viaCepData?.localidade || "";
    uf = viaCepData?.uf || "";
  } catch {
    // Segue apenas com o cálculo SuperFrete caso ViaCEP oscile
  }

  const options = await calculateSuperFreteRates({
    destinationCep: digits,
    subtotal: input.subtotal,
    items: input.items,
    extraProductionDays: input.extraProductionDays ?? 2,
  });

  if (options.length === 0) {
    return {
      ok: false,
      options: [],
      error: "Não encontramos opções de entrega para este CEP.",
    };
  }

  return {
    ok: true,
    city,
    uf,
    options,
  };
}

export async function adminSendOrderToSuperFreteAction(orderId: string): Promise<{
  ok: boolean;
  message: string;
  superfreteOrderId?: string;
  trackingCode?: string;
}> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase não configurado." };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { ok: false, message: "Pedido não localizado no banco." };
    }

    const itemsList = Array.isArray(order.order_items)
      ? order.order_items.map((i: Record<string, unknown>) => ({
          slug: String(i.product_slug || ""),
          name: String(i.product_name || "Tapete de Crochê"),
          quantity: Number(i.quantity || 1),
          unitPrice: Number(i.unit_price || 100),
        }))
      : [{ slug: "", name: "Encomenda Ateliê Sueli Crochê", quantity: 1, unitPrice: Number(order.total) }];

    const result = await createSuperFreteCartLabel({
      orderCode: order.order_code,
      serviceId: Number(order.superfrete_service_id || 2),
      totalValue: Number(order.total),
      recipient: {
        name: order.customer_name,
        cpf: order.customer_cpf || "",
        phone: order.customer_phone,
        email: order.customer_email || undefined,
        cep: order.cep,
        street: order.street,
        number: order.number,
        complement: order.complement || undefined,
        neighborhood: order.neighborhood,
        city: order.city,
        state: order.state,
      },
      items: itemsList,
    });

    if (!result.ok || !result.superfreteOrderId) {
      return { ok: false, message: result.error || "Falha ao enviar para a SuperFrete." };
    }

    await supabase
      .from("orders")
      .update({
        superfrete_order_id: result.superfreteOrderId,
        superfrete_status: result.status || "pending",
        tracking_code: result.trackingCode || order.tracking_code || null,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await supabase.from("order_tracking_events").insert({
      order_id: orderId,
      status: order.status,
      title: "Etiqueta enviada para a SuperFrete",
      description: `Rascunho de envio preparado (ID SuperFrete: ${result.superfreteOrderId.slice(0, 8)}...)`,
      location: "Ateliê Sueli Crochê — São Paulo, SP",
    });

    revalidatePath("/admin");
    revalidatePath("/conta");

    return {
      ok: true,
      superfreteOrderId: result.superfreteOrderId,
      trackingCode: result.trackingCode,
      message:
        "Etiqueta enviada para o Carrinho da SuperFrete com sucesso! Você pode pagá-la no app SuperFrete ou clicar em 'Emitir PDF com Saldo'.",
    };
  } catch {
    return { ok: false, message: "Erro ao comunicar com a SuperFrete." };
  }
}

export async function adminCheckoutSuperFreteLabelAction(orderId: string): Promise<{
  ok: boolean;
  message: string;
  labelUrl?: string;
  trackingCode?: string;
}> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase não configurado." };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: order } = await supabase
      .from("orders")
      .select("id, order_code, status, superfrete_order_id")
      .eq("id", orderId)
      .single();

    if (!order?.superfrete_order_id) {
      return {
        ok: false,
        message: "Envie primeiro o pedido para a SuperFrete antes de emitir a etiqueta.",
      };
    }

    const res = await checkoutAndPrintSuperFreteLabel(order.superfrete_order_id);
    if (!res.ok) {
      return { ok: false, message: res.error || "Não foi possível emitir a etiqueta." };
    }

    await supabase
      .from("orders")
      .update({
        superfrete_status: res.status || "released",
        superfrete_label_url: res.labelUrl || null,
        tracking_code: res.trackingCode || null,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await supabase.from("order_tracking_events").insert({
      order_id: orderId,
      status: order.status,
      title: "Etiqueta de envio emitida!",
      description: res.trackingCode
        ? `Código de rastreio gerado: ${res.trackingCode}`
        : "Etiqueta liberada para impressão e postagem.",
      location: "Ateliê Sueli Crochê — São Paulo, SP",
    });

    revalidatePath("/admin");
    revalidatePath("/conta");

    return {
      ok: true,
      labelUrl: res.labelUrl,
      trackingCode: res.trackingCode,
      message: "Etiqueta emitida com sucesso! Clique em 'Imprimir Etiqueta PDF'.",
    };
  } catch {
    return { ok: false, message: "Erro ao emitir etiqueta na SuperFrete." };
  }
}

export async function syncOrderSuperFreteTrackingAction(orderCode: string): Promise<{
  ok: boolean;
  message: string;
  trackingCode?: string;
  status?: string;
}> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Serviço indisponível." };
  }

  const cleanCode = orderCode.replace("#", "").trim().toUpperCase();

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: order } = await supabase
      .from("orders")
      .select("id, order_code, status, superfrete_order_id, tracking_code")
      .eq("order_code", cleanCode)
      .maybeSingle();

    if (!order?.superfrete_order_id) {
      return {
        ok: false,
        message: "A etiqueta SuperFrete deste pedido ainda está sendo preparada pela Sueli.",
      };
    }

    const sfInfo = await getSuperFreteOrderInfo(order.superfrete_order_id);
    if (!sfInfo.ok || !sfInfo.status) {
      return {
        ok: false,
        message: sfInfo.error || "Não foi possível consultar a SuperFrete agora.",
      };
    }

    const mapped = mapSuperFreteStatusToStore(sfInfo.status);

    await supabase.rpc("process_superfrete_webhook", {
      p_superfrete_id: order.superfrete_order_id,
      p_tracking_code: sfInfo.trackingCode || order.tracking_code || null,
      p_sf_status: sfInfo.status,
      p_mapped_order_status: mapped.storeStatus,
      p_event_title: mapped.title,
      p_event_description: mapped.description,
      p_event_location: sfInfo.carrier || "SuperFrete / Correios",
      p_label_url: sfInfo.labelUrl || null,
      p_event_key: `${order.superfrete_order_id}:sync:${sfInfo.status}:${sfInfo.trackingCode || ""}`,
    });

    revalidatePath("/conta");
    revalidatePath("/admin");

    return {
      ok: true,
      trackingCode: sfInfo.trackingCode || order.tracking_code || undefined,
      status: mapped.storeStatus,
      message: `Rastreio sincronizado com a SuperFrete (${mapped.title})!`,
    };
  } catch {
    return { ok: false, message: "Erro ao sincronizar rastreio com a SuperFrete." };
  }
}
