import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || "contato@ateliesuelicroche.com.br"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseKey) {
    return { supabase: null, supabaseResponse };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, supabaseResponse };
};

export async function updateSession(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  if (!supabase) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Proteção da Área da Cliente (/conta), liberando /conta/entrar
  const isProtectedCustomerRoute =
    pathname === "/conta" ||
    (pathname.startsWith("/conta/") && !pathname.startsWith("/conta/entrar"));

  if (isProtectedCustomerRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/conta/entrar";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se cliente já está logada e acessa /conta/entrar, redireciona direto para /conta
  if (pathname.startsWith("/conta/entrar") && user) {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = "/conta";
    accountUrl.search = "";
    return NextResponse.redirect(accountUrl);
  }

  // Proteção do Painel Administrativo (/admin) exclusivo da Sueli
  const isProtectedAdmin =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (isProtectedAdmin) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userEmail = (user.email || "").toLowerCase();
    const isAppMetadataAdmin = user.app_metadata?.role === "admin";
    if (!isAppMetadataAdmin && ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
      const customerUrl = request.nextUrl.clone();
      customerUrl.pathname = "/conta";
      return NextResponse.redirect(customerUrl);
    }
  }

  return supabaseResponse;
}
