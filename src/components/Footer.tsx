"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Instagram,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/lib/constants";
import { subscribeLeadAction } from "@/app/actions/store";
import {
  getStoredUtms,
  trackGenerateLead,
  trackInstagramClick,
  trackWhatsAppClick,
} from "@/lib/analytics";

export function Footer() {
  const [contact, setContact] = useState("");
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const utms = getStoredUtms();
      const isEmail = contact.includes("@");
      const res = await subscribeLeadAction({
        email: isEmail ? contact : undefined,
        phone: !isEmail ? contact : undefined,
        utmSource: utms.utm_source,
      });
      setLeadMessage(res.message);
      if (res.ok) {
        trackGenerateLead("footer_first_purchase_coupon");
        setContact("");
      }
    });
  };

  return (
    <footer className="bg-card border-t border-border mt-16">
      {/* Faixa de Captura de Cupom 1ª Compra */}
      <div className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto py-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Presente de Boas-Vindas da Sueli
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              Ganhe 10% OFF na sua Primeira Compra!
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Cadastre seu WhatsApp ou e-mail para liberar seu cupom{" "}
              <strong className="text-foreground">{SITE_CONFIG.firstPurchaseCoupon}</strong> e receber novidades exclusivas das fornadas artesanais do{" "}
              <strong className="text-foreground">{SITE_CONFIG.instagramHandle}</strong>.
            </p>
            <form
              onSubmit={handleLeadSubmit}
              className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-1"
            >
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Seu WhatsApp ou melhor e-mail"
                className="bg-card rounded-full px-4"
                required
              />
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-warm text-primary-foreground rounded-full px-6 font-semibold shrink-0"
              >
                Quero 10% OFF
              </Button>
            </form>
            {leadMessage && (
              <p className="text-xs font-semibold text-pix inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {leadMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Colunas Institucionais */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-warm rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-sm">
                  SC
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {SITE_CONFIG.name}
                </h3>
                <p className="text-xs text-primary font-medium">
                  {SITE_CONFIG.instagramHandle}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Peças autorais em crochê produzidas à mão pela Sueli com barbante 100% algodão ecológico. Beleza, durabilidade e aconchego para cada cantinho da sua casa.
            </p>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a
                  href={SITE_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackInstagramClick("footer")}
                >
                  <Instagram className="h-4 w-4 mr-1.5 text-primary" />
                  Instagram Oficial
                </a>
              </Button>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-foreground">
              Compre por Categoria
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/colecao?categoria=Retangular" className="text-muted-foreground hover:text-primary transition-colors">
                  Tapetes de Sala & Corações
                </Link>
              </li>
              <li>
                <Link href="/colecao?categoria=Oval" className="text-muted-foreground hover:text-primary transition-colors">
                  Jogos de Quarto Ovais
                </Link>
              </li>
              <li>
                <Link href="/colecao?categoria=Passadeira" className="text-muted-foreground hover:text-primary transition-colors">
                  Jogos de Passadeira
                </Link>
              </li>
              <li>
                <Link href="/colecao?categoria=Capas+%26+Cozinha" className="text-muted-foreground hover:text-primary transition-colors">
                  Capas de Botijão & Eletros
                </Link>
              </li>
              <li>
                <Link href="/colecao?categoria=Jogo+de+Banheiro" className="text-muted-foreground hover:text-primary transition-colors">
                  Jogos de Banheiro (2 a 5 Peças)
                </Link>
              </li>
              <li>
                <Link href="/colecao?categoria=Mesa+Posta" className="text-muted-foreground hover:text-primary transition-colors">
                  Sousplats & Mesa Posta
                </Link>
              </li>
              <li>
                <Link href="/sob-medida" className="text-primary font-medium hover:underline">
                  Encomendar Sob Medida
                </Link>
              </li>
            </ul>
          </div>

          {/* Ajuda & Institucional */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-foreground">
              Atendimento & Políticas
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/conta" className="text-primary font-semibold hover:underline">
                  Minha Conta & Acompanhar Entrega
                </Link>
              </li>
              <li>
                <Link href="/rastrear" className="text-muted-foreground hover:text-primary transition-colors">
                  Rastrear Pedido (#ASC)
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-primary transition-colors">
                  Conheça a Sueli & o Ateliê
                </Link>
              </li>
              <li>
                <Link href="/politicas#cuidados" className="text-muted-foreground hover:text-primary transition-colors">
                  Como Lavar e Conservar seu Crochê
                </Link>
              </li>
              <li>
                <Link href="/politicas#trocas" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/politicas#envio" className="text-muted-foreground hover:text-primary transition-colors">
                  Prazos de Produção e Frete
                </Link>
              </li>
              <li>
                <Link href="/politicas#privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacidade e Proteção de Dados (LGPD)
                </Link>
              </li>
            </ul>
          </div>

          {/* Fale com a Sueli */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-foreground">
              Fale com a Sueli
            </h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <a
                href={buildWhatsAppUrl("Olá, Sueli! Vim pelo site do Ateliê Sueli Crochê e gostaria de tirar uma dúvida.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                className="flex items-center gap-2 hover:text-primary transition-colors font-medium text-foreground"
              >
                <Phone className="h-4 w-4 text-primary" />
                WhatsApp: {SITE_CONFIG.whatsappDisplay}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                {SITE_CONFIG.email}
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{SITE_CONFIG.location}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-pix shrink-0" />
              <span>Pagamento Seguro via PIX (5% OFF) ou Cartão em até 6x</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p className="flex items-center">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Feito à mão com
            <Heart className="h-3.5 w-3.5 mx-1 text-primary fill-primary" />
            no Brasil.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-primary">
              Mapa do Site
            </Link>
            <Link href="/admin" className="hover:text-primary">
              Área do Ateliê
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
