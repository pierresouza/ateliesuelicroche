"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CONSENT_STORAGE_KEY, updateGoogleConsent } from "@/lib/analytics";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      } else {
        updateGoogleConsent(saved === "granted");
      }
    } catch {
      setVisible(false);
    }
  }, []);

  const handleChoice = (granted: boolean) => {
    updateGoogleConsent(granted);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Preferências de privacidade e cookies"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: EASE_ARTISAN }}
          className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 rounded-2xl border border-border bg-card/95 backdrop-blur p-4 shadow-warm"
        >
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Usamos cookies para lembrar sua sacola, medir visitas e melhorar sua experiência no{" "}
            <strong className="text-foreground">Ateliê Sueli Crochê</strong>, conforme nossa{" "}
            <Link href="/politicas" className="text-primary underline hover:opacity-80">
              Política de Privacidade (LGPD)
            </Link>
            .
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-warm text-primary-foreground"
              onClick={() => handleChoice(true)}
            >
              Aceitar e Continuar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleChoice(false)}>
              Apenas Essenciais
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
