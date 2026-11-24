import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tapetes e Jogos de Crochê Sob Medida",
  description:
    "Encomende tapetes redondos, retangulares, passadeiras e jogos de banheiro nas cores e medidas exatas da sua casa, feitos à mão pela Sueli.",
  alternates: {
    canonical: "/sob-medida",
  },
};

export default function CustomOrderLayout({ children }: { children: ReactNode }) {
  return children;
}
