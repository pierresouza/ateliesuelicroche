"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Sparkles,
  Tag,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/contexts/CartContext";
import { validateCouponAction } from "@/app/actions/store";
import { formatBRL, SITE_CONFIG } from "@/lib/constants";
import { trackApplyCoupon } from "@/lib/analytics";
import { products } from "@/data/products";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    appliedCoupon,
    setAppliedCoupon,
    removeFromCart,
    updateQuantity,
    addToCart,
    getSubtotal,
    getPixTotal,
    getFreeShippingProgress,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = getSubtotal();
  const shippingInfo = getFreeShippingProgress();
  const afterCoupon = Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0));
  const pixTotal = getPixTotal();

  // Sugestão cruzada (upsell) de peça que não está no carrinho
  const upsellProduct = products.find(
    (p) => !items.some((i) => i.slug === p.slug) && p.price <= 140
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await validateCouponAction(couponInput, subtotal);
      setCouponFeedback(result.message);
      if (result.valid && result.code) {
        setAppliedCoupon({
          code: result.code,
          discountAmount: result.discountAmount,
          description: result.description,
        });
        trackApplyCoupon(result.code, result.discountAmount);
        setCouponInput("");
      }
    });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Minha Sacola Artesanal
          </SheetTitle>
        </SheetHeader>

        {/* Barra de Progresso para Frete Grátis */}
        {items.length > 0 && (
          <div className="bg-secondary/60 px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-xs font-medium mb-1.5">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              {shippingInfo.unlocked ? (
                <span className="text-pix font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Parabéns! Você ganhou Frete Grátis!
                </span>
              ) : (
                <span>
                  Faltam{" "}
                  <strong className="text-primary">
                    {formatBRL(shippingInfo.remaining)}
                  </strong>{" "}
                  para ganhar <strong>Frete Grátis</strong>!
                </span>
              )}
            </div>
            <Progress value={shippingInfo.percent} className="h-2" />
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">
              Sua sacola ainda está vazia
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha tapetes, passadeiras ou jogos feitos à mão pela Sueli e aproveite{" "}
              <strong>{SITE_CONFIG.pixDiscountPercent}% OFF no PIX</strong>!
            </p>
            <Button
              asChild
              className="bg-gradient-warm text-primary-foreground rounded-full px-6"
              onClick={() => setIsCartOpen(false)}
            >
              <Link href="/colecao">Explorar Coleção</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de Itens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.variantKey}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.24, ease: EASE_ARTISAN }}
                    className="flex gap-3 p-3 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={72}
                      height={72}
                      className="w-18 h-18 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/produto/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantKey)}
                          aria-label={`Remover ${item.name}`}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cor: <strong className="text-foreground">{item.selectedColor}</strong> •{" "}
                        {item.selectedSize}
                      </p>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-border rounded-full">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantKey, item.quantity - 1)}
                            className="p-1.5 hover:text-primary"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantKey, item.quantity + 1)}
                            className="p-1.5 hover:text-primary"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {formatBRL(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upsell B2C */}
              {upsellProduct && (
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3.5">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Combine também no seu pedido:
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={upsellProduct.image}
                      alt={upsellProduct.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{upsellProduct.name}</p>
                      <p className="text-xs text-pix font-bold">
                        {formatBRL(upsellProduct.price)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        addToCart({
                          id: upsellProduct.id,
                          slug: upsellProduct.slug,
                          name: upsellProduct.name,
                          price: upsellProduct.price,
                          image: upsellProduct.image,
                          category: upsellProduct.category,
                          selectedColor: upsellProduct.colors[0]?.name || "Padrão",
                          selectedSize: upsellProduct.sizes[0]?.label || "Padrão",
                          openDrawer: true,
                        })
                      }
                    >
                      + Levar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo & Cupom */}
            <div className="border-t border-border p-5 bg-card space-y-3">
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Cupom (ex: BEMVINDA10)"
                      className="pl-8 h-9 text-xs uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={isPending}
                    className="h-9 text-xs font-semibold"
                  >
                    Aplicar
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-pix/10 text-pix px-3 py-2 rounded-lg text-xs font-medium">
                  <span>
                    Cupom <strong>{appliedCoupon.code}</strong> (-
                    {formatBRL(appliedCoupon.discountAmount)})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponFeedback(null);
                    }}
                    className="underline text-[11px]"
                  >
                    Remover
                  </button>
                </div>
              )}

              {couponFeedback && !appliedCoupon && (
                <p className="text-[11px] text-muted-foreground">{couponFeedback}</p>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total no Cartão</span>
                  <span>{formatBRL(afterCoupon)}</span>
                </div>
                <div className="flex justify-between items-center bg-pix/10 text-pix px-3 py-2 rounded-lg">
                  <span className="text-xs font-semibold">No PIX (5% OFF extra)</span>
                  <span className="text-base font-bold">{formatBRL(pixTotal)}</span>
                </div>
              </div>

              <div className="grid gap-2 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-warm text-primary-foreground font-semibold shadow-warm rounded-full"
                  onClick={() => setIsCartOpen(false)}
                >
                  <Link href="/checkout">
                    Fechar Pedido Seguro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsCartOpen(false)}
                >
                  <Link href="/carrinho">Ver sacola detalhada</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
