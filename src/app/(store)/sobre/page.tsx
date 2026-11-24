import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles, Award, Instagram, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/MotionPrimitives";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Conheça a Sueli & a História do Nosso Ateliê",
  description:
    "Conheça a história da artesã Sueli e do Ateliê Sueli Crochê (@atelie_sueli_croche): mais de 15 anos transformando barbante 100% algodão em peças únicas para lares de todo o Brasil.",
  alternates: {
    canonical: "/sobre",
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Início", path: "/" },
          { name: "Sobre a Sueli", path: "/sobre" },
        ]}
      />

      {/* Hero Sobre a Sueli */}
      <section className="bg-gradient-subtle py-14 lg:py-20 border-b border-border/60">
        <div className="container mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <FadeIn direction="left" className="lg:col-span-7 space-y-5">
            <Badge className="bg-gradient-warm text-primary-foreground">
              {SITE_CONFIG.instagramHandle}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground leading-tight">
              Muito Prazer, Aqui Cada Peça Nasce das{" "}
              <span className="text-primary italic">Mãos e do Coração da Sueli</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              O <strong className="text-foreground">{SITE_CONFIG.name}</strong> nasceu da paixão da artesã{" "}
              <strong className="text-foreground">Sueli Aparecida de Jesus</strong> pela arte tradicional do crochê brasileiro. Diretamente do seu ateliê na Zona Leste de São Paulo, o que começou vestindo a casa da família evoluiu para levar calor humano, beleza e durabilidade para centenas de lares em todo o país.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="bg-gradient-warm rounded-full font-semibold">
                <Link href="/colecao">
                  Conhecer a Coleção
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4 mr-2 text-primary" />
                  Ver Bastidores no Instagram
                </a>
              </Button>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.1} className="lg:col-span-5">
            <div className="relative aspect-[4/4] rounded-3xl overflow-hidden shadow-warm border-4 border-card">
              <Image
                src="/images/products/sueli-tapete-sala-coracoes-cinza-branco.jpg"
                alt="Tapete artesanal com etiqueta Ateliê Sueli Crochê"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Diferenciais do Crochê da Sueli */}
      <section className="py-16">
        <div className="container mx-auto">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              Por Que o Crochê da Sueli é Diferente?
            </h2>
            <p className="text-muted-foreground mt-2">
              Quem já comprou sabe: um tapete artesanal bem estruturado dura anos mantendo o formato e a vivacidade das cores.
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            <StaggerItem>
              <Card className="rounded-2xl border-border shadow-soft h-full hover:shadow-warm transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <Sparkles className="h-9 w-9 text-primary" />
                  <h3 className="font-serif text-xl font-bold">Pontos Calibrados</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tensão uniforme do início ao bico final para que a peça fique retinha no chão, sem embabadar e sem levantar as bordas.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="rounded-2xl border-border shadow-soft h-full hover:shadow-warm transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <Award className="h-9 w-9 text-primary" />
                  <h3 className="font-serif text-xl font-bold">Fios Selecionados</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Uso exclusivo de barbantes 100% algodão e ecológicos de primeira linha, macios ao pisar descalço e resistentes às lavagens.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="rounded-2xl border-border shadow-soft h-full hover:shadow-warm transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <Heart className="h-9 w-9 text-primary" />
                  <h3 className="font-serif text-xl font-bold">Atendimento Próximo</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Do clique no site até a entrega, você conta com o cuidado pessoal da Sueli, embalagem cheirosa e suporte direto pelo WhatsApp e Instagram.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          <FadeIn className="mt-14 rounded-3xl bg-card border border-border p-8 sm:p-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                O Que Produzimos no Ateliê
              </h2>
              <ul className="space-y-2.5 text-sm text-foreground">
                {[
                  "Tapetes Retangulares e Ovais com relevos e corações para Sala e Quarto",
                  "Jogos de Passadeira de Cozinha e Corredor que não enrolam nas pontas",
                  "Jogos de Banheiro completos (2 a 5 peças, incluindo caixa acoplada)",
                  "Capas sob medida para Botijão de Gás, Liquidificador e Batedeira",
                  "Sousplats, Trilhos de Mesa e Kits de Mesa Posta 100% algodão",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pix shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/products/sueli-jogo-quarto-oval-areia-marinho.jpg"
                alt="Jogo de quarto em crochê areia e azul marinho do Ateliê Sueli"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
