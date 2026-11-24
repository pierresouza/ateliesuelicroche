import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { AppProviders } from "@/providers/AppProviders";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#cd532c",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Tapetes de Crochê Artesanais, Jogos de Banheiro e Sob Medida`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.tagline,
  keywords: [
    "tapetes de crochê",
    "ateliê sueli crochê",
    "tapete de crochê artesanal",
    "jogo de banheiro crochê",
    "passadeira de crochê cozinha",
    "sousplat de crochê",
    "tapete redondo crochê sala",
    "tapete crochê sob medida",
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.instagramUrl }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — Feito à Mão pela Sueli (${SITE_CONFIG.instagramHandle})`,
    description: SITE_CONFIG.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — Crochê Artesanal 100% Algodão`,
    description: SITE_CONFIG.tagline,
  },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
      }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${jakarta.variable}`}>
      <head>
        {/* Google Consent Mode v2 Default Configuration */}
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>
      </head>
      <body>
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        <AppProviders>
          <AnalyticsTracker />
          {children}
          <CookieConsentBanner />
        </AppProviders>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
