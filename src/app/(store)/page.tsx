import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  Sparkles,
  Percent,
  ArrowRight,
  Star,
  Ruler,
  CheckCircle2,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { InstagramShowcase } from "@/components/InstagramShowcase";
import { StoreJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/MotionPrimitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllProducts } from "@/lib/catalog";
import {
  ROOM_CATEGORIES,
  STORE_FAQS,
  STORE_TESTIMONIALS,
} from "@/data/products";

export const revalidate = 3600;

export default async function HomePage() {
  const allProducts = await getAllProducts();
  const bestsellers = allProducts.filter((p) => p.bestseller || p.featured).slice(0, 6);
  const readyToShip = allProducts.filter((p) => !p.isMadeToOrder && p.stockQuantity > 0).slice(0, 4);

  return (
    <>
      <StoreJsonLd />
      <FaqJsonLd faqs={STORE_FAQS} />

      <Hero />

      {/* Régua de Confiança B2C */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">5% OFF à Vista no PIX</h2>
                <p className="text-xs text-muted-foreground">Ou até 6x sem juros no cartão</p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Frete Grátis Brasil</h2>
                <p className="text-xs text-muted-foreground">Em compras acima de R$ 150,00</p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">100% Algodão Ecológico</h2>
                <p className="text-xs text-muted-foreground">Toque macio, firme e lavável</p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Compra Segura & Garantida</h2>
                <p className="text-xs text-muted-foreground">Atendimento direto com a Sueli</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Compre por Ambiente */}
      <section className="py-16">
        <div className="container mx-auto">
          <FadeIn className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="secondary" className="mb-2">
              Escolha por Ambiente
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
              Um Toque Artesanal para Cada Cômodo
            </h2>
            <p className="text-muted-foreground mt-2">
              Encontre rapidamente o modelo ideal pensado para o espaço da sua casa.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROOM_CATEGORIES.map((room) => (
              <StaggerItem key={room.slug}>
                <Link
                  href={`/colecao?ambiente=${encodeURIComponent(room.slug)}`}
                  className="group relative h-72 rounded-2xl overflow-hidden shadow-soft border border-border block"
                >
                  <Image
                    src={room.image}
                    alt={room.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-card/90 backdrop-blur text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      {room.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-xl font-bold mb-1 group-hover:translate-x-1 transition-transform">
                      {room.title}
                    </h3>
                    <p className="text-xs text-white/85 line-clamp-2">{room.subtitle}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Vitrine Mais Vendidos */}
      <section className="py-16 bg-card border-y border-border/60">
        <div className="container mx-auto">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <Badge className="bg-gradient-warm text-primary-foreground mb-2">
                Favoritos das Clientes
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
                Peças Mais Amadas do Ateliê
              </h2>
              <p className="text-muted-foreground mt-1">
                Modelos campeões de elogios pela firmeza dos pontos e beleza no ambiente.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full shrink-0">
              <Link href="/colecao">
                Ver Todos ({allProducts.length})
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestsellers.map((product) => (
              <StaggerItem key={product.slug}>
                <ProductCard
                  product={product}
                  listName="Home - Mais Amados"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Banner Diferencial B2C: Sob Medida */}
      <section className="py-16">
        <div className="container mx-auto">
          <FadeIn className="rounded-3xl bg-gradient-warm text-primary-foreground p-8 sm:p-12 shadow-warm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1 rounded-full text-xs font-semibold">
                <Ruler className="h-3.5 w-3.5" />
                Exclusividade Artesanal Sueli Crochê
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                Quer um Tapete ou Jogo nas Cores e Medidas Exatas da Sua Casa?
              </h2>
              <p className="text-primary-foreground/90 text-base max-w-2xl">
                A Sueli confecciona sua peça sob encomenda combinando perfeitamente com seu sofá, cortina, bancada ou enxoval. Escolha o formato, informe o tamanho e receba seu orçamento personalizado!
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 font-bold text-foreground shadow-lg hover:scale-105 transition-transform"
              >
                <Link href="/sob-medida">
                  Personalizar Minha Peça
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pronta Entrega Rápida */}
      <section className="pb-16">
        <div className="container mx-auto">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pix">
                Envio Rápido em até 2 dias úteis
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-1">
                Disponíveis à Pronta Entrega
              </h2>
            </div>
            <Button asChild variant="ghost" className="text-primary font-semibold">
              <Link href="/colecao?entrega=pronta">
                Ver toda a Pronta Entrega <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {readyToShip.map((product) => (
              <StaggerItem key={product.slug}>
                <ProductCard
                  product={product}
                  listName="Home - Pronta Entrega"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Vitrine Instagram @atelie_sueli_croche */}
      <InstagramShowcase />

      {/* Depoimentos de Clientes */}
      <section className="py-16">
        <div className="container mx-auto">
          <FadeIn className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="border-primary text-primary mb-2">
              Quem Compra se Apaixona
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
              Carinho que Chega em Cada Caixa
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STORE_TESTIMONIALS.map((item) => (
              <StaggerItem key={item.id} className="h-full">
                <Card className="rounded-2xl border-border bg-card shadow-soft h-full hover:shadow-warm transition-shadow">
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    </div>
                    <div className="pt-3 border-t border-border/60">
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {item.name}
                        <CheckCircle2 className="h-3.5 w-3.5 text-pix" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.city} • {item.productName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Anti-Objeção (com Rich Snippet FAQPage) */}
      <section className="py-16 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-3xl">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              Dúvidas Frequentes
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Tudo o que você precisa saber antes de escolher suas peças artesanais.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {STORE_FAQS.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-border rounded-2xl px-5 bg-background"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
