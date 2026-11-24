"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";

export function Hero() {
  return (
    <section className="relative bg-gradient-subtle overflow-hidden border-b border-border/60">
      <div className="container mx-auto py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Coluna de Copy B2C com entrada escalonada suave */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.09, delayChildren: 0.05 },
              },
            }}
            className="lg:col-span-7 space-y-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_ARTISAN } },
              }}
              className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-1.5 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                Feito à mão pela Sueli • Barbante 100% Algodão Ecológico
              </span>
            </motion.div>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_ARTISAN } },
              }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.12]"
            >
              Aconchego e Encanto em{" "}
              <span className="text-primary italic">Cada Ponto de Crochê</span>{" "}
              para o Seu Lar
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_ARTISAN } },
              }}
              className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Tapetes para sala e quarto, passadeiras de cozinha, jogos de banheiro e mesa posta criados artesanalmente no{" "}
              <strong className="text-foreground">{SITE_CONFIG.name}</strong>. Escolha peças à pronta entrega ou encomende nas cores e medidas exatas da sua casa!
            </motion.p>

            {/* Prova Social Rápida */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_ARTISAN } },
              }}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9/5 de aprovação</span>
              <span className="text-muted-foreground">• +500 lares transformados em todo o Brasil</span>
            </motion.div>

            {/* CTAs Principais */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_ARTISAN } },
              }}
              className="flex flex-col sm:flex-row gap-3.5 pt-1"
            >
              <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-warm text-primary-foreground rounded-full px-8 text-base font-semibold shadow-warm hover:opacity-95 transition-all"
                >
                  <Link href="/colecao">
                    Comprar Pronta Entrega
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-7 text-base border-primary/40 hover:bg-primary/10"
                >
                  <Link href="/sob-medida">
                    Encomendar Sob Medida
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Destaques rápidos */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_ARTISAN } },
              }}
              className="grid grid-cols-3 gap-4 pt-4 border-t border-border/70 max-w-lg"
            >
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-primary">5% OFF</p>
                <p className="text-xs text-muted-foreground">À vista no PIX</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-primary">Até 6x</p>
                <p className="text-xs text-muted-foreground">Sem juros no cartão</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-primary">R$ 150+</p>
                <p className="text-xs text-muted-foreground">Com Frete Grátis</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Coluna Visual com LCP Priority preservado + movimento sutil */}
          <motion.div
            initial={{ scale: 0.97, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_ARTISAN }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-warm border-4 border-card">
              <Image
                src="/images/products/sueli-tapete-sala-coracoes-cinza-branco.jpg"
                alt="Tapete artesanal de sala com corações em relevo feito à mão pelo Ateliê Sueli Crochê"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.55, ease: EASE_ARTISAN }}
                className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur rounded-2xl p-4 shadow-soft flex items-center gap-3"
              >
                <HeartHandshake className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Direto das mãos da artesã Sueli para sua casa
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Acabamento firme que não enrola nas pontas e pode lavar na máquina
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Badge Flutuante com levitação suave */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:flex items-center gap-2 absolute -top-4 -right-3 bg-pix text-pix-foreground rounded-2xl px-4 py-2.5 shadow-warm"
            >
              <ShieldCheck className="h-5 w-5" />
              <div className="leading-tight">
                <p className="text-xs font-bold">Cupom 1ª Compra</p>
                <p className="text-[11px] opacity-90">Use {SITE_CONFIG.firstPurchaseCoupon}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
