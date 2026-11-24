import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { mapSuperFreteStatusToStore } from "@/lib/superfrete";

function verifyHmacSignature(rawBody: string, headerSig: string | null, secret: string): boolean {
  if (!headerSig) return false;
  const cleanSig = headerSig.replace(/^sha256=/i, "").trim();
  const computed = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  try {
    const bufA = Buffer.from(cleanSig, "utf8");
    const bufB = Buffer.from(computed, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookSecret = process.env.SUPERFRETE_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signatureHeader =
      request.headers.get("x-superfrete-signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("x-hub-signature-256");
    const authHeader = request.headers.get("authorization");

    const validHmac = verifyHmacSignature(rawBody, signatureHeader, webhookSecret);
    const validBearer = authHeader === `Bearer ${webhookSecret}`;

    if (!validHmac && !validBearer) {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, mode: "local_noop" });
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const eventName = String(payload.event || "");
    const dataObj = (payload.data as Record<string, unknown>) || payload;

    const superfreteId = String(dataObj.id || payload.order_id || "");
    const trackingCode = String(dataObj.tracking || payload.tracking_code || "");
    const rawStatus = String(
      dataObj.status ||
        (eventName.startsWith("order.") ? eventName.replace("order.", "") : "in_transit")
    );
    const printObj = dataObj.print as Record<string, unknown> | undefined;
    const labelUrl = printObj?.url ? String(printObj.url) : null;

    if (!superfreteId && !trackingCode) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const mapped = mapSuperFreteStatusToStore(rawStatus);
    const eventKey = String(
      payload.id || `${superfreteId}:${rawStatus}:${trackingCode}`
    );

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: rpcResult } = await supabase.rpc("process_superfrete_webhook", {
      p_superfrete_id: superfreteId || null,
      p_tracking_code: trackingCode || null,
      p_sf_status: rawStatus,
      p_mapped_order_status: mapped.storeStatus,
      p_event_title: mapped.title,
      p_event_description: trackingCode
        ? `${mapped.description} (Rastreio: ${trackingCode.toUpperCase()})`
        : mapped.description,
      p_event_location: "SuperFrete — Atualização Automática",
      p_label_url: labelUrl,
      p_event_key: eventKey,
    });

    return NextResponse.json({
      ok: true,
      received: true,
      result: rpcResult ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
