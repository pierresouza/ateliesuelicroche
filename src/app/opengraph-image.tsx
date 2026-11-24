import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/constants";

export const alt = "Ateliê Sueli Crochê — Tapetes e Peças Artesanais 100% Algodão";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #fbf7f2 0%, #f1e6da 100%)",
          color: "#2e2018",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#cd532c",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            SC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "28px", fontWeight: 700 }}>{SITE_CONFIG.name}</span>
            <span style={{ fontSize: "18px", color: "#cd532c" }}>
              {SITE_CONFIG.instagramHandle}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "920px" }}>
          <div style={{ fontSize: "64px", fontWeight: 700, lineHeight: 1.1 }}>
            Crochê Artesanal Feito Ponto a Ponto para Acolher o Seu Lar
          </div>
          <div style={{ fontSize: "28px", color: "#685549", lineHeight: 1.4 }}>
            Tapetes, Passadeiras, Jogos de Banheiro e Mesa Posta • Pronta Entrega & Sob Medida
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "22px",
            fontWeight: 600,
            color: "#cd532c",
          }}
        >
          <span>• Frete Grátis acima de R$ 150</span>
          <span>• 5% OFF no PIX</span>
          <span>• Até 6x sem juros</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
