"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  buildId: string;
  initialIsFavorited?: boolean; // Můžeme předat, pokud víme
}

export default function FavoriteButton({ buildId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // 1. Při načtení zjistíme, jestli je uživatel přihlášen a jestli už dal like
  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("build_id", buildId)
          .single();
        
        if (data) setIsFavorited(true);
      }
      setLoading(false);
    }
    checkStatus();
  }, [buildId, supabase]);

  // 2. Funkce pro kliknutí
  const toggleFavorite = async () => {
    if (!userId) {
      // Pokud není přihlášený, šup s ním na login
      router.push("/login?message=Sign in to save builds");
      return;
    }

    // Optimistické UI: Hned změníme barvu, nečekáme na databázi
    const newState = !isFavorited;
    setIsFavorited(newState);

    if (newState) {
      // PŘIDAT LIKE
      await supabase.from("favorites").insert({
        user_id: userId,
        build_id: buildId,
      });
    } else {
      // ODEBRAT LIKE
      await supabase.from("favorites").delete()
        .eq("user_id", userId)
        .eq("build_id", buildId);
    }
    
    // Volitelné: Obnovit data na stránce, kdybychom zobrazovali počítadlo
    router.refresh(); 
  };

  if (loading) return <div className="w-8 h-8 animate-pulse bg-stone-800 rounded-full" />;

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-full border transition-all duration-300 group ${
        isFavorited 
          ? "bg-amber-900/20 border-amber-600 text-amber-500" 
          : "bg-stone-900 border-stone-700 text-stone-500 hover:border-amber-500 hover:text-amber-500"
      }`}
      title={isFavorited ? "Remove from favorites" : "Save build"}
    >
      {/* Ikona hvězdy (Star) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"} // Vyplněná vs Prázdná
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isFavorited ? "scale-110" : "group-hover:scale-110 transition-transform"}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}