import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/catalog";
import { CollectionClient } from "@/components/CollectionClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Coleção Completa de Tapetes, Passadeiras e Jogos de Crochê",
  description:
    "Compre tapetes redondos, retangulares, ovais, jogos de banheiro, passadeiras de cozinha e sousplats feitos à mão pela Sueli com 5% OFF no PIX e Frete Grátis acima de R$ 150.",
  alternates: {
    canonical: "/colecao",
  },
};

export default async function CollectionPage() {
  const allProducts = await getAllProducts();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Início", path: "/" },
          { name: "Coleção Completa", path: "/colecao" },
        ]}
      />

      <section className="bg-gradient-subtle py-12 border-b border-border/60">
        <div className="container mx-auto text-center max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3">
            Nossa Coleção Artesanal
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Peças à pronta entrega e sob encomenda confeccionadas em barbante 100% algodão com o carinho do Ateliê Sueli Crochê.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto">
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando coleção...</div>}>
            <CollectionClient initialProducts={allProducts} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
