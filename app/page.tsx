// app/page.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  // Okamžitá detekce uživatele na serveru bez "problikávání" tlačítek
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    // Odstraněn min-h výpočet, aby obsah mohl volně dýchat
    <div className="relative flex items-center justify-center overflow-hidden">
      
      {/* BACKGROUND IMAGE - Použito fixed a inset-0 pro absolutní fullscreen bez black bars */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
        style={{ 
          backgroundImage: `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/page_bg_raw.jpg?t=1748630546')`,
        }}
      >
        {/* Temný overlay pro čitelnost textu */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/50 to-stone-950 shadow-[inset_0_0_200px_rgba(0,0,0,1)]"></div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-20 space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-4">
          <h2 className="text-amber-600 font-serif tracking-[0.5em] text-sm md:text-xl uppercase animate-pulse">
            The Grace Calls To You
          </h2>
          <h1 className="text-6xl md:text-9xl font-bold text-stone-100 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] tracking-tighter font-serif uppercase">
            Rise, <span className="text-amber-500">Tarnished</span>
          </h1>
        </div>

        <p className="text-lg md:text-2xl text-stone-300 max-w-3xl font-light leading-relaxed drop-shadow-md font-serif italic">
          The archives of the Lands Between await. Plan your attributes, master your armaments, and share your legend with the world.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-8 mt-6">
          {user ? (
            <Link 
              href="/create" 
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-6 px-16 rounded-sm text-2xl transition-all shadow-2xl shadow-amber-900/60 hover:-translate-y-1 uppercase tracking-widest font-serif"
            >
              Forge New Build
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-6 px-16 rounded-sm text-2xl transition-all shadow-2xl shadow-amber-900/60 hover:-translate-y-1 uppercase tracking-widest font-serif"
              >
                Join the Tarnished
              </Link>
              <Link 
                href="/builds" 
                className="bg-stone-900/80 hover:bg-stone-800 text-amber-500 border border-amber-900/50 font-bold py-6 px-16 rounded-sm text-2xl transition-all backdrop-blur-md hover:-translate-y-1 uppercase tracking-widest font-serif"
              >
                Explore Archives
              </Link>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM DECORATION - Silnější stín u spodku pro plynulý přechod */}
      <div className="fixed bottom-0 left-0 w-full h-48 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent pointer-events-none"></div>
    </div>
  );
}