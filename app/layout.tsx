import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";

const cinzel = Cinzel({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Elden Ring Planner', 
    default: 'Elden Ring Build Planner & Calculator',
  },
  description: "Create, save, and share your Elden Ring builds.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <body className={`${cinzel.className} bg-stone-950 text-stone-200 min-h-screen selection:bg-amber-900 selection:text-white`}>
        <Navbar initialUser={user} initialProfile={profile} />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}