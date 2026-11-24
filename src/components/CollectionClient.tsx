"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/products";
import { trackFilterApplied, trackViewItemList } from "@/lib/analytics";
import { EASE_ARTISAN, FadeIn } from "@/components/motion/MotionPrimitives";

const CATEGORIES = [
  "Todos",
  "Retangular",
  "Oval",
  "Passadeira",
  "Jogo de Banheiro",
  "Capas & Cozinha",
  "Mesa Posta",
];

const ROOMS = ["Todos", "Sala", "Quarto", "Cozinha", "Banheiro", "Mesa Posta"];

export function CollectionClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("categoria") || "Todos";
  const selectedRoom = searchParams.get("ambiente") || "Todos";
  const deliveryFilter = searchParams.get("entrega") || "todos";
  const sortBy = searchParams.get("ordem") || "relevancia";
  const searchQuery = searchParams.get("q") || "";

  const updateParam = (key: string, value: string, defaultVal = "Todos") => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === defaultVal) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    trackFilterApplied(key, value);
    router.push(`/colecao?${params.toString()}`, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (selectedCategory !== "Todos") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (selectedRoom !== "Todos") {
      list = list.filter((p) => p.room === selectedRoom);
    }
    if (deliveryFilter === "pronta") {
      list = list.filter((p) => !p.isMadeToOrder && p.stockQuantity > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.room.toLowerCase().includes(q)
      );
    }

    if (sortBy === "menor-preco") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "maior-preco") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "maior-desconto") {
      const disc = (p: Product) =>
        p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0;
      list.sort((a, b) => disc(b) - disc(a));
    }

    return list;
  }, [initialProducts, selectedCategory, selectedRoom, deliveryFilter, sortBy, searchQuery]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      trackViewItemList(
        "collection_grid",
        `Coleção - ${selectedCategory}`,
        filteredProducts.slice(0, 12).map((p) => ({
          item_id: p.slug,
          item_name: p.name,
          item_category: p.category,
          price: p.price,
        }))
      );
    }
  }, [filteredProducts, selectedCategory]);

  const hasActiveFilters =
    selectedCategory !== "Todos" ||
    selectedRoom !== "Todos" ||
    deliveryFilter !== "todos" ||
    Boolean(searchQuery);

  return (
    <div className="space-y-8">
      {/* Barra de Filtros B2C */}
      <FadeIn className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filtrar por Formato / Peça:
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-muted-foreground">
              Ordenar:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => updateParam("ordem", e.target.value, "relevancia")}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="relevancia">Mais Amados</option>
              <option value="menor-preco">Menor Preço</option>
              <option value="maior-preco">Maior Preço</option>
              <option value="maior-desconto">Maior Desconto</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <motion.div key={cat} whileTap={{ scale: 0.94 }}>
              <Badge
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => updateParam("categoria", cat, "Todos")}
                className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                  selectedCategory === cat
                    ? "bg-gradient-warm text-primary-foreground border-transparent"
                    : "hover:bg-secondary"
                }`}
              >
                {cat}
              </Badge>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Ambiente:</span>
            {ROOMS.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => updateParam("ambiente", room, "Todos")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedRoom === room
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {room}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              updateParam(
                "entrega",
                deliveryFilter === "pronta" ? "todos" : "pronta",
                "todos"
              )
            }
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              deliveryFilter === "pronta"
                ? "bg-pix text-pix-foreground border-pix"
                : "border-border text-foreground hover:bg-secondary"
            }`}
          >
            Somente Pronta Entrega
          </button>
        </div>
      </FadeIn>

      {/* Status de Resultados */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Exibindo <strong className="text-foreground">{filteredProducts.length}</strong>{" "}
          {filteredProducts.length === 1 ? "peça artesanal" : "peças artesanais"}
          {searchQuery && (
            <>
              {" "}
              para &ldquo;<strong className="text-foreground">{searchQuery}</strong>&rdquo;
            </>
          )}
        </p>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/colecao")}
            className="text-xs text-primary h-8"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Grade de Produtos com transição suave de filtragem */}
      {filteredProducts.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.32, ease: EASE_ARTISAN }}
              >
                <ProductCard
                  product={product}
                  listName="Página de Coleção"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <FadeIn className="rounded-3xl border border-border bg-card p-12 text-center max-w-xl mx-auto space-y-4">
          <Sparkles className="h-10 w-10 text-primary mx-auto" />
          <h2 className="font-serif text-2xl font-bold">
            Não achou exatamente essa combinação?
          </h2>
          <p className="text-sm text-muted-foreground">
            A Sueli produz tapetes, passadeiras e jogos sob encomenda na cor e medida que você imaginar!
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild className="bg-gradient-warm rounded-full">
              <Link href="/sob-medida">Pedir Sob Medida</Link>
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => router.push("/colecao")}>
              Ver Todo o Catálogo
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
