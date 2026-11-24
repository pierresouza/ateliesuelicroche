import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Cuidados, Trocas, Envio e Privacidade (LGPD)",
  description:
    "Confira nossas instruções de lavagem do crochê, prazos de pronta entrega e sob encomenda, política de primeira troca grátis e privacidade LGPD.",
  alternates: {
    canonical: "/politicas",
  },
};

export default function PoliciesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Início", path: "/" },
          { name: "Políticas e Cuidados", path: "/politicas" },
        ]}
      />

      <div className="container mx-auto py-12 max-w-3xl space-y-10">
        <header className="space-y-2 border-b border-border pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
            Central de Cuidados & Políticas — {SITE_CONFIG.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Transparência total para você comprar suas peças artesanais com tranquilidade.
          </p>
        </header>

        <section id="cuidados" className="space-y-3 scroll-mt-24">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            1. Como Lavar e Conservar seu Crochê
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>Lave separadamente na primeira lavagem utilizando apenas sabão neutro ou sabão de coco líquido.</li>
            <li>Pode ir à máquina de lavar no <strong>ciclo delicado</strong> (preferencialmente dentro de saco protetor para peças com flores ou franjas).</li>
            <li>Nunca utilize água sanitária, cloro ou alvejantes agressivos para preservar as fibras de algodão.</li>
            <li>Seque à sombra, preferencialmente na horizontal, sem prender pelas pontas do bico rendado.</li>
          </ul>
        </section>

        <section id="envio" className="space-y-3 scroll-mt-24 pt-6 border-t border-border">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            2. Prazos de Produção e Envio
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enviamos para todo o Brasil via Correios e transportadoras parceiras com código de rastreio enviado direto no seu WhatsApp:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li><strong>Peças à Pronta Entrega:</strong> Postagem em até 2 dias úteis após confirmação do pagamento.</li>
            <li><strong>Peças Sob Encomenda / Sob Medida:</strong> Confeccionadas artesanalmente pela Sueli no prazo indicado em cada produto (5 a 10 dias úteis) + prazo dos Correios para seu CEP.</li>
            <li><strong>Frete Grátis:</strong> Aplicado automaticamente em pedidos a partir de R$ {SITE_CONFIG.freeShippingThreshold},00.</li>
          </ul>
        </section>

        <section id="trocas" className="space-y-3 scroll-mt-24 pt-6 border-t border-border">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            3. Política de Trocas, Devoluções e Garantia
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Respeitamos integralmente o Código de Defesa do Consumidor: você tem até <strong>7 dias corridos</strong> após o recebimento para devolução por arrependimento e até <strong>30 dias</strong> para solicitar a primeira troca de peças de catálogo sem uso. Todas as peças contam com garantia artesanal de <strong>90 dias</strong> contra defeitos de confecção.
          </p>
        </section>

        <section id="privacidade" className="space-y-3 scroll-mt-24 pt-6 border-t border-border">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            4. Privacidade, Cookies e LGPD
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os dados informados no pedido (nome, endereço, telefone e e-mail) são utilizados exclusivamente para emissão, envio e comunicação sobre sua encomenda no {SITE_CONFIG.name}. Utilizamos cookies essenciais para manter sua sacola ativa e cookies analíticos (Google Analytics) mediante seu consentimento. Para solicitar atualização ou exclusão de dados, entre em contato pelo e-mail {SITE_CONFIG.email}.
          </p>
        </section>
      </div>
    </>
  );
}
