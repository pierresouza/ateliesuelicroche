"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/data/products";
import { formatBRL, getInstallmentInfo, getPixPrice } from "@/lib/constants";
import { trackSelectItem } from "@/lib/analytics";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";

interface ProductCardProps {
  product: Product;
  listName?: string;
}

export function ProductCard({ product, listName = "Catálogo" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isFavorite } = useWishlist();
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const displayImage = activeColor?.image || product.image;
  const fav = isFavorite(product.slug);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const pixPrice = getPixPrice(product.price, product.pixDiscountPercent);
  const installment = getInstallmentInfo(product.price);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.32, ease: EASE_ARTISAN }}
      className="h-full"
    >
      <Card className="group overflow-hidden rounded-2xl border-border bg-card hover:shadow-warm transition-shadow duration-300 flex flex-col h-full">
        <CardContent className="p-0 flex flex-col flex-1">
          {/* Imagem com crossfade suave na troca de cor */}
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
            <Link
              href={`/produto/${product.slug}`}
              onClick={() =>
                trackSelectItem(listName, {
                  item_id: product.slug,
                  item_name: product.name,
                  item_category: product.category,
                  price: product.price,
                })
              }
              className="block w-full h-full relative"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={displayImage}
                  initial={{ opacity: 0.25, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.25 }}
                  transition={{ duration: 0.28, ease: EASE_ARTISAN }}
                  className="absolute inset-0"
                >
                  <Image
                    src={displayImage}
                    alt={`${product.name} - Cor ${activeColor?.name || "Artesanal"}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              </AnimatePresence>
            </Link>

            {/* Selos Superiores */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-[11px] font-bold shadow-sm">
                  -{discount}% OFF
                </Badge>
              )}
              {product.stockQuantity > 0 && !product.isMadeToOrder ? (
                <Badge className="bg-card/90 backdrop-blur text-foreground border border-border text-[11px] font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-pix" />
                  Pronta Entrega
                </Badge>
              ) : (
                <Badge className="bg-card/90 backdrop-blur text-foreground border border-border text-[11px] font-medium inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  Produção {product.productionDays} dias
                </Badge>
              )}
            </div>

            {/* Botão Favorito com micro-interação */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.84 }}
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                })
              }
              aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-sm"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  fav ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            </motion.button>
          </div>

          {/* Conteúdo */}
          <div className="p-4 flex flex-col flex-1 justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {product.category} • {product.room}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {product.rating.toFixed(1)} ({product.reviews})
                </span>
              </div>

              <Link
                href={`/produto/${product.slug}`}
                className="block font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug"
              >
                {product.name}
              </Link>

              {/* Seletor rápido de cores */}
              {product.colors.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {product.colors.map((c, idx) => (
                    <motion.button
                      key={c.name}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.92 }}
                      title={`Ver na cor ${c.name}`}
                      aria-label={`Cor ${c.name}`}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`w-5 h-5 rounded-full border transition-all ${
                        idx === selectedColorIdx
                          ? "ring-2 ring-primary ring-offset-1 scale-110"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <span className="text-[11px] text-muted-foreground ml-1">
                    {activeColor?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Bloco B2C de Preço (PIX + Parcelamento) */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through block">
                    De {formatBRL(product.originalPrice)}
                  </span>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-pix">
                    {formatBRL(pixPrice)}
                  </span>
                  <span className="text-xs font-semibold text-pix">no PIX (-5%)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ou {formatBRL(product.price)} em até{" "}
                  <strong className="text-foreground">{installment.formatted}</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <motion.div className="flex-1" whileTap={{ scale: 0.96 }}>
                  <Button
                    className="w-full bg-gradient-warm text-primary-foreground rounded-full font-semibold shadow-soft hover:shadow-warm transition-all"
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: displayImage,
                        category: product.category,
                        selectedColor: activeColor?.name || "Padrão",
                        selectedSize: product.sizes[0]?.label || product.dimensions,
                      })
                    }
                  >
                    <ShoppingBag className="h-4 w-4 mr-1.5" />
                    Comprar
                  </Button>
                </motion.div>
                <Button asChild variant="outline" className="rounded-full px-3.5 text-xs">
                  <Link href={`/produto/${product.slug}`}>Detalhes</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
