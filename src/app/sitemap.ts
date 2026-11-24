import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/catalog";
import { SITE_CONFIG } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();
  const allProducts = await getAllProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/colecao`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/sob-medida`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/rastrear`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/politicas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = allProducts.map((product) => {
    const imgUrl = product.image.startsWith("http")
      ? product.image
      : `${baseUrl}${product.image}`;

    return {
      url: `${baseUrl}/produto/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [imgUrl],
    };
  });

  return [...staticRoutes, ...productRoutes];
}
