"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CreditCard,
  Sparkles,
  Truck,
  PackageCheck,
  Copy,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  XCircle,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  cancelCustomerOrderAction,
  type TrackedOrderData,
} from "@/app/actions/tracking";
import { syncOrderSuperFreteTrackingAction } from "@/app/actions/shipping";
import { PixQrCodeBox } from "@/components/checkout/PixQrCodeBox";
import { buildWhatsAppUrl, formatBRL } from "@/lib/constants";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";
import {
  trackCancelOrder,
  trackOrderStatusView,
  trackWhatsAppClick,
} from "@/lib/analytics";

const STEPS = [
  {
    key: "pending",
    label: "Pedido Recebido",
    shortDesc: "Registrado no Ateliê",
    icon: Clock,
  },
  {
    key: "paid",
    label: "Pagamento OK",
    shortDesc: "Garantido na fila",
    icon: CreditCard,
  },
  {
    key: "in_production",
    label: "Na Agulha da Sueli",
    shortDesc: "Tecendo ponto a ponto",
    icon: Sparkles,
  },
  {
    key: "shipped",
    label: "Em Transporte",
    shortDesc: "A caminho do seu lar",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Entregue!",
    shortDesc: "Recebido com carinho",
    icon: PackageCheck,
  },
] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  paid: 1,
  in_production: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Aguardando Pagamento",
    className: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  },
  paid: {
    label: "Pagamento Confirmado",
    className: "bg-pix/15 text-pix border-pix/30",
  },
  in_production: {
    label: "Em Produção Artesanal",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  shipped: {
    label: "Enviado / Em Trânsito",
    className: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  },
  delivered: {
    label: "Entregue",
    className: "bg-pix text-pix-foreground border-transparent",
  },
  cancelled: {
    label: "Pedido Cancelado",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

const CANCEL_REASONS = [
  "Vou refazer o pedido alterando cor ou medida",
  "Vou escolher outra forma de pagamento",
  "Comprei por engano / Desisti da compra",
  "Outro motivo",
];

interface OrderTimelineCardProps {
  order: TrackedOrderData;
  requireContactForCancel?: boolean;
  defaultContact?: string;
  onOrderCancelled?: (orderCode: string, reason: string) => void;
}

export function OrderTimelineCard({
  order: initialOrder,
  requireContactForCancel = false,
  defaultContact = "",
  onOrderCancelled,
}: OrderTimelineCardProps) {
  const [order, setOrder] = useState<TrackedOrderData>(initialOrder);
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(true);
  const [showPixQr, setShowPixQr] = useState(false);

  // Estados do Modal de Cancelamento
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelContact, setCancelContact] = useState(defaultContact);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isCancelling, startCancelTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const activeIndex = STATUS_INDEX[order.status] ?? 0;
  const progressPercent =
    activeIndex <= 0 ? 8 : Math.min(100, Math.round((activeIndex / (STEPS.length - 1)) * 100));
  const statusInfo = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
  const canSelfCancel = order.status === "pending" || order.status === "paid";

  useEffect(() => {
    trackOrderStatusView(order.order_code, order.status);
  }, [order.order_code, order.status]);

  const carrierUrl =
    order.tracking_url ||
    (order.tracking_code
      ? `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(
          order.tracking_code
        )}`
      : null);

  const formattedDate = new Date(order.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleConfirmCancel = () => {
    setCancelError(null);
    startCancelTransition(async () => {
      const res = await cancelCustomerOrderAction({
        orderCode: order.order_code,
        reason: cancelReason,
        contact: cancelContact || undefined,
      });

      if (!res.ok) {
        setCancelError(res.message);
        return;
      }

      // Atualiza também o espelho salvo em localStorage caso exista
      try {
        const raw = window.localStorage.getItem("asc_my_orders_v1");
        if (raw) {
          const list = JSON.parse(raw) as TrackedOrderData[];
          const updated = list.map((item) =>
            item.order_code === order.order_code
              ? {
                  ...item,
                  status: "cancelled" as const,
                  events: [
                    {
                      id: `cancel-${Date.now()}`,
                      status: "cancelled",
                      title: "Pedido cancelado pela cliente",
                      description: cancelReason,
                      location: "Loja Online — Ateliê Sueli Crochê",
                      created_at: new Date().toISOString(),
                    },
                    ...(item.events || []),
                  ],
                }
              : item
          );
          window.localStorage.setItem("asc_my_orders_v1", JSON.stringify(updated));
        }
      } catch {
        // Ignore storage errors
      }

      trackCancelOrder(order.order_code, order.total, cancelReason);

      setOrder((prev) => ({
        ...prev,
        status: "cancelled",
        events: [
          {
            id: `cancel-${Date.now()}`,
            status: "cancelled",
            title: "Pedido cancelado pela cliente",
            description: cancelReason,
            location: "Loja Online — Ateliê Sueli Crochê",
            created_at: new Date().toISOString(),
          },
          ...(prev.events || []),
        ],
      }));

      setCancelDialogOpen(false);
      onOrderCancelled?.(order.order_code, cancelReason);
    });
  };

  return (
    <Card className="rounded-3xl border-border bg-card shadow-soft overflow-hidden">
      <CardContent className="p-0">
        {/* Cabeçalho do Pedido */}
        <div className="p-5 sm:p-6 bg-secondary/40 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-serif text-xl font-bold text-foreground">
                Pedido #{order.order_code}
              </span>
              <Badge variant="outline" className={`font-semibold ${statusInfo.className}`}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Realizado em {formattedDate} • Destino: {order.city}/{order.state} (CEP {order.cep})
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Valor Total</span>
            <span
              className={`text-lg font-extrabold ${
                order.status === "cancelled"
                  ? "line-through text-muted-foreground"
                  : "text-pix"
              }`}
            >
              {formatBRL(order.total)}
            </span>
          </div>
        </div>

        {/* Estado Cancelado */}
        {order.status === "cancelled" ? (
          <div className="p-6 bg-destructive/5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Este pedido foi cancelado
                </p>
                <p className="text-xs text-muted-foreground">
                  Caso já tenha realizado algum pagamento via PIX antes do cancelamento, chame a Sueli no WhatsApp abaixo para estorno imediato.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-gradient-warm rounded-full shrink-0">
              <Link href="/colecao">Fazer Novo Pedido</Link>
            </Button>
          </div>
        ) : (
          /* Linha do Tempo Animada (5 Etapas) */
          <div className="p-5 sm:p-7 space-y-6">
            <div className="relative">
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.85, ease: EASE_ARTISAN }}
                  className="h-full bg-gradient-warm rounded-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: isCurrent ? 1.08 : 1, opacity: 1 }}
                        transition={{ delay: idx * 0.08, duration: 0.35, ease: EASE_ARTISAN }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                          isCompleted
                            ? "bg-gradient-warm text-primary-foreground border-transparent shadow-warm"
                            : "bg-card text-muted-foreground border-border"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{step.shortDesc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botão para abrir QR Code PIX caso ainda esteja aguardando pagamento */}
            {order.status === "pending" && order.payment_method === "pix" && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPixQr((v) => !v)}
                  className="rounded-full border-pix text-pix hover:bg-pix/10 font-bold text-xs"
                >
                  <QrCode className="h-4 w-4 mr-1.5" />
                  {showPixQr
                    ? "Ocultar QR Code PIX"
                    : "Ver QR Code PIX para Pagar Agora"}
                </Button>

                <AnimatePresence>
                  {showPixQr && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <PixQrCodeBox orderCode={order.order_code} amount={order.total} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Nota Carinhosa da Sueli */}
            {order.production_note && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-primary/10 border border-primary/25 p-4 flex items-start gap-3"
              >
                <HeartHandshake className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">
                    Recado da Sueli sobre sua encomenda:
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    &ldquo;{order.production_note}&rdquo;
                  </p>
                </div>
              </motion.div>
            )}

            {/* Box de Código de Rastreio quando postado */}
            {order.tracking_code && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-pix/10 border border-pix/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-pix">
                    Objeto em Trânsito ({order.shipping_carrier || "Correios"})
                  </span>
                  <p className="font-mono text-base font-extrabold text-foreground">
                    {order.tracking_code}
                  </p>
                  {order.estimated_delivery_date && (
                    <p className="text-xs text-muted-foreground">
                      Previsão estimada:{" "}
                      {new Date(order.estimated_delivery_date).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs bg-card"
                    onClick={() => {
                      navigator.clipboard.writeText(order.tracking_code || "");
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2500);
                    }}
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-pix" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copiar Código
                      </>
                    )}
                  </Button>

                  {carrierUrl && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full text-xs bg-pix hover:bg-pix/90 text-pix-foreground"
                    >
                      <a href={carrierUrl} target="_blank" rel="noopener noreferrer">
                        Rastrear na Transportadora
                        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Barra de Ações: Detalhes, WhatsApp e Cancelar Pedido */}
        <div className="px-5 sm:px-6 py-3 bg-secondary/25 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExpandedDetails((v) => !v)}
            className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
          >
            {expandedDetails ? (
              <>
                Ocultar itens e histórico <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Ver peças do pedido e atualizações ({order.items.length}){" "}
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => {
                  setSyncMessage(null);
                  startSyncTransition(async () => {
                    const res = await syncOrderSuperFreteTrackingAction(order.order_code);
                    setSyncMessage(res.message);
                    if (res.ok) {
                      setOrder((prev) => ({
                        ...prev,
                        tracking_code: res.trackingCode || prev.tracking_code,
                        status: (res.status as TrackedOrderData["status"]) || prev.status,
                      }));
                    }
                  });
                }}
                className="text-xs font-semibold text-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Atualizar Rastreio"}
              </button>
            )}

            <a
              href={buildWhatsAppUrl(
                `Olá, Sueli! Estou acompanhando meu pedido *#${order.order_code}* pelo painel do site e gostaria de falar sobre ele.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("order_tracking_card", order.order_code)}
              className="text-xs font-semibold text-[#1da851] inline-flex items-center gap-1 hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Falar com a Sueli
            </a>

            {/* Opção de Cancelamento */}
            {canSelfCancel && (
              <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="text-xs font-semibold text-destructive inline-flex items-center gap-1 hover:underline"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar Pedido
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif text-xl">
                      Deseja cancelar o pedido #{order.order_code}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs leading-relaxed">
                      Como seu pedido ainda não entrou na etapa de produção/envio, você pode cancelá-lo agora mesmo. Selecione o motivo abaixo:
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="space-y-3 py-2">
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium"
                    >
                      {CANCEL_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    {requireContactForCancel && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground">
                          Confirme seu WhatsApp ou E-mail usado na compra:
                        </label>
                        <Input
                          value={cancelContact}
                          onChange={(e) => setCancelContact(e.target.value)}
                          placeholder="+55 11 99999-9999 ou e-mail"
                          className="h-9 text-xs"
                        />
                      </div>
                    )}

                    {cancelError && (
                      <p className="text-xs text-destructive font-medium">{cancelError}</p>
                    )}
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full text-xs">
                      Manter meu Pedido
                    </AlertDialogCancel>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isCancelling}
                      onClick={handleConfirmCancel}
                      className="rounded-full text-xs font-bold"
                    >
                      {isCancelling ? "Cancelando..." : "Sim, Cancelar Pedido"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {(order.status === "in_production" || order.status === "shipped") && (
              <a
                href={buildWhatsAppUrl(
                  `Olá, Sueli! Gostaria de solicitar informações sobre cancelamento/alteração do pedido *#${order.order_code}*.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
              >
                <XCircle className="h-3.5 w-3.5" />
                Solicitar Cancelamento
              </a>
            )}
          </div>
        </div>

        {syncMessage && (
          <div className="px-6 py-2 bg-pix/10 border-t border-border text-xs font-medium text-pix">
            {syncMessage}
          </div>
        )}

        <AnimatePresence initial={false}>
          {expandedDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_ARTISAN }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-6">
                {/* Peças Encomendadas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Peças da Encomenda
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-background border border-border flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <Link
                            href={`/produto/${item.product_slug}`}
                            className="font-bold text-foreground hover:text-primary"
                          >
                            {item.quantity}x {item.product_name}
                          </Link>
                          <p className="text-muted-foreground mt-0.5">
                            Cor: {item.selected_color} • {item.selected_size}
                          </p>
                        </div>
                        <span className="font-bold shrink-0">
                          {formatBRL(item.line_total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico Detalhado de Eventos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Histórico de Movimentações
                  </h4>
                  {order.events && order.events.length > 0 ? (
                    <ol className="relative border-l-2 border-primary/30 ml-2 space-y-4">
                      {order.events.map((ev) => (
                        <li key={ev.id} className="ml-4">
                          <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                          <p className="text-xs font-bold text-foreground">{ev.title}</p>
                          {ev.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {ev.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <span>
                              {new Date(ev.created_at).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {ev.location && (
                              <span className="inline-flex items-center gap-0.5">
                                • <MapPin className="h-3 w-3" /> {ev.location}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Pedido registrado no sistema do Ateliê Sueli Crochê. Assim que houver nova movimentação, ela aparecerá aqui automaticamente!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
