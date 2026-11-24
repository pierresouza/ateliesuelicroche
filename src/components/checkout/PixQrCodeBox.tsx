"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Copy, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generatePixBrCode } from "@/lib/pix";
import { formatBRL, SITE_CONFIG } from "@/lib/constants";

interface PixQrCodeBoxProps {
  orderCode: string;
  amount: number;
  pixKey?: string;
  compact?: boolean;
}

export function PixQrCodeBox({
  orderCode,
  amount,
  pixKey = SITE_CONFIG.pixKey,
  compact = false,
}: PixQrCodeBoxProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const brCodePayload = useMemo(
    () =>
      generatePixBrCode({
        pixKey,
        amount,
        txid: orderCode,
        description: `Pedido ${orderCode}`,
      }),
    [pixKey, amount, orderCode]
  );

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(brCodePayload, {
      width: compact ? 190 : 230,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#221712",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [brCodePayload, compact]);

  return (
    <div className="rounded-2xl border-2 border-pix/30 bg-pix/5 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-pix" />
          <span className="text-sm font-bold text-foreground">
            Pagamento via PIX Instantâneo
          </span>
        </div>
        <span className="text-xs font-extrabold bg-pix text-pix-foreground px-3 py-1 rounded-full">
          Valor com 5% OFF: {formatBRL(amount)}
        </span>
      </div>

      <div className="grid sm:grid-cols-12 gap-4 items-center">
        {/* Imagem do QR Code Escaneável */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white rounded-2xl p-3 border border-border shadow-soft mx-auto">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR Code PIX para o pedido #${orderCode}`}
              width={compact ? 176 : 208}
              height={compact ? 176 : 208}
              className="rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-muted-foreground">
              Gerando QR Code...
            </div>
          )}
          <span className="text-[11px] text-muted-foreground mt-1.5 inline-flex items-center gap-1">
            <Smartphone className="h-3 w-3 text-pix" />
            Aponte a câmera do seu banco
          </span>
        </div>

        {/* PIX Copia e Cola + Chave Direta */}
        <div className="sm:col-span-7 space-y-3 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              1. PIX Copia e Cola (com valor exato):
            </label>
            <Input
              value={brCodePayload}
              readOnly
              aria-label="Código PIX Copia e Cola"
              className="bg-card text-[11px] font-mono h-9"
            />
            <Button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(brCodePayload);
                setCopiedPayload(true);
                setTimeout(() => setCopiedPayload(false), 3000);
              }}
              className="w-full bg-pix hover:bg-pix/90 text-pix-foreground rounded-full font-bold h-9 text-xs"
            >
              {copiedPayload ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Código PIX Copiado! Cole no app do banco
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copiar Código PIX Copia e Cola
                </>
              )}
            </Button>
          </div>

          <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">
                Ou pague pela Chave Celular da Sueli:
              </span>
              <strong className="font-mono text-foreground">{SITE_CONFIG.whatsappDisplay}</strong>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full h-8 text-xs shrink-0 bg-card"
              onClick={() => {
                navigator.clipboard.writeText(pixKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2500);
              }}
            >
              {copiedKey ? "Copiada!" : "Copiar Chave"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
