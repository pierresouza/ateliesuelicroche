"use client";

import Image from "next/image";
import { Instagram, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { SUELI_IMAGES } from "@/data/products";
import { trackInstagramClick } from "@/lib/analytics";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/MotionPrimitives";

const IG_POSTS = [
  {
    image: SUELI_IMAGES.tapeteSalaCoracoes,
    caption:
      "Tapete de Sala Corações em Relevo finalizado com nossa etiquetinha rosa Ateliê Sueli!",
  },
  {
    image: SUELI_IMAGES.jogoBanheiro5PecasVermelho,
    caption:
      "Jogo de banheiro completo de 5 peças em vermelho rubi e areia — com capa para caixa acoplada!",
  },
  {
    image: SUELI_IMAGES.kitCapasEletros,
    caption:
      "Dupla de capas para liquidificador e batedeira em café & areia deixando a bancada um encanto.",
  },
  {
    image: SUELI_IMAGES.kitSousplatVermelhoVerde,
    caption:
      "Mesa posta pronta para reunir quem você ama com nossos sousplats bicolores 100% algodão.",
  },
];

export function InstagramShowcase() {
  return (
    <section className="py-16 bg-secondary/40 border-y border-border/60">
      <div className="container mx-auto">
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <Instagram className="h-4 w-4" />
              Bastidores & Encomendas Reais
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
              Acompanhe a Sueli no {SITE_CONFIG.instagramHandle}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Veja os pontos de pertinho, combinações de cores escolhidas pelas clientes e as peças recém-saídas da agulha todos os dias.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-warm text-primary-foreground rounded-full font-semibold shrink-0"
          >
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInstagramClick("home_showcase")}
            >
              <Instagram className="h-4 w-4 mr-2" />
              Seguir {SITE_CONFIG.instagramHandle}
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </a>
          </Button>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IG_POSTS.map((post, idx) => (
            <StaggerItem key={idx}>
              <a
                href={SITE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInstagramClick(`home_grid_${idx + 1}`)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-soft block"
              >
                <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-1.5 text-xs font-semibold mb-1.5">
                    <Heart className="h-3.5 w-3.5 fill-white" />
                    {SITE_CONFIG.instagramHandle}
                  </div>
                  <p className="text-xs leading-snug line-clamp-3">{post.caption}</p>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
