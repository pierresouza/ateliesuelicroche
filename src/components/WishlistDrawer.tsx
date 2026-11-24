"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { formatBRL, getPixPrice } from "@/lib/constants";

export function WishlistDrawer() {
  const { items, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            Meus Favoritos ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Heart className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-serif text-lg font-semibold mb-1">
              Nenhum favorito salvo ainda
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Clique no coração das peças que você mais gostar para guardá-las aqui!
            </p>
            <Button
              asChild
              className="bg-gradient-warm rounded-full"
              onClick={() => setIsWishlistOpen(false)}
            >
              <Link href="/colecao">Ver Peças da Sueli</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={68}
                  height={68}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produto/${item.slug}`}
                    onClick={() => setIsWishlistOpen(false)}
                    className="text-sm font-semibold hover:text-primary line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-pix font-bold mt-0.5">
                    {formatBRL(getPixPrice(item.price))} no PIX
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-gradient-warm"
                      onClick={() => {
                        setIsWishlistOpen(false);
                        addToCart({
                          id: item.id,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          category: item.category,
                        });
                      }}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Mover p/ Sacola
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => toggleWishlist(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
