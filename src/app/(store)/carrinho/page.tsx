"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/lib/constants";
import { trackViewCart } from "@/lib/analytics";
import { EASE_ARTISAN, FadeIn } from "@/components/motion/MotionPrimitives";

export default function CartPage() {
  const {
    items,
    appliedCoupon,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getPixTotal,
    getFreeShippingProgress,
  } = useCart();

  const subtotal = getSubtotal();
  const shipping = getFreeShippingProgress();
  const pixTotal = getPixTotal();

  useEffect(() => {
    if (items.length > 0) {
      trackViewCart(
        subtotal,
        items.map((i) => ({
          item_id: i.slug,
          item_name: i.name,
          item_category: i.category,
          item_variant: `${i.selectedColor} - ${i.selectedSize}`,
          price: i.price,
          quantity: i.quantity,
        }))
      );
    }
  }, [items, subtotal]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16">
        <FadeIn>
          <Card className="max-w-md mx-auto text-center p-10 rounded-3xl">
            <ShoppingBag className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-serif font-bold mb-2">Sua sacola está vazia</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Explore as peças artesanais da Sueli e aproveite 5% OFF no PIX!
            </p>
            <Button asChild className="bg-gradient-warm rounded-full px-8">
              <Link href="/colecao">Ver Coleção</Link>
            </Button>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-6">
        Minha Sacola Artesanal
      </h1>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-secondary/50 border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Truck className="h-4 w-4 text-primary" />
              {shipping.unlocked ? (
                <span className="text-pix font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Você garantiu Frete Grátis neste pedido!
                </span>
              ) : (
                <span>
                  Adicione mais <strong className="text-primary">{formatBRL(shipping.remaining)}</strong> para ganhar <strong>Frete Grátis</strong>!
                </span>
              )}
            </div>
            <Progress value={shipping.percent} className="h-2.5" />
          </div>

          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.variantKey}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, height: 0 }}
                transition={{ duration: 0.28, ease: EASE_ARTISAN }}
              >
                <Card className="rounded-2xl border-border">
                  <CardContent className="p-4 flex gap-4 items-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link
                            href={`/produto/${item.slug}`}
                            className="font-serif text-lg font-bold text-foreground hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cor: <strong>{item.selectedColor}</strong> • Tamanho: {item.selectedSize}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.variantKey)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.variantKey, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.variantKey, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-base font-bold text-foreground">
                          {formatBRL(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <FadeIn delay={0.1} className="lg:col-span-4">
          <Card className="rounded-3xl border-border sticky top-28 shadow-soft">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold">Resumo do Pedido</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-pix font-medium">
                    <span>Cupom ({appliedCoupon.code})</span>
                    <span>-{formatBRL(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span className="text-pix font-semibold">
                    {shipping.unlocked ? "Grátis" : "Calculado no checkout"}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center bg-pix/10 text-pix p-3 rounded-xl">
                  <span className="font-bold text-xs">Total no PIX (-5%)</span>
                  <span className="text-xl font-extrabold">{formatBRL(pixTotal)}</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-warm rounded-full font-bold shadow-warm"
              >
                <Link href="/checkout">
                  Continuar para o Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="ghost" size="sm" onClick={clearCart} className="w-full text-xs">
                Esvaziar sacola
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
