import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  // Se CRON_SECRET estiver definido em produção e um header Authorization for enviado, valida-o;
  // também aceita query ?key= ou execução pública de healthcheck leve (somente leitura/ping).
  const queryKey = request.nextUrl.searchParams.get("key");
  if (
    process.env.NODE_ENV === "production" &&
    expectedSecret &&
    authHeader &&
    authHeader !== `Bearer ${expectedSecret}` &&
    queryKey !== expectedSecret
  ) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      ok: true,
      mode: "local_fallback",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Tenta acionar a função RPC oficial de keepalive
    const { data: rpcData, error: rpcError } = await supabase.rpc("ping_keepalive", {
      ping_source: "nextjs_cron",
    });

    if (!rpcError && rpcData) {
      return NextResponse.json({
        ok: true,
        mode: "rpc_keepalive",
        supabase: rpcData,
      });
    }

    // 2. Fallback: realiza uma query leve na API REST do PostgREST para registrar atividade no projeto Supabase
    const { count, error: selectError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      ok: true,
      mode: "rest_activity_ping",
      productsCount: count ?? 0,
      note: selectError ? "Project pinged (migration pending)" : "Project active and healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Keepalive error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
