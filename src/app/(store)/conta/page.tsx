import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { CustomerAccountClient } from "@/components/orders/CustomerAccountClient";
import type { TrackedOrderData, TrackedOrderItem, TrackingEventItem } from "@/app/actions/tracking";

export const metadata: Metadata = {
  title: "Minha Conta & Rastreamento de Pedidos",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  if (!isSupabaseConfigured) {
    redirect("/conta/entrar");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/conta/entrar");
  }

  // Carrega perfil salvo da cliente
  const { data: profileRow } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Carrega pedidos vinculados ao user_id ou e-mail da cliente (protegido via RLS)
  const { data: orderRows } = await supabase
    .from("orders")
    .select("*, order_items(*), order_tracking_events(*)")
    .order("created_at", { ascending: false });

  const formattedOrders: TrackedOrderData[] = (orderRows || []).map((row) => {
    const rawEvents = Array.isArray(row.order_tracking_events)
      ? (row.order_tracking_events as TrackingEventItem[])
      : [];
    rawEvents.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const rawItems = Array.isArray(row.order_items)
      ? (row.order_items as TrackedOrderItem[])
      : [];

    return {
      id: row.id,
      order_code: row.order_code,
      customer_name: row.customer_name,
      city: row.city,
      state: row.state,
      cep: row.cep,
      payment_method: row.payment_method,
      total: Number(row.total),
      shipping_amount: Number(row.shipping_amount || 0),
      status: row.status,
      shipping_carrier: row.shipping_carrier,
      tracking_code: row.tracking_code,
      tracking_url: row.tracking_url,
      estimated_delivery_date: row.estimated_delivery_date,
      production_note: row.production_note,
      created_at: row.created_at,
      updated_at: row.updated_at,
      items: rawItems.map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      })),
      events: rawEvents,
    };
  });

  return (
    <CustomerAccountClient
      initialOrders={formattedOrders}
      profile={{
        fullName:
          profileRow?.full_name ||
          (user.user_metadata?.full_name as string) ||
          "",
        email: user.email || "",
        phone:
          profileRow?.phone ||
          (user.user_metadata?.phone as string) ||
          "",
        cep: profileRow?.default_cep || "",
        street: profileRow?.default_street || "",
        number: profileRow?.default_number || "",
        complement: profileRow?.default_complement || "",
        neighborhood: profileRow?.default_neighborhood || "",
        city: profileRow?.default_city || "",
        state: profileRow?.default_state || "",
      }}
    />
  );
}
