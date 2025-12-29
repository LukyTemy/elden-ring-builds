import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. Vytvoříme základní odpověď
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Inicializujeme Supabase klienta pro middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Nová syntaxe pro @supabase/ssr v0.5+
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Nastavíme cookies do requestu i response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          
          response = NextResponse.next({
            request,
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Obnovíme session (pokud existuje)
  // Toto je klíčové - middleware se postará o refresh tokenu
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};