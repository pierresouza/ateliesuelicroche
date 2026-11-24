"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/data/products";
import type { ProductReviewItem } from "@/lib/catalog";
import { submitReviewAction } from "@/app/actions/store";
import { quoteShippingAction } from "@/app/actions/shipping";
import type { ShippingQuoteOption } from "@/lib/superfrete";
import {
  buildWhatsAppUrl,
  formatBRL,
  getInstallmentInfo,
  getPixPrice,
  SITE_CONFIG,
} from "@/lib/constants";
import {
  trackCalculateShipping,
  trackSelectVariant,
  trackViewItem,
  trackWhatsAppClick,
} from "@/lib/analytics";
import { EASE_ARTISAN, FadeIn } from "@/components/motion/MotionPrimitives";

interface ProductDetailClientProps {
  product: Product;
  initialReviews: ProductReviewItem[];
}

export function ProductDetailClient({
  product,
  initialReviews,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isFavorite } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || {
      name: "Padrão",
      hex: "#D4C5B9",
      image: product.image,
    }
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0] || {
      label: "Padrão",
      dimensions: product.dimensions,
      priceDelta: 0,
    }
  );
  const [quantity, setQuantity] = useState(1);

  // Simulador de CEP via SuperFrete
  const [cep, setCep] = useState("");
  const [shippingLocation, setShippingLocation] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteOption[]>([]);
  const [cepError, setCepError] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);

  // Formulário de Avaliação
  const [reviews, setReviews] = useState(initialReviews);
  const [revName, setRevName] = useState("");
  const [revCity, setRevCity] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revSuccess, setRevSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const unitPrice = Number(Math.max(39.9, product.price + selectedSize.priceDelta).toFixed(2));
  const pixPrice = getPixPrice(unitPrice, product.pixDiscountPercent);
  const installment = getInstallmentInfo(unitPrice);
  const fav = isFavorite(product.slug);
  const activeImg = selectedColor.image || product.image;

  useEffect(() => {
    trackViewItem({
      item_id: product.slug,
      item_name: product.name,
      item_category: product.category,
      price: unitPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const handleCalculateCep = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepError("Digite um CEP válido com 8 números.");
      return;
    }

    setLoadingCep(true);
    setCepError(null);
    trackCalculateShipping(digits.slice(0, 5), product.slug);

    const prodDays =
      product.isMadeToOrder || product.stockQuantity === 0
        ? product.productionDays
        : 2;

    const quote = await quoteShippingAction({
      destinationCep: digits,
      subtotal: unitPrice * quantity,
      items: [{ slug: product.slug, quantity }],
      extraProductionDays: prodDays,
    });

    if (!quote.ok) {
      setCepError(quote.error || "Não foi possível cotar o frete.");
      setShippingOptions([]);
    } else {
      setShippingLocation(
        quote.city && quote.uf ? `${quote.city}/${quote.uf}` : `CEP ${digits}`
      );
      setShippingOptions(quote.options);
    }
    setLoadingCep(false);
  };

  const handleAdd = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: unitPrice,
      image: activeImg,
      category: product.category,
      selectedColor: selectedColor.name,
      selectedSize: `${selectedSize.label} (${selectedSize.dimensions})`,
      quantity,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitReviewAction({
        productSlug: product.slug,
        customerName: revName,
        customerCity: revCity,
        rating: revRating,
        comment: revComment,
      });
      if (res.ok) {
        setReviews((prev) => [
          {
            id: `local-${Date.now()}`,
            customer_name: revName,
            customer_city: revCity || "Brasil",
            rating: revRating,
            comment: revComment,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setRevName("");
        setRevCity("");
        setRevComment("");
        setRevSuccess(res.message);
      }
    });
  };

  return (
    <div className="space-y-16 pb-20 lg:pb-0">
      <div className="grid lg:grid-cols-12 gap-10">
        {/* Galeria de Fotos com Crossfade Suave */}
        <FadeIn direction="left" distance={16} className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/4] rounded-3xl overflow-hidden border border-border shadow-warm bg-card">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeImg}
                initial={{ opacity: 0.2, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2 }}
                transition={{ duration: 0.32, ease: EASE_ARTISAN }}
                className="absolute inset-0"
              >
                <Image
                  src={activeImg}
                  alt={`${product.name} na cor ${selectedColor.name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.stockQuantity > 0 && !product.isMadeToOrder ? (
                <Badge className="bg-pix text-pix-foreground font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Pronta Entrega ({product.stockQuantity} un.)
                </Badge>
              ) : (
                <Badge className="bg-primary text-primary-foreground font-semibold">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Produzido pela Sueli em {product.productionDays} dias úteis
                </Badge>
              )}
            </div>
          </div>

          {/* Miniaturas por cor */}
          <div className="grid grid-cols-4 gap-3">
            {product.colors.map((color) => (
              <motion.button
                key={color.name}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedColor(color);
                  trackSelectVariant(product.name, "color", color.name);
                }}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  selectedColor.name === color.name
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={color.image}
                  alt={color.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 inset-x-1 bg-card/90 backdrop-blur text-[10px] font-semibold rounded px-1 py-0.5 truncate">
                  {color.name}
                </span>
              </motion.button>
            ))}
          </div>
        </FadeIn>

        {/* Informações de Compra B2C */}
        <FadeIn direction="right" distance={16} delay={0.05} className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">Ambiente: {product.room}</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < product.rating ? "fill-current" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <a
                href="#avaliacoes"
                className="text-xs font-medium text-muted-foreground hover:text-primary underline"
              >
                {product.rating.toFixed(1)} ({Math.max(product.reviews, reviews.length)} avaliações verificadas)
              </a>
            </div>
          </div>

          {/* Bloco de Preço Ancorado + PIX */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-soft">
            {product.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                De {formatBRL(product.originalPrice + selectedSize.priceDelta)}
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-2.5">
              <motion.span
                key={pixPrice}
                initial={{ opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-3xl sm:text-4xl font-extrabold text-pix"
              >
                {formatBRL(pixPrice)}
              </motion.span>
              <Badge className="bg-pix/15 text-pix hover:bg-pix/20 border-0 font-bold">
                no PIX ({product.pixDiscountPercent}% OFF)
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              ou <strong className="text-foreground">{formatBRL(unitPrice)}</strong> em até{" "}
              <strong className="text-foreground">{installment.formatted}</strong>
            </p>
            {unitPrice >= SITE_CONFIG.freeShippingThreshold && (
              <p className="text-xs font-semibold text-pix flex items-center gap-1 pt-1">
                <Truck className="h-3.5 w-3.5" />
                Esta peça já garante Frete Grátis para todo o Brasil!
              </p>
            )}
          </div>

          {/* Seletor de Cor */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-foreground block">
              1. Escolha a Cor:{" "}
              <span className="text-primary">{selectedColor.name}</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <motion.button
                  key={c.name}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedColor(c);
                    trackSelectVariant(product.name, "color", c.name);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    selectedColor.name === c.name
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/15"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Seletor de Tamanho / Medida */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                2. Escolha o Tamanho:
              </label>
              <Link
                href="/sob-medida"
                className="text-xs text-primary font-semibold hover:underline"
              >
                Precisa de outra medida? Peça sob medida
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {product.sizes.map((sz) => (
                <motion.button
                  key={sz.label}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedSize(sz);
                    trackSelectVariant(product.name, "size", sz.label);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSize.label === sz.label
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-secondary/60"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{sz.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sz.dimensions}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quantidade + Botão Comprar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex items-center justify-between border border-border rounded-full px-4 py-2 bg-card sm:w-32">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="font-bold text-lg px-1"
                aria-label="Diminuir quantidade"
              >
                -
              </button>
              <span className="font-bold text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="font-bold text-lg px-1"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <motion.div className="flex-1" whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                onClick={handleAdd}
                className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold text-base shadow-warm h-12"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar à Sacola • {formatBRL(pixPrice * quantity)}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: unitPrice,
                    image: product.image,
                    category: product.category,
                  })
                }
                aria-label="Favoritar produto"
                className="rounded-full h-12 w-12 shrink-0"
              >
                <Heart className={`h-5 w-5 ${fav ? "fill-primary text-primary" : ""}`} />
              </Button>
            </motion.div>
          </div>

          {/* Botão Dúvida sobre este tapete no WhatsApp */}
          <a
            href={buildWhatsAppUrl(
              `Olá, Sueli! Estou vendo a peça *${product.name}* (Cor: ${selectedColor.name}, Tamanho: ${selectedSize.label}) no site e gostaria de tirar uma dúvida.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("pdp_question", product.slug)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-[#25D366]/50 bg-[#25D366]/10 text-foreground text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-[#1da851]" />
            Quer personalizar a cor desta peça? Fale com a Sueli no WhatsApp
          </a>

          {/* Calculadora de Frete e Prazo (ViaCEP) */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-3">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Simular Frete e Prazo de Entrega
            </p>
            <form onSubmit={handleCalculateCep} className="flex gap-2">
              <Input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="Digite seu CEP (ex: 01310-100)"
                maxLength={9}
                className="bg-card h-9 text-xs"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={loadingCep}
                className="h-9 font-semibold text-xs border border-border"
              >
                {loadingCep ? "Calculando..." : "Calcular"}
              </Button>
            </form>
            {cepError && <p className="text-xs text-destructive">{cepError}</p>}
            <AnimatePresence>
              {shippingOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE_ARTISAN }}
                  className="overflow-hidden space-y-2"
                >
                  {shippingLocation && (
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Opções SuperFrete para {shippingLocation}:
                    </p>
                  )}
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.serviceId}
                      className="bg-card rounded-xl p-3 border border-border text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-foreground">
                          {opt.serviceName} ({opt.carrier})
                        </p>
                        <p className="text-muted-foreground">
                          Entrega em até {opt.deliveryDays} dias úteis
                        </p>
                      </div>
                      <span className="font-bold text-sm text-pix">
                        {opt.price === 0 ? "Frete Grátis" : formatBRL(opt.price)}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detalhes Técnicos & Cuidados */}
          <div className="space-y-3 pt-2 text-sm border-t border-border">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-2 gap-3 bg-card p-4 rounded-2xl border border-border text-xs">
              <div>
                <span className="text-muted-foreground block">Material:</span>
                <strong className="text-foreground">{product.material}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Medidas selecionadas:</span>
                <strong className="text-foreground">{selectedSize.dimensions}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block">Instruções de Lavagem:</span>
                <strong className="text-foreground">{product.careInstructions}</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-card border border-border">
                <Truck className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-semibold block">Frete Grátis</span>
                <span className="text-[11px] text-muted-foreground">Acima R$ 150</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <ShieldCheck className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-semibold block">Garantia Sueli</span>
                <span className="text-[11px] text-muted-foreground">90 dias</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <RotateCcw className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-semibold block">1ª Troca Grátis</span>
                <span className="text-[11px] text-muted-foreground">Até 30 dias</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Seção de Avaliações Verificadas */}
      <FadeIn id="avaliacoes" className="pt-10 border-t border-border grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Avaliações de Clientes ({reviews.length})
          </h2>
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{rev.customer_name}</span>
                    {rev.customer_city && (
                      <span className="text-xs text-muted-foreground">• {rev.customer_city}</span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <form
            onSubmit={handleReviewSubmit}
            className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-soft"
          >
            <h3 className="font-serif text-lg font-bold">Já recebeu sua peça? Avalie!</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                placeholder="Seu nome"
                required
              />
              <Input
                value={revCity}
                onChange={(e) => setRevCity(e.target.value)}
                placeholder="Sua cidade/UF"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>Sua nota:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRevRating(n)}
                  className="text-amber-400"
                >
                  <Star className={`h-5 w-5 ${n <= revRating ? "fill-current" : "text-muted"}`} />
                </button>
              ))}
            </div>
            <Textarea
              value={revComment}
              onChange={(e) => setRevComment(e.target.value)}
              placeholder="Conte o que achou do acabamento, maciez e atendimento da Sueli..."
              rows={3}
              required
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-warm rounded-full font-semibold"
            >
              Enviar Avaliação
            </Button>
            {revSuccess && <p className="text-xs text-pix font-medium">{revSuccess}</p>}
          </form>
        </div>
      </FadeIn>

      {/* Barra Fixa Mobile (Sticky Add-to-Cart) */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: EASE_ARTISAN }}
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-card/95 backdrop-blur border-t border-border p-3 flex items-center justify-between gap-3 shadow-warm"
      >
        <div>
          <span className="block text-[11px] text-muted-foreground">{selectedColor.name}</span>
          <span className="text-base font-extrabold text-pix">{formatBRL(pixPrice)} no PIX</span>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-warm text-primary-foreground rounded-full px-6 font-bold"
        >
          <ShoppingBag className="h-4 w-4 mr-1.5" />
          Comprar Agora
        </Button>
      </motion.div>
    </div>
  );
}
