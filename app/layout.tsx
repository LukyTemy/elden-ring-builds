import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const cinzel = Cinzel({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elden Ring Build Planner",
  description: "Create and share your tarnished builds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cinzel.className}>
        <Navbar />
        <main className="min-h-screen container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}