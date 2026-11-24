import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getAllProducts, getProductBySlug, getProductReviews } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductCard } from "@/components/ProductCard";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/JsonLd";
import { formatBRL, getPixPrice, SITE_CONFIG } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Peça não encontrada",
    };
  }

  const pixPrice = getPixPrice(product.price, product.pixDiscountPercent);
  const title = `${product.name} — ${formatBRL(pixPrice)} no PIX`;
  const description = `${product.description} Confeccionado à mão em ${product.material} pelo ${SITE_CONFIG.name}. Parcele em até 6x sem juros ou ganhe 5% OFF no PIX!`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${SITE_CONFIG.url}${product.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/produto/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/produto/${product.slug}`,
      images: [{ url: imageUrl, alt: product.name }],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviews, allProducts] = await Promise.all([
    getProductReviews(product.slug),
    getAllProducts(),
  ]);

  const related = allProducts
    .filter((p) => p.slug !== product.slug && (p.room === product.room || p.category === product.category))
    .slice(0, 3);

  return (
    <>
      <ProductJsonLd product={product} reviews={reviews} />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", path: "/" },
          { name: "Coleção", path: "/colecao" },
          { name: product.category, path: `/colecao?categoria=${encodeURIComponent(product.category)}` },
          { name: product.name, path: `/produto/${product.slug}` },
        ]}
      />

      <div className="container mx-auto py-6 sm:py-10">
        {/* Trilha Breadcrumb */}
        <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/colecao" className="hover:text-primary">Coleção</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/colecao?categoria=${encodeURIComponent(product.category)}`} className="hover:text-primary">
            {product.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <ProductDetailClient product={product} initialReviews={reviews} />

        {/* Peças Relacionadas */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6">
              Combine Também no Seu Ambiente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} listName="PDP - Relacionados" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
