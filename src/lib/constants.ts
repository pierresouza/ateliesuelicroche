export const SITE_CONFIG = {
  name: "Ateliê Sueli Crochê",
  shortName: "Sueli Crochê",
  ownerName: "Sueli",
  tagline:
    "Tapetes e peças em crochê feitos à mão com barbante 100% algodão para transformar sua casa em um lar acolhedor.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ateliesuelicroche.com.br",
  instagramHandle: "@atelie_sueli_croche",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://www.instagram.com/atelie_sueli_croche/",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511925441299",
  whatsappDisplay: "+55 11 92544-1299",
  email: "contato@ateliesuelicroche.com.br",
  pixKey: process.env.NEXT_PUBLIC_PIX_KEY || "+5511925441299",
  pixMerchantName: "ATELIE SUELI CROCHE",
  pixMerchantCity: "SAO PAULO",
  location: "São Paulo, SP — Enviamos para todo o Brasil",
  freeShippingThreshold: 150,
  pixDiscountPercent: 5,
  maxInstallments: 6,
  minInstallmentValue: 25,
  firstPurchaseCoupon: "BEMVINDA10",
} as const;

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getPixPrice(
  price: number,
  discountPercent: number = SITE_CONFIG.pixDiscountPercent
): number {
  return Number((price * (1 - discountPercent / 100)).toFixed(2));
}

export function getInstallmentInfo(price: number) {
  const possibleCount = Math.min(
    SITE_CONFIG.maxInstallments,
    Math.max(1, Math.floor(price / SITE_CONFIG.minInstallmentValue))
  );
  const installmentValue = price / possibleCount;
  return {
    count: possibleCount,
    value: installmentValue,
    formatted: `${possibleCount}x de ${formatBRL(installmentValue)} sem juros`,
  };
}

export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encoded}`;
}
