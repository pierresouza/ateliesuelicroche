import { cookies } from "next/headers";
import Link from "next/link";
import { Activity, Package, ShoppingBag, Sparkles, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminOrderRow } from "@/components/admin/AdminOrderRow";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: orders }, { data: customOrders }, { data: heartbeat }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_code, customer_name, customer_cpf, customer_phone, customer_email, total, payment_method, status, shipping_carrier, superfrete_service_name, superfrete_order_id, superfrete_label_url, superfrete_status, tracking_code, production_note, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("custom_orders")
        .select("id, customer_name, customer_phone, piece_type, desired_dimensions, color_palette, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("keepalive_heartbeat")
        .select("last_ping_at, ping_count")
        .single(),
    ]);

  return (
    <div className="min-h-screen bg-background p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">
              Gestão — Ateliê Sueli Crochê
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize etapas de produção e códigos de rastreio para suas clientes acompanharem no site
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/api/cron/keepalive" target="_blank">
                <Activity className="h-4 w-4 mr-1.5 text-pix" />
                Testar Keep-Alive
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-warm">
              <Link href="/">
                Ver Loja <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Pedidos Recentes</p>
                <p className="text-2xl font-bold">{orders?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Orçamentos Sob Medida</p>
                <p className="text-2xl font-bold">{customOrders?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <Package className="h-8 w-8 text-pix" />
              <div>
                <p className="text-xs text-muted-foreground">Pulsos Keep-Alive</p>
                <p className="text-lg font-bold text-pix">
                  Ativo ({heartbeat?.ping_count ?? 1} pings)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pedidos com Controle de Entrega/Rastreio */}
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold">
              Controle de Produção & Rastreamento das Clientes
            </h2>
            {!orders || orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum pedido registrado ainda (aplique as migrations em{" "}
                <code>supabase/migrations/</code> no SQL Editor do Supabase).
              </p>
            ) : (
              <div>
                {orders.map((order) => (
                  <AdminOrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
