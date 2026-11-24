import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import {
  products as seedProducts,
  STORE_TESTIMONIALS,
  type Product,
  type ProductColor,
  type ProductSize,
} from "@/data/products";

interface SupabaseProductRow {
  id: string;
  legacy_id?: string | null;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  original_price?: number | string | null;
  pix_discount_percent?: number | string | null;
  image_url: string;
  category: Product["category"];
  room?: Product["room"] | null;
  dimensions: string;
  material: string;
  care_instructions: string;
  stock_quantity?: number | null;
  is_made_to_order?: boolean | null;
  production_days?: number | null;
  rating?: number | string | null;
  reviews_count?: number | null;
  featured?: boolean | null;
  bestseller?: boolean | null;
  weight_kg?: number | string | null;
  pkg_height_cm?: number | null;
  pkg_width_cm?: number | null;
  pkg_length_cm?: number | null;
  colors?: ProductColor[] | null;
  sizes?: ProductSize[] | null;
}

function mapRowToProduct(row: SupabaseProductRow): Product {
  const fallback = seedProducts.find((p) => p.slug === row.slug);
  return {
    id: row.legacy_id || row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    pixDiscountPercent: row.pix_discount_percent ? Number(row.pix_discount_percent) : 5,
    image: row.image_url,
    rating: row.rating ? Number(row.rating) : 5,
    reviews: row.reviews_count ?? 15,
    category: row.category || "Retangular",
    room: row.room || "Sala",
    dimensions: row.dimensions,
    material: row.material,
    careInstructions: row.care_instructions,
    stockQuantity: row.stock_quantity ?? 3,
    isMadeToOrder: Boolean(row.is_made_to_order),
    productionDays: row.production_days ?? 7,
    weightKg: row.weight_kg ? Number(row.weight_kg) : fallback?.weightKg || 1.1,
    pkgHeightCm: row.pkg_height_cm ?? fallback?.pkgHeightCm ?? 12,
    pkgWidthCm: row.pkg_width_cm ?? fallback?.pkgWidthCm ?? 28,
    pkgLengthCm: row.pkg_length_cm ?? fallback?.pkgLengthCm ?? 34,
    featured: Boolean(row.featured),
    bestseller: Boolean(row.bestseller),
    colors:
      Array.isArray(row.colors) && row.colors.length > 0
        ? row.colors
        : fallback?.colors || [{ name: "Padrão", hex: "#D4C5B9", image: row.image_url }],
    sizes:
      Array.isArray(row.sizes) && row.sizes.length > 0
        ? row.sizes
        : fallback?.sizes || [
            { label: "Tamanho Padrão", dimensions: row.dimensions, priceDelta: 0 },
          ],
  };
}

export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return seedProducts;
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("bestseller", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return seedProducts;
    }

    return (data as SupabaseProductRow[]).map(mapRowToProduct);
  } catch {
    return seedProducts;
  }
}

export async function getProductBySlug(slugOrId: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
}

export interface ProductReviewItem {
  id: string;
  customer_name: string;
  customer_city?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export async function getProductReviews(productSlug: string): Promise<ProductReviewItem[]> {
  const fallbackReviews: ProductReviewItem[] = STORE_TESTIMONIALS.slice(0, 3).map((t, idx) => ({
    id: `seed-${idx}`,
    customer_name: t.name,
    customer_city: t.city,
    rating: t.rating,
    comment: t.comment,
    created_at: "2026-10-15T12:00:00Z",
  }));

  if (!isSupabaseConfigured) {
    return fallbackReviews;
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, customer_city, rating, comment, created_at")
      .eq("product_slug", productSlug)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return fallbackReviews;
    }

    return data as ProductReviewItem[];
  } catch {
    return fallbackReviews;
  }
}
