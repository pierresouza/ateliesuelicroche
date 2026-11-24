"use client";

import { Truck, Sparkles, Instagram, Percent } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { trackInstagramClick } from "@/lib/analytics";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground text-xs py-2 px-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 mx-auto md:mx-0">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            Frete Grátis acima de R$ {SITE_CONFIG.freeShippingThreshold}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 font-medium">
            <Percent className="h-3.5 w-3.5 shrink-0" />
            {SITE_CONFIG.pixDiscountPercent}% OFF no PIX • Até {SITE_CONFIG.maxInstallments}x sem juros
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
            <Sparkles className="h-3 w-3" />
            1ª Compra: use o cupom {SITE_CONFIG.firstPurchaseCoupon}
          </span>
        </div>

        <a
          href={SITE_CONFIG.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstagramClick("announcement_bar")}
          className="hidden md:inline-flex items-center gap-1.5 font-medium hover:underline"
        >
          <Instagram className="h-3.5 w-3.5" />
          Siga {SITE_CONFIG.instagramHandle}
        </a>
      </div>
    </div>
  );
}
