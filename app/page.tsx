"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      
      {/* BACKGROUND IMAGE WITH OVERLAY */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
        style={{ 
          // Můžeš použít vlastní URL nebo lokální soubor
          backgroundImage: `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/page_bg_raw.jpg?t=1748630546')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/40 to-stone-950 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-2">
          <h2 className="text-amber-600 font-serif tracking-[0.5em] text-sm md:text-lg uppercase animate-pulse">
            The Grace Calls To You
          </h2>
          <h1 className="text-6xl md:text-9xl font-bold text-stone-100 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] tracking-tighter font-serif">
            RISE, <span className="text-amber-500">TARNISHED</span>
          </h1>
        </div>

        <p className="text-lg md:text-2xl text-stone-300 max-w-2xl font-light leading-relaxed drop-shadow-md">
          The archives of the Lands Between await. Plan your attributes, master your armaments, and share your legend with the world.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          {user ? (
            <Link 
              href="/create" 
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-5 px-12 rounded-sm text-xl transition-all shadow-2xl shadow-amber-900/40 hover:-translate-y-1 uppercase tracking-widest"
            >
              Forge New Build
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-5 px-12 rounded-sm text-xl transition-all shadow-2xl shadow-amber-900/40 hover:-translate-y-1 uppercase tracking-widest"
              >
                Join the Tarnished
              </Link>
              <Link 
                href="/builds" 
                className="bg-stone-900/80 hover:bg-stone-800 text-amber-500 border border-amber-900/50 font-bold py-5 px-12 rounded-sm text-xl transition-all backdrop-blur-md hover:-translate-y-1 uppercase tracking-widest"
              >
                Explore Archives
              </Link>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM DECORATION */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-950 to-transparent"></div>
    </div>
  );
}