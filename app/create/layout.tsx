import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server"; // 1. Import klienta
import { redirect } from "next/navigation"; // 2. Import přesměrování

export const metadata: Metadata = {
  title: "New Build", 
  description: "Craft your ultimate tarnished. Select weapons, armor, and stats.",
};

export default async function CreateLayout({ // 3. Přidat 'async'
  children,
}: {
  children: React.ReactNode;
}) {
  // 4. Ověření uživatele
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 5. Pokud není přihlášený, přesměrujeme ho na login s vysvětlením
  if (!user) {
    redirect("/login?message=You must be logged in to create a build");
  }

  return (
    <>
      {children}
    </>
  );
}