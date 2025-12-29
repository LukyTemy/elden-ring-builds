"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Sword } from "lucide-react";

interface BuildCardProps {
  build: any;
}

export default function BuildCard({ build }: BuildCardProps) {
  // Výpočet levelu
  const level = Object.values(build.stats).reduce((a: any, b: any) => a + b, 0) - 79;
  const safeLevel = level > 1 ? level : 1;

  // Získání hlavní zbraně pro náhled (Right Hand 1)
  const mainWeapon = build.equipment?.rightHand1;
  const username = build.profiles?.username || "Tarnished";

  // Nejvyšší stat (pro zobrazení typu buildu, např. "Strength Build")
  const stats = build.stats;
  const maxStatName = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);
  
  return (
    <Link 
      href={`/build/${build.id}`}
      className="group relative flex flex-col bg-stone-900/40 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-600/50 hover:bg-stone-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20"
    >
      {/* Horní část s ikonou zbraně */}
      <div className="h-32 bg-stone-950/50 relative border-b border-stone-800 flex items-center justify-center p-4">
        {mainWeapon?.image ? (
          <div className="w-20 h-20 relative drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Image 
              src={mainWeapon.image} 
              alt={mainWeapon.name} 
              fill 
              className="object-contain" 
            />
          </div>
        ) : (
          <Sword className="text-stone-800 w-16 h-16" />
        )}
        
        {/* Level Badge */}
        <div className="absolute top-3 right-3 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-xs font-mono text-amber-500 font-bold">
          RL {safeLevel}
        </div>
      </div>

      {/* Spodní část s infem */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="text-xl font-serif text-stone-200 font-bold truncate group-hover:text-amber-500 transition-colors uppercase tracking-wide">
            {build.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <User size={12} className="text-stone-500" />
            <span className="text-xs text-stone-500 uppercase tracking-widest truncate">
              {username}
            </span>
          </div>
        </div>

        {/* Mini Stats Preview */}
        <div className="mt-auto pt-4 border-t border-stone-800/50 flex justify-between items-end">
             <div className="flex flex-col">
                <span className="text-[10px] text-stone-600 uppercase tracking-widest">Focus</span>
                <span className="text-xs text-stone-300 font-bold uppercase">{maxStatName}</span>
             </div>
             
             {/* Zobrazíme název hlavní zbraně pokud se vejde, jinak nic */}
             {mainWeapon && (
                 <div className="flex flex-col items-end max-w-[50%]">
                    <span className="text-[10px] text-stone-600 uppercase tracking-widest">Main</span>
                    <span className="text-xs text-stone-400 truncate w-full text-right">{mainWeapon.name}</span>
                 </div>
             )}
        </div>
      </div>
    </Link>
  );
}