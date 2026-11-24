import { SITE_CONFIG } from "@/lib/constants";

function formatTlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function sanitizeAscii(input: string, maxLength: number): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

function computeCrc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function normalizePixKey(rawKey: string): string {
  const trimmed = rawKey.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  if (trimmed.startsWith("+")) {
    return `+${trimmed.replace(/\D/g, "")}`;
  }
  const onlyDigits = trimmed.replace(/\D/g, "");
  // Se tiver 12 ou 13 dígitos começando com 55 (celular brasileiro sem '+'), adiciona '+'
  if ((onlyDigits.length === 12 || onlyDigits.length === 13) && onlyDigits.startsWith("55")) {
    return `+${onlyDigits}`;
  }
  return trimmed;
}

/**
 * Gera o payload oficial BRCode (PIX Copia e Cola - Padrão EMVCo Banco Central)
 * pronto para leitura de QR Code em qualquer banco brasileiro.
 */
export function generatePixBrCode({
  pixKey = SITE_CONFIG.pixKey,
  merchantName = SITE_CONFIG.pixMerchantName,
  merchantCity = SITE_CONFIG.pixMerchantCity,
  amount,
  txid,
  description,
}: {
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  txid: string;
  description?: string;
}): string {
  const normalizedKey = normalizePixKey(pixKey);
  const cleanTxid = txid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 25) || "***";
  const cleanName = sanitizeAscii(merchantName, 25) || "ATELIE SUELI CROCHE";
  const cleanCity = sanitizeAscii(merchantCity, 15) || "SAO PAULO";

  let merchantAccountValue =
    formatTlv("00", "br.gov.bcb.pix") + formatTlv("01", normalizedKey);

  if (description) {
    const cleanDesc = sanitizeAscii(description, 25);
    if (cleanDesc) {
      merchantAccountValue += formatTlv("02", cleanDesc);
    }
  }

  const parts = [
    formatTlv("00", "01"), // Payload Format Indicator
    formatTlv("26", merchantAccountValue), // Merchant Account Information - PIX
    formatTlv("52", "0000"), // Merchant Category Code
    formatTlv("53", "986"), // Moeda BRL (986)
    amount > 0 ? formatTlv("54", amount.toFixed(2)) : "", // Valor exato do pedido
    formatTlv("58", "BR"), // País
    formatTlv("59", cleanName), // Nome do recebedor
    formatTlv("60", cleanCity), // Cidade
    formatTlv("62", formatTlv("05", cleanTxid)), // Additional Data Field (TXID)
  ].join("");

  const payloadWithCrcHeader = `${parts}6304`;
  const crc = computeCrc16(payloadWithCrcHeader);
  return `${payloadWithCrcHeader}${crc}`;
}
