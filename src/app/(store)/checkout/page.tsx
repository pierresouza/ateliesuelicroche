"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  MessageCircle,
  PackageSearch,
  QrCode,
  Tag,
  XCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { PixQrCodeBox } from "@/components/checkout/PixQrCodeBox";
import { LOCAL_RECENT_ORDERS_KEY } from "@/components/orders/CustomerAccountClient";
import {
  cancelCustomerOrderAction,
  type TrackedOrderData,
} from "@/app/actions/tracking";
import {
  createOrderAction,
  validateCouponAction,
  type CreateOrderResponse,
} from "@/app/actions/store";
import { quoteShippingAction } from "@/app/actions/shipping";
import type { ShippingQuoteOption } from "@/lib/superfrete";
import { formatBRL, SITE_CONFIG } from "@/lib/constants";
import { EASE_ARTISAN, FadeIn } from "@/components/motion/MotionPrimitives";
import {
  getStoredUtms,
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackApplyCoupon,
  trackBeginCheckout,
  trackCancelOrder,
  trackPurchase,
  trackWhatsAppClick,
} from "@/lib/analytics";

export default function CheckoutPage() {
  const { items, appliedCoupon, setAppliedCoupon, getSubtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "whatsapp_card">("pix");
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuoteOption | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<CreateOrderResponse | null>(
    null
  );
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = getSubtotal();
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const pixDiscount =
    paymentMethod === "pix"
      ? Number(((afterCoupon * SITE_CONFIG.pixDiscountPercent) / 100).toFixed(2))
      : 0;
  const effectiveShipping = selectedShipping
    ? selectedShipping.price
    : subtotal >= SITE_CONFIG.freeShippingThreshold
    ? 0
    : 0;
  const finalTotal = Number(
    Math.max(0, afterCoupon - pixDiscount + effectiveShipping).toFixed(2)
  );

  useEffect(() => {
    if (items.length > 0 && !orderConfirmation) {
      trackBeginCheckout(
        subtotal,
        items.map((i) => ({
          item_id: i.slug,
          item_name: i.name,
          item_category: i.category,
          item_variant: `${i.selectedColor} - ${i.selectedSize}`,
          price: i.price,
          quantity: i.quantity,
        })),
        appliedCoupon?.code
      );
    }

    try {
      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        setCustomerEmail((prev) => prev || user.email || "");
        setCustomerName((prev) => prev || (user.user_metadata?.full_name as string) || "");
        setCustomerPhone((prev) => prev || (user.user_metadata?.phone as string) || "");

        const { data: prof } = await supabase
          .from("customer_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (prof) {
          if (prof.full_name) setCustomerName((prev) => prev || prof.full_name);
          if (prof.phone) setCustomerPhone((prev) => prev || prof.phone);
          if (prof.default_cep) setCep((prev) => prev || prof.default_cep);
          if (prof.default_street) setStreet((prev) => prev || prof.default_street);
          if (prof.default_number) setNumber((prev) => prev || prof.default_number);
          if (prof.default_complement) setComplement((prev) => prev || prof.default_complement);
          if (prof.default_neighborhood)
            setNeighborhood((prev) => prev || prof.default_neighborhood);
          if (prof.default_city) setCity((prev) => prev || prof.default_city);
          if (prof.default_state) setStateUf((prev) => prev || prof.default_state);
        }
      });
    } catch {
      // Ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCepBlur = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setLoadingShipping(true);
    try {
      const [viaRes, quoteRes] = await Promise.all([
        fetch(`https://viacep.com.br/ws/${digits}/json/`).then((r) => r.json()).catch(() => null),
        quoteShippingAction({
          destinationCep: digits,
          subtotal,
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
        }),
      ]);

      if (viaRes && !viaRes.erro) {
        setStreet(viaRes.logradouro || "");
        setNeighborhood(viaRes.bairro || "");
        setCity(viaRes.localidade || "");
        setStateUf(viaRes.uf || "");
      }

      if (quoteRes.ok && quoteRes.options.length > 0) {
        setShippingOptions(quoteRes.options);
        const defaultOpt = quoteRes.options[0];
        setSelectedShipping(defaultOpt);

        trackAddShippingInfo(
          subtotal,
          `${defaultOpt.serviceName}_${defaultOpt.carrier}`,
          items.map((i) => ({
            item_id: i.slug,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity,
          }))
        );
      }
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleApplyCoupon = () => {
    startTransition(async () => {
      const res = await validateCouponAction(couponInput, subtotal);
      setCouponMsg(res.message);
      if (res.valid && res.code) {
        setAppliedCoupon({
          code: res.code,
          discountAmount: res.discountAmount,
          description: res.description,
        });
        trackApplyCoupon(res.code, res.discountAmount);
        setCouponInput("");
      }
    });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const analyticsItems = items.map((i) => ({
      item_id: i.slug,
      item_name: i.name,
      item_category: i.category,
      item_variant: `${i.selectedColor} - ${i.selectedSize}`,
      price: i.price,
      quantity: i.quantity,
    }));

    trackAddPaymentInfo(finalTotal, paymentMethod, analyticsItems);

    startTransition(async () => {
      const utms = getStoredUtms();
      const result = await createOrderAction({
        customerName,
        customerCpf,
        customerEmail,
        customerPhone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state: stateUf,
        notes,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        shippingAmount: effectiveShipping,
        shippingCarrier: selectedShipping?.carrier || "Correios",
        superfreteServiceId: selectedShipping?.serviceId || 2,
        superfreteServiceName: selectedShipping
          ? `${selectedShipping.serviceName} (${selectedShipping.carrier})`
          : "PAC (Correios)",
        utmSource: utms.utm_source,
        utmMedium: utms.utm_medium,
        utmCampaign: utms.utm_campaign,
        items: items.map((i) => ({
          slug: i.slug,
          name: i.name,
          color: i.selectedColor,
          size: i.selectedSize,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      });

      if (!result.ok) {
        setErrorMsg(result.error || "Não foi possível registrar seu pedido.");
        return;
      }

      trackPurchase({
        transactionId: result.orderCode,
        value: result.total,
        shipping: result.shippingAmount,
        coupon: appliedCoupon?.code,
        paymentType: paymentMethod,
        items: analyticsItems,
      });

      try {
        const snapshot: TrackedOrderData = {
          id: result.orderCode,
          order_code: result.orderCode,
          customer_name: customerName.trim(),
          city: city.trim(),
          state: stateUf.trim().toUpperCase(),
          cep: cep.trim(),
          payment_method: paymentMethod,
          total: result.total,
          shipping_amount: result.shippingAmount,
          status: "pending",
          shipping_carrier: "Correios",
          created_at: new Date().toISOString(),
          items: items.map((i) => ({
            product_slug: i.slug,
            product_name: i.name,
            selected_color: i.selectedColor,
            selected_size: i.selectedSize,
            unit_price: i.price,
            quantity: i.quantity,
            line_total: Number((i.price * i.quantity).toFixed(2)),
          })),
          events: [
            {
              id: `ev-${Date.now()}`,
              status: "pending",
              title: `Pedido #${result.orderCode} registrado no Ateliê Sueli Crochê`,
              description: "Aguardando confirmação do pagamento para iniciar a preparação.",
              location: "Loja Online — Ateliê Sueli Crochê",
              created_at: new Date().toISOString(),
            },
          ],
        };

        const existingRaw = window.localStorage.getItem(LOCAL_RECENT_ORDERS_KEY);
        const existingList = existingRaw ? (JSON.parse(existingRaw) as TrackedOrderData[]) : [];
        window.localStorage.setItem(
          LOCAL_RECENT_ORDERS_KEY,
          JSON.stringify([snapshot, ...existingList].slice(0, 10))
        );
      } catch {
        // Ignore storage errors
      }

      setOrderConfirmation(result);
      clearCart();
    });
  };

  const handleQuickCancelConfirmedOrder = () => {
    if (!orderConfirmation) return;
    startTransition(async () => {
      await cancelCustomerOrderAction({
        orderCode: orderConfirmation.orderCode,
        reason: "Cancelado imediatamente após finalizar checkout",
        contact: customerPhone || customerEmail,
      });

      try {
        const raw = window.localStorage.getItem(LOCAL_RECENT_ORDERS_KEY);
        if (raw) {
          const list = JSON.parse(raw) as TrackedOrderData[];
          window.localStorage.setItem(
            LOCAL_RECENT_ORDERS_KEY,
            JSON.stringify(
              list.map((o) =>
                o.order_code === orderConfirmation.orderCode
                  ? { ...o, status: "cancelled" }
                  : o
              )
            )
          );
        }
      } catch {
        // Ignore
      }

      trackCancelOrder(orderConfirmation.orderCode, orderConfirmation.total, "checkout_immediate_cancel");
      setOrderCancelled(true);
    });
  };

  if (orderConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_ARTISAN }}
        className="container mx-auto py-12 max-w-2xl"
      >
        <Card className="rounded-3xl border-pix/40 shadow-warm overflow-hidden">
          <div
            className={`${
              orderCancelled ? "bg-destructive text-destructive-foreground" : "bg-pix text-pix-foreground"
            } p-6 text-center space-y-2 transition-colors`}
          >
            {orderCancelled ? (
              <XCircle className="h-12 w-12 mx-auto" />
            ) : (
              <CheckCircle2 className="h-12 w-12 mx-auto" />
            )}
            <p className="text-xs uppercase tracking-wider font-semibold opacity-90">
              {orderCancelled ? "Pedido Cancelado" : "Pedido Registrado com Sucesso"}
            </p>
            <h1 className="font-serif text-3xl font-bold">
              Pedido #{orderConfirmation.orderCode}
            </h1>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {orderCancelled ? (
              <div className="text-center space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Seu pedido <strong>#{orderConfirmation.orderCode}</strong> foi cancelado conforme solicitado. Você pode escolher novas peças na vitrine quando quiser!
                </p>
                <Button asChild className="bg-gradient-warm rounded-full px-8">
                  <Link href="/colecao">Voltar para a Coleção</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* QR Code PIX Oficial quando método = PIX */}
                {paymentMethod === "pix" ? (
                  <PixQrCodeBox
                    orderCode={orderConfirmation.orderCode}
                    amount={orderConfirmation.total}
                    pixKey={orderConfirmation.pixKey}
                  />
                ) : (
                  <div className="rounded-2xl bg-secondary/50 p-4 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total no Cartão (até 6x):</span>
                    <strong className="text-xl text-primary">
                      {formatBRL(orderConfirmation.total)}
                    </strong>
                  </div>
                )}

                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    {paymentMethod === "pix"
                      ? `Após pagar pelo QR Code acima, clique abaixo para enviar o comprovante do pedido #${orderConfirmation.orderCode} no WhatsApp da Sueli (${SITE_CONFIG.whatsappDisplay}):`
                      : `Clique abaixo para receber seu link seguro de pagamento em até 6x sem juros direto no WhatsApp da Sueli (${SITE_CONFIG.whatsappDisplay}):`}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full font-bold text-base shadow-lg"
                  >
                    <a
                      href={orderConfirmation.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackWhatsAppClick(
                          "checkout_confirmation",
                          orderConfirmation.orderCode
                        )
                      }
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Enviar Pedido #{orderConfirmation.orderCode} para a Sueli
                    </a>
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <Link href="/conta">
                        <PackageSearch className="h-4 w-4 mr-1.5 text-primary" />
                        Acompanhar Entrega no Site
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={handleQuickCancelConfirmedOrder}
                      className="rounded-full text-xs text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Errei algum dado / Cancelar Pedido
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold">Sua sacola está vazia</h1>
        <Button asChild className="bg-gradient-warm rounded-full">
          <Link href="/colecao">Escolher Produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="h-5 w-5 text-pix" />
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          Finalizar Compra Segura
        </h1>
      </div>

      <FadeIn>
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-8">
          {/* Dados do Cliente e Entrega */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold">1. Seus Dados de Contato</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-name">Nome Completo *</Label>
                    <Input
                      id="chk-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-phone">WhatsApp com DDD *</Label>
                    <Input
                      id="chk-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-cpf">CPF (obrigatório p/ etiqueta Correios) *</Label>
                    <Input
                      id="chk-cpf"
                      value={customerCpf}
                      onChange={(e) => setCustomerCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-email">
                      E-mail (para acompanhar sua entrega no site) *
                    </Label>
                    <Input
                      id="chk-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold">2. Endereço de Entrega</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-cep">CEP *</Label>
                    <Input
                      id="chk-cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="chk-street">Rua / Avenida *</Label>
                    <Input
                      id="chk-street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-num">Número *</Label>
                    <Input
                      id="chk-num"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="chk-comp">Complemento / Apto</Label>
                    <Input
                      id="chk-comp"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-neigh">Bairro *</Label>
                    <Input
                      id="chk-neigh"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-city">Cidade *</Label>
                    <Input
                      id="chk-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chk-uf">UF *</Label>
                    <Input
                      id="chk-uf"
                      value={stateUf}
                      onChange={(e) => setStateUf(e.target.value)}
                      maxLength={2}
                      required
                    />
                  </div>
                </div>

                {loadingShipping && (
                  <p className="text-xs text-primary font-medium">
                    Cotando modalidades de envio na SuperFrete...
                  </p>
                )}

                {shippingOptions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-xs font-bold text-foreground">
                      Escolha a Modalidade de Entrega (SuperFrete):
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {shippingOptions.map((opt) => {
                        const isSelected = selectedShipping?.serviceId === opt.serviceId;
                        return (
                          <button
                            key={opt.serviceId}
                            type="button"
                            onClick={() => setSelectedShipping(opt)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "border-border bg-card hover:bg-secondary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {opt.serviceName} • {opt.carrier}
                              </span>
                              <span className="text-xs font-extrabold text-pix">
                                {opt.price === 0 ? "Grátis" : formatBRL(opt.price)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Até {opt.deliveryDays} dias úteis
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="chk-notes">Observações para a Sueli (opcional)</Label>
                  <Textarea
                    id="chk-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: É para presente, ou observação sobre tom da cor..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-serif text-xl font-bold">3. Forma de Pagamento</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === "pix"
                        ? "border-pix bg-pix/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <QrCode className="h-5 w-5 text-pix" />
                      <span className="text-[11px] font-bold bg-pix text-pix-foreground px-2 py-0.5 rounded-full">
                        5% OFF + QR CODE
                      </span>
                    </div>
                    <p className="font-bold text-sm">PIX com QR Code</p>
                    <p className="text-xs text-muted-foreground">
                      Gera QR Code escaneável + Copia e Cola na hora
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("whatsapp_card")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === "whatsapp_card"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="text-[11px] font-semibold text-primary">
                        ATÉ 6X SEM JUROS
                      </span>
                    </div>
                    <p className="font-bold text-sm">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">
                      Link de pagamento seguro enviado no WhatsApp
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Resumo */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-border sticky top-28 shadow-soft">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold">Resumo da Sua Encomenda</h2>

                <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.variantKey}
                      className="py-2.5 flex justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-muted-foreground">
                          {item.selectedColor} • {item.selectedSize}
                        </p>
                      </div>
                      <span className="font-bold shrink-0">
                        {formatBRL(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {!appliedCoupon && (
                  <div className="flex gap-2 pt-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Cupom BEMVINDA10"
                        className="pl-8 h-9 text-xs uppercase"
                      />
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={handleApplyCoupon}>
                      Aplicar
                    </Button>
                  </div>
                )}
                {couponMsg && <p className="text-xs text-pix">{couponMsg}</p>}

                <div className="space-y-2 text-sm pt-2 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-pix font-medium">
                      <span>Cupom ({appliedCoupon?.code})</span>
                      <span>-{formatBRL(couponDiscount)}</span>
                    </div>
                  )}
                  {pixDiscount > 0 && (
                    <div className="flex justify-between text-pix font-medium">
                      <span>Desconto PIX (5%)</span>
                      <span>-{formatBRL(pixDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span className="font-semibold text-pix">
                      {effectiveShipping === 0 ? "Grátis" : formatBRL(effectiveShipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-pix">{formatBRL(finalTotal)}</span>
                  </div>
                </div>

                {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold text-base shadow-warm"
                >
                  {isPending
                    ? "Gerando Pedido & QR Code..."
                    : paymentMethod === "pix"
                    ? `Gerar QR Code PIX • ${formatBRL(finalTotal)}`
                    : `Confirmar Pedido • ${formatBRL(finalTotal)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
