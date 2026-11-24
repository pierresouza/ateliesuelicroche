"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, SITE_CONFIG } from "@/lib/constants";
import { trackWhatsAppClick } from "@/lib/analytics";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";

export function FloatingWhatsApp() {
  const url = buildWhatsAppUrl(
    `Olá, Sueli! Estou visitando o site do ${SITE_CONFIG.name} e gostaria de ajuda para escolher minha peça de crochê.`
  );

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.45, ease: EASE_ARTISAN }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => trackWhatsAppClick("floating_button")}
      aria-label="Falar com a Sueli no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-lg font-semibold text-sm"
    >
      <MessageCircle className="h-5 w-5 fill-current" />
      <span className="hidden sm:inline">Dúvidas? Fale com a Sueli</span>
    </motion.a>
  );
}
