"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import FavoriteButton from '@/components/FavoriteButton';
import { Share2, Copy, Check } from 'lucide-react';

interface Build {
  id: string;
  name: string;
  stats: {
    vigor: number; mind: number; endurance: number; strength: number;
    dexterity: number; intelligence: number; faith: number; arcane: number;
  };
  equipment: Record<string, any>;
  talismans: any[];
  spells: any[];
  crystal_tears: any[];
}

export default function BuildView() {
  const params = useParams();
  const id = params?.id as string;
  
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function fetchBuild() {
      if (!id) return;
      const { data } = await supabase.from('builds').select('*').eq('id', id).single();
      if (data) setBuild(data as Build);
      setLoading(false);
    }
    fetchBuild();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="animate-spin h-12 w-12 border-t-2 border-amber-500 rounded-full mb-4"></div>
      <p className="text-amber-500 font-serif tracking-[0.2em] animate-pulse uppercase">Summoning Build...</p>
    </div>
  );

  if (!build) return <div className="text-center py-20 text-stone-500">Build not found.</div>;

  // --- VÝPOČTY ---
  const soulLevel = Object.values(build.stats).reduce((a, b) => a + b, 0) - 79;
  const hp = Math.floor(300 + (build.stats.vigor * 15));
  const fp = Math.floor(50 + (build.stats.mind * 9));
  const stamina = Math.floor(80 + (build.stats.endurance * 2));
  const load = (45 + (build.stats.endurance * 1.5)).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* HEADER - Větší jméno a jasnější level */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-800 pb-10">
        <div className="flex items-center gap-8">
          <FavoriteButton buildId={build.id} />
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-amber-500 uppercase tracking-tight mb-3">
              {build.name}
            </h1>
            <p className="text-stone-400 text-lg uppercase tracking-[0.4em]">
              Soul Level <span className="text-stone-100 font-bold ml-2">{soulLevel > 1 ? soulLevel : 1}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={copyLink}
            className="flex items-center gap-3 px-6 py-3 bg-stone-900 border border-stone-700 rounded-md hover:border-amber-600 transition-colors text-stone-200"
          >
            {isCopied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            <span className="text-sm uppercase tracking-widest font-bold">{isCopied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: STATS - Větší písmo a výraznější hodnoty */}
        <div className="space-y-8">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl backdrop-blur-sm">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Attributes</h3>
            <div className="space-y-6">
              {Object.entries(build.stats).map(([stat, value]) => (
                <div key={stat} className="group">
                  <div className="flex justify-between text-sm uppercase tracking-widest text-stone-400 mb-2 font-bold group-hover:text-stone-200 transition-colors">
                    <span>{stat}</span>
                    <span className="text-amber-500 text-lg">{value}</span>
                  </div>
                  <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 group-hover:bg-amber-500 transition-all duration-700" 
                      style={{ width: `${(value / 99) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SECONDARY STATS - Jasné a čitelné boxy */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { label: 'HP', val: hp, color: 'text-red-500' },
                { label: 'FP', val: fp, color: 'text-blue-400' },
                { label: 'Stamina', val: stamina, color: 'text-green-500' },
                { label: 'Equip Load', val: load, color: 'text-stone-300' }
              ].map((s) => (
                <div key={s.label} className="bg-stone-950/60 border border-stone-800 p-4 rounded-lg text-center shadow-inner">
                  <div className="text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">{s.label}</div>
                  <div className={`${s.color} font-bold text-xl`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EQUIPMENT - Větší řádky a texty itemů */}
        <div className="lg:col-span-2 space-y-10">
          
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Armaments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['rightHand1', 'leftHand1', 'rightHand2', 'leftHand2', 'rightHand3', 'leftHand3'].map((slot) => {
                const item = build.equipment?.[slot];
                return (
                  <div key={slot} className="flex items-center gap-5 p-4 bg-stone-950/40 border border-stone-800/60 rounded-lg hover:border-amber-900 transition-colors group">
                    <div className="w-16 h-16 relative bg-stone-900 border border-stone-800 rounded-md flex-shrink-0 overflow-hidden">
                      {item?.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-stone-700">None</div>}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-stone-600 font-bold tracking-widest mb-1 group-hover:text-stone-400 transition-colors">
                        {slot.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-stone-100 text-lg font-medium group-hover:text-amber-500 transition-colors">
                        {item?.name || '---'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ARMOR SECTION */}
            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Armor</h3>
              <div className="space-y-5">
                {['head', 'chest', 'hands', 'legs'].map((slot) => {
                  const item = build.equipment?.[slot];
                  return (
                    <div key={slot} className="flex items-center gap-5">
                      <div className="w-14 h-14 relative bg-stone-900 border border-stone-800 rounded flex-shrink-0 overflow-hidden shadow-lg">
                        {item?.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-stone-500 uppercase tracking-widest mb-1">{slot}</span>
                        <span className="text-stone-100 text-md font-medium">{item?.name || 'No Armor'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TALISMANS SECTION */}
            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Talismans</h3>
              <div className="space-y-5">
                {build.talismans?.map((item, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-14 h-14 relative bg-stone-900 border border-stone-800 rounded flex-shrink-0 overflow-hidden shadow-lg">
                      {item?.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <span className="text-stone-100 text-md font-medium">{item?.name || 'Empty Slot'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAGIC & MISC - Větší texty pro kouzla */}
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Magic & Wondrous Physick</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-4">Spells</span>
                {build.spells?.map((s, i) => s && (
                  <div key={i} className="text-stone-200 text-md bg-stone-950/40 p-4 rounded-lg border border-stone-800/80 hover:border-blue-900 transition-colors">
                    {s.name}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-4">Crystal Tears</span>
                {build.crystal_tears?.map((t, i) => t && (
                  <div key={i} className="text-amber-500/90 text-md bg-stone-950/40 p-4 rounded-lg border border-stone-800/80 hover:border-amber-900 transition-colors font-medium">
                    {t.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}