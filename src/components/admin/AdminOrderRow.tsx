"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Printer,
  RefreshCw,
  Save,
  Send,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminUpdateOrderTrackingAction } from "@/app/actions/tracking";
import {
  adminCheckoutSuperFreteLabelAction,
  adminSendOrderToSuperFreteAction,
  syncOrderSuperFreteTrackingAction,
} from "@/app/actions/shipping";
import { formatBRL } from "@/lib/constants";

interface AdminOrderItemProps {
  order: {
    id: string;
    order_code: string;
    customer_name: string;
    customer_cpf?: string | null;
    customer_phone: string;
    customer_email?: string | null;
    total: number | string;
    payment_method: string;
    status: "pending" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
    shipping_carrier?: string | null;
    superfrete_service_name?: string | null;
    superfrete_order_id?: string | null;
    superfrete_label_url?: string | null;
    superfrete_status?: string | null;
    tracking_code?: string | null;
    production_note?: string | null;
    created_at: string;
  };
}

export function AdminOrderRow({ order }: AdminOrderItemProps) {
  const [status, setStatus] = useState(order.status);
  const [carrier, setCarrier] = useState(order.shipping_carrier || "Correios");
  const [trackingCode, setTrackingCode] = useState(order.tracking_code || "");
  const [productionNote, setProductionNote] = useState(order.production_note || "");
  const [sfOrderId, setSfOrderId] = useState(order.superfrete_order_id || "");
  const [labelUrl, setLabelUrl] = useState(order.superfrete_label_url || "");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await adminUpdateOrderTrackingAction({
        orderId: order.id,
        status,
        shippingCarrier: carrier,
        trackingCode,
        productionNote,
      });
      setFeedback({ ok: res.ok, text: res.message });
    });
  };

  const handleSendToSuperFrete = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await adminSendOrderToSuperFreteAction(order.id);
      if (res.superfreteOrderId) setSfOrderId(res.superfreteOrderId);
      if (res.trackingCode) setTrackingCode(res.trackingCode);
      setFeedback({ ok: res.ok, text: res.message });
    });
  };

  const handleEmitLabel = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await adminCheckoutSuperFreteLabelAction(order.id);
      if (res.labelUrl) setLabelUrl(res.labelUrl);
      if (res.trackingCode) setTrackingCode(res.trackingCode);
      setFeedback({ ok: res.ok, text: res.message });
    });
  };

  const handleSyncSuperFrete = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await syncOrderSuperFreteTrackingAction(order.order_code);
      if (res.trackingCode) setTrackingCode(res.trackingCode);
      if (res.status) setStatus(res.status as typeof status);
      setFeedback({ ok: res.ok, text: res.message });
    });
  };

  return (
    <div className="py-5 space-y-3 border-b border-border last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-bold text-foreground">#{order.order_code}</span> —{" "}
          {order.customer_name} ({order.customer_phone})
          {order.customer_cpf && (
            <span className="text-xs text-muted-foreground ml-1.5">
              • CPF: {order.customer_cpf}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {order.superfrete_service_name && (
            <Badge variant="secondary">{order.superfrete_service_name}</Badge>
          )}
          <Badge variant="outline">{order.payment_method}</Badge>
          <strong className="text-pix">{formatBRL(Number(order.total))}</strong>
        </div>
      </div>

      {/* Barra de Automação SuperFrete */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-pix/30 bg-pix/5 px-3.5 py-2.5">
        <div className="text-xs">
          <strong className="text-pix">SuperFrete:</strong>{" "}
          {sfOrderId ? (
            <span className="text-muted-foreground">
              Etiqueta vinculada ({sfOrderId.slice(0, 8)}... • {order.superfrete_status || "ativa"})
            </span>
          ) : (
            <span className="text-muted-foreground">
              Ainda não enviado para a SuperFrete
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!sfOrderId ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleSendToSuperFrete}
              className="h-8 text-xs border-pix text-pix hover:bg-pix hover:text-pix-foreground rounded-full font-semibold"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              1. Enviar p/ SuperFrete
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={handleEmitLabel}
                className="h-8 text-xs border-pix text-pix hover:bg-pix hover:text-pix-foreground rounded-full font-semibold"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Emitir c/ Saldo & PDF
              </Button>

              {labelUrl && (
                <Button
                  asChild
                  size="sm"
                  className="h-8 text-xs bg-pix text-pix-foreground rounded-full font-semibold"
                >
                  <a href={labelUrl} target="_blank" rel="noopener noreferrer">
                    Imprimir Etiqueta
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={handleSyncSuperFrete}
                className="h-8 text-xs rounded-full"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Sincronizar Rastreio
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edição Manual de Etapa / Recado da Sueli */}
      <form
        onSubmit={handleUpdate}
        className="grid sm:grid-cols-12 gap-2.5 items-center bg-secondary/30 p-3 rounded-xl"
      >
        <div className="sm:col-span-3">
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Etapa da Entrega
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full h-9 rounded-md border border-border bg-card px-2.5 text-xs font-semibold"
          >
            <option value="pending">1. Aguardando Pagamento</option>
            <option value="paid">2. Pagamento Confirmado</option>
            <option value="in_production">3. Em Produção (Na Agulha)</option>
            <option value="shipped">4. Enviado / Em Transporte</option>
            <option value="delivered">5. Entregue à Cliente</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Transportadora
          </label>
          <Input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Correios"
            className="h-9 text-xs bg-card"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Código Rastreio
          </label>
          <div className="relative">
            <Truck className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ex: AA123456789BR"
              className="h-9 text-xs pl-8 uppercase font-mono bg-card"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Recado da Sueli p/ Cliente
          </label>
          <div className="flex gap-1.5">
            <Input
              value={productionNote}
              onChange={(e) => setProductionNote(e.target.value)}
              placeholder="Ex: Base do seu tapete já está pronta!"
              className="h-9 text-xs bg-card"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-9 bg-gradient-warm shrink-0"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Salvar
            </Button>
          </div>
        </div>
      </form>

      {feedback && (
        <p
          className={`text-xs font-semibold flex items-center gap-1 ${
            feedback.ok ? "text-pix" : "text-destructive"
          }`}
        >
          {feedback.ok && <CheckCircle2 className="h-3.5 w-3.5" />}
          {feedback.text}
        </p>
      )}
    </div>
  );
}
