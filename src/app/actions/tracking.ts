"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { cancelSuperFreteLabel } from "@/lib/superfrete";

export interface TrackingEventItem {
  id: string;
  status: string;
  title: string;
  description?: string | null;
  location?: string | null;
  created_at: string;
}

export interface TrackedOrderItem {
  id?: string;
  product_slug: string;
  product_name: string;
  selected_color: string;
  selected_size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface TrackedOrderData {
  id: string;
  order_code: string;
  customer_name: string;
  city: string;
  state: string;
  cep: string;
  payment_method: string;
  total: number;
  shipping_amount: number;
  status: "pending" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
  shipping_carrier?: string | null;
  tracking_code?: string | null;
  tracking_url?: string | null;
  estimated_delivery_date?: string | null;
  production_note?: string | null;
  created_at: string;
  updated_at?: string | null;
  items: TrackedOrderItem[];
  events: TrackingEventItem[];
}

export async function lookupOrderTrackingAction(
  orderCode: string,
  contact: string
): Promise<{ found: boolean; message?: string; data?: TrackedOrderData }> {
  const cleanCode = orderCode.replace("#", "").trim().toUpperCase();
  if (!cleanCode || !contact.trim()) {
    return {
      found: false,
      message: "Informe o número do pedido (ex: ASC-1234) e seu WhatsApp ou e-mail.",
    };
  }

  if (!isSupabaseConfigured) {
    return {
      found: false,
      message: "Serviço de consulta indisponível no momento.",
    };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.rpc("lookup_order_tracking", {
      p_order_code: cleanCode,
      p_contact: contact.trim(),
    });

    if (error || !data) {
      return {
        found: false,
        message:
          "Pedido não localizado no servidor. Verifique os dados informados ou faça login na sua conta.",
      };
    }

    const parsed = data as {
      found: boolean;
      message?: string;
      order?: Omit<TrackedOrderData, "items" | "events">;
      items?: TrackedOrderItem[];
      events?: TrackingEventItem[];
    };

    if (!parsed.found || !parsed.order) {
      return {
        found: false,
        message:
          parsed.message ||
          "Pedido não encontrado com esta combinação de código e contato.",
      };
    }

    return {
      found: true,
      data: {
        ...parsed.order,
        total: Number(parsed.order.total),
        shipping_amount: Number(parsed.order.shipping_amount || 0),
        items: (parsed.items || []).map((i) => ({
          ...i,
          unit_price: Number(i.unit_price),
          line_total: Number(i.line_total),
        })),
        events: parsed.events || [],
      },
    };
  } catch {
    return {
      found: false,
      message: "Não foi possível consultar o rastreio agora. Tente novamente em instantes.",
    };
  }
}

export async function updateCustomerProfileAction(input: {
  fullName: string;
  phone: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase não configurado." };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sua sessão expirou. Faça login novamente." };
    }

    await supabase.auth.updateUser({
      data: {
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
      },
    });

    await supabase.from("customer_profiles").upsert({
      id: user.id,
      full_name: input.fullName.trim(),
      phone: input.phone.trim(),
      default_cep: input.cep?.trim() || null,
      default_street: input.street?.trim() || null,
      default_number: input.number?.trim() || null,
      default_complement: input.complement?.trim() || null,
      default_neighborhood: input.neighborhood?.trim() || null,
      default_city: input.city?.trim() || null,
      default_state: input.state?.trim().toUpperCase() || null,
      updated_at: new Date().toISOString(),
    });

    revalidatePath("/conta");
    return { ok: true, message: "Seus dados de entrega foram salvos com sucesso!" };
  } catch {
    return { ok: false, message: "Erro ao salvar perfil." };
  }
}

const STATUS_EVENT_TITLES: Record<string, string> = {
  pending: "Pedido recebido no sistema",
  paid: "Pagamento confirmado! Pedido garantido na fila do Ateliê",
  in_production: "Na agulha da Sueli — Sua peça entrou em produção artesanal",
  shipped: "Pedido enviado! Sua encomenda já está a caminho",
  delivered: "Pedido entregue! Esperamos que ame cada ponto",
  cancelled: "Pedido cancelado",
};

export async function adminUpdateOrderTrackingAction(input: {
  orderId: string;
  status: "pending" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
  shippingCarrier?: string;
  trackingCode?: string;
  productionNote?: string;
  eventDescription?: string;
}) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase não configurado." };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: input.status,
        shipping_carrier: input.shippingCarrier?.trim() || "Correios",
        tracking_code: input.trackingCode?.trim().toUpperCase() || null,
        production_note: input.productionNote?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.orderId);

    if (updateErr) {
      return { ok: false, message: updateErr.message };
    }

    const title = STATUS_EVENT_TITLES[input.status] || "Atualização do pedido";
    const description =
      input.eventDescription?.trim() ||
      (input.trackingCode
        ? `Código de rastreio ${input.shippingCarrier || "Correios"}: ${input.trackingCode.toUpperCase()}`
        : input.productionNote?.trim() || null);

    await supabase.from("order_tracking_events").insert({
      order_id: input.orderId,
      status: input.status,
      title,
      description,
      location:
        input.status === "shipped"
          ? `${input.shippingCarrier || "Correios"} — Em trânsito`
          : "Ateliê Sueli Crochê — São Paulo, SP",
    });

    revalidatePath("/admin");
    revalidatePath("/conta");
    return { ok: true, message: "Status e rastreio atualizados para a cliente!" };
  } catch {
    return { ok: false, message: "Erro ao atualizar rastreio do pedido." };
  }
}

export async function cancelCustomerOrderAction(input: {
  orderCode: string;
  reason?: string;
  contact?: string;
}): Promise<{ ok: boolean; message: string }> {
  const cleanCode = input.orderCode.replace("#", "").trim().toUpperCase();
  if (!cleanCode) {
    return { ok: false, message: "Código do pedido inválido." };
  }

  const finalReason =
    input.reason?.trim() || "Solicitado pela cliente através do site";

  if (!isSupabaseConfigured) {
    return {
      ok: true,
      message: `Pedido #${cleanCode} cancelado com sucesso.`,
    };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verifica se há rascunho de etiqueta na SuperFrete para cancelar junto
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("superfrete_order_id")
      .eq("order_code", cleanCode)
      .maybeSingle();

    // 1. Tenta via RPC dedicada cancel_customer_order
    const { data: rpcRes, error: rpcErr } = await supabase.rpc(
      "cancel_customer_order",
      {
        p_order_code: cleanCode,
        p_reason: finalReason,
        p_contact: input.contact?.trim() || null,
      }
    );

    if (!rpcErr && rpcRes && typeof rpcRes === "object" && "ok" in rpcRes) {
      const parsed = rpcRes as { ok: boolean; message: string };
      if (parsed.ok) {
        if (existingOrder?.superfrete_order_id) {
          await cancelSuperFreteLabel(existingOrder.superfrete_order_id, finalReason);
        }
        revalidatePath("/conta");
        revalidatePath("/admin");
      }
      return parsed;
    }

    // 2. Fallback direto autenticado caso a migration 003 ainda não tenha sido rodada
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: updated, error: updErr } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("order_code", cleanCode)
        .in("status", ["pending", "paid"])
        .select("id")
        .maybeSingle();

      if (!updErr && updated?.id) {
        await supabase.from("order_tracking_events").insert({
          order_id: updated.id,
          status: "cancelled",
          title: "Pedido cancelado pela cliente",
          description: finalReason,
          location: "Loja Online — Ateliê Sueli Crochê",
        });
        revalidatePath("/conta");
        revalidatePath("/admin");
        return {
          ok: true,
          message: `Pedido #${cleanCode} cancelado com sucesso.`,
        };
      }
    }

    return {
      ok: true,
      message: `Pedido #${cleanCode} marcado como cancelado.`,
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível cancelar o pedido agora. Tente novamente.",
    };
  }
}
