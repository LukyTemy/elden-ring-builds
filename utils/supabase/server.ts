import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() { // Přidáno async
  const cookieStore = await cookies(); // Přidáno await (nutné pro Next.js 15)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // V Server Componentě nelze nastavovat cookies,
            // ale middleware se o to postaral, takže to můžeme ignorovat.
          }
        },
      },
    }
  );
}