import { SITE_CONFIG } from "@/lib/constants";
import type { Product } from "@/data/products";
import type { ProductReviewItem } from "@/lib/catalog";

export function StoreJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "@id": `${SITE_CONFIG.url}/#store`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.tagline,
    url: SITE_CONFIG.url,
    telephone: `+${SITE_CONFIG.whatsappNumber}`,
    email: SITE_CONFIG.email,
    priceRange: "$$",
    currenciesAccepted: "BRL",
    paymentAccepted: "PIX, Cartão de Crédito",
    image: `${SITE_CONFIG.url}/images/products/sueli-tapete-sala-coracoes-cinza-branco.jpg`,
    founder: {
      "@type": "Person",
      name: "Sueli Aparecida de Jesus",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "São Paulo",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    sameAs: [SITE_CONFIG.instagramUrl],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/colecao?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export function ProductJsonLd({
  product,
  reviews,
}: {
  product: Product;
  reviews: ProductReviewItem[];
}) {
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${SITE_CONFIG.url}${product.image}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: `ASC-${product.id}`,
    category: `Tapetes de Crochê > ${product.category}`,
    material: product.material,
    image: [
      imageUrl,
      ...product.colors.map((c) =>
        c.image.startsWith("http") ? c.image : `${SITE_CONFIG.url}${c.image}`
      ),
    ],
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_CONFIG.url}/produto/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "BR",
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: Math.max(product.reviews, reviews.length, 1),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.customer_name,
      },
      datePublished: r.created_at.split("T")[0],
      reviewBody: r.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
