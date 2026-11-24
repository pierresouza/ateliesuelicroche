"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PackageSearch, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrderTimelineCard } from "@/components/orders/OrderTimelineCard";
import {
  lookupOrderTrackingAction,
  type TrackedOrderData,
} from "@/app/actions/tracking";
import { LOCAL_RECENT_ORDERS_KEY } from "@/components/orders/CustomerAccountClient";
import { FadeIn } from "@/components/motion/MotionPrimitives";

export default function QuickTrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<TrackedOrderData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);

    const cleanCode = orderCode.replace("#", "").trim().toUpperCase();

    startTransition(async () => {
      const serverRes = await lookupOrderTrackingAction(cleanCode, contact);
      if (serverRes.found && serverRes.data) {
        setResult(serverRes.data);
        return;
      }

      // Fallback imediato para pedidos recém-gerados salvos no dispositivo da cliente
      try {
        const raw = window.localStorage.getItem(LOCAL_RECENT_ORDERS_KEY);
        if (raw) {
          const localList = JSON.parse(raw) as TrackedOrderData[];
          const matched = localList.find(
            (o) => o.order_code.toUpperCase() === cleanCode
          );
          if (matched) {
            setResult(matched);
            return;
          }
        }
      } catch {
        // Ignore
      }

      setErrorMsg(
        serverRes.message ||
          "Pedido não encontrado. Confira o código (#ASC-XXXX) e seu telefone/e-mail."
      );
    });
  };

  return (
    <div className="container mx-auto py-12 max-w-4xl space-y-8">
      <FadeIn className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <PackageSearch className="h-6 w-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
          Rastrear Minha Encomenda
        </h1>
        <p className="text-sm text-muted-foreground">
          Digite o código do seu pedido (ex: <strong>#ASC-1234</strong>) ou entre na sua conta para ver todos os seus pedidos salvos automaticamente.
        </p>
      </FadeIn>

      <FadeIn delay={0.08} className="max-w-xl mx-auto">
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="trk-code">Código do Pedido *</Label>
                  <Input
                    id="trk-code"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    placeholder="ASC-1234"
                    className="uppercase font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-contact">WhatsApp ou E-mail *</Label>
                  <Input
                    id="trk-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold h-11"
              >
                {isPending ? "Consultando status..." : "Consultar Status e Entrega"}
              </Button>
            </form>

            {errorMsg && (
              <p className="text-xs text-destructive text-center font-medium">{errorMsg}</p>
            )}

            <div className="pt-3 border-t border-border text-center">
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                <Link href="/conta/entrar">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Prefere ver todos os seus pedidos? Entrar na Minha Conta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {result && (
        <FadeIn>
          <OrderTimelineCard
            order={result}
            requireContactForCancel
            defaultContact={contact}
          />
        </FadeIn>
      )}
    </div>
  );
}
