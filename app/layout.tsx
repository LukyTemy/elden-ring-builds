import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Inicializace fontu starým způsobem
const cinzel = Cinzel({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Tady zůstávají ta vylepšená metadata pro SEO
  title: {
    template: '%s | Elden Ring Planner', 
    default: 'Elden Ring Build Planner & Calculator',
  },
  description: "Create, save, and share your Elden Ring builds. Calculate stats, equipment load, and optimize your character for the Lands Between.",
  keywords: ["Elden Ring", "Build Planner", "Calculator", "Character Planner", "Stats", "Weapons", "Armor"],
  openGraph: {
    title: 'Elden Ring Build Planner',
    description: 'Optimize your character for the Lands Between.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Elden Ring Builder',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        // Vrátil jsem cinzel.className. 
        // Nechal jsem tam 'min-h-screen' (aby patička neletěla nahoru) a barvy výběru textu (selection).
        className={`${cinzel.className} bg-stone-950 text-stone-200 min-h-screen selection:bg-amber-900 selection:text-white`} 
        suppressHydrationWarning={true}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}