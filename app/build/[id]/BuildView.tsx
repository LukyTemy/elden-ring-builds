"use client";

import { useState } from 'react';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import { Share2, Check } from 'lucide-react';
import { toast } from "sonner";

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
  likes_count: number;
  is_liked: boolean;
}

export default function BuildView({ initialBuild, userId }: { initialBuild: any, userId?: string }) {
  const build = initialBuild;
  const [isCopied, setIsCopied] = useState(false);

  const stats = build.stats || {};
  const v = stats.vigor || 1;
  const m = stats.mind || 1;
  const e = stats.endurance || 1;

  const calculateHP = (lvl: number) => {
    if (lvl <= 25) return Math.floor(300 + 500 * Math.pow((lvl - 1) / 24, 1.5));
    if (lvl <= 40) return Math.floor(800 + 650 * Math.pow((lvl - 25) / 15, 1.1));
    if (lvl <= 60) return Math.floor(1450 + 450 * (1 - Math.pow(1 - (lvl - 40) / 20, 1.2)));
    return Math.floor(1900 + 200 * (1 - Math.pow(1 - (lvl - 60) / 39, 1.2)));
  };

  const calculateFP = (lvl: number) => {
    if (lvl <= 15) return Math.floor(50 + 45 * ((lvl - 1) / 14));
    if (lvl <= 35) return Math.floor(95 + 105 * ((lvl - 15) / 20));
    if (lvl <= 60) return Math.floor(200 + 150 * (1 - Math.pow(1 - (lvl - 35) / 25, 1.2)));
    return Math.floor(350 + 100 * ((lvl - 60) / 39));
  };

  const calculateMaxLoad = (lvl: number) => {
    let val;
    if (lvl <= 25) val = 45 + 27 * ((lvl - 8) / 17);
    else if (lvl <= 60) val = 72 + 48 * Math.pow((lvl - 25) / 35, 1.1);
    else val = 120 + 40 * ((lvl - 60) / 39);
    return val.toFixed(1);
  };

  const soulLevel = Object.values(stats).reduce((a, b) => a + (Number(b) || 0), 0) - 79;
  const hp = calculateHP(v);
  const fp = calculateFP(m);
  const stamina = Math.floor(80 + (e * 1.5)); 
  const maxLoad = calculateMaxLoad(e);

  const statOrder = ['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane'];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success("Link copied to clipboard.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-800 pb-10">
        <div className="flex items-center gap-6 w-full md:w-auto min-w-0">
          <div className="shrink-0 relative z-20">
            <FavoriteButton 
              key={build.id}
              buildId={build.id} 
              initialLikes={build.likes_count} 
              initialIsLiked={build.is_liked}
              userId={userId}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-amber-500 uppercase tracking-tight mb-3 break-words leading-[1.1]">
              {build.name}
            </h1>
            <p className="text-stone-400 text-lg uppercase tracking-[0.4em]">
              Soul Level <span className="text-stone-100 font-bold ml-2">{soulLevel > 1 ? soulLevel : 1}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 relative z-10">
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
        <div className="space-y-8">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl backdrop-blur-sm">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Attributes</h3>
            <div className="space-y-6">
              {statOrder.map((statKey) => {
                const value = stats[statKey] || 0;
                return (
                  <div key={statKey} className="group">
                    <div className="flex justify-between text-sm uppercase tracking-widest text-stone-400 mb-2 font-bold group-hover:text-stone-200 transition-colors font-serif italic">
                      <span>{statKey}</span>
                      <span className="text-amber-500 text-lg">{value as number}</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-600 transition-all duration-700" 
                        style={{ width: `${((Number(value) || 0) / 99) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { label: 'HP', val: hp, color: 'text-red-500' },
                { label: 'FP', val: fp, color: 'text-blue-400' },
                { label: 'Stamina', val: stamina, color: 'text-green-500' },
                { label: 'Max Load', val: maxLoad, color: 'text-stone-300' }
              ].map((s) => (
                <div key={s.label} className="bg-stone-950/60 border border-stone-800 p-4 rounded-lg text-center shadow-inner">
                  <div className="text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold font-serif">{s.label}</div>
                  <div className={`${s.color} font-bold text-xl`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Armaments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['rightHand1', 'leftHand1', 'rightHand2', 'leftHand2', 'rightHand3', 'leftHand3'].map((slot) => {
                const item = build.equipment?.[slot];
                return (
                  <div key={slot} className="flex items-center gap-5 p-4 bg-stone-950/40 border border-stone-800 rounded-lg hover:border-amber-900 transition-colors group">
                    <div className="w-16 h-16 relative bg-stone-900 border border-stone-800 rounded-md shrink-0 overflow-hidden">
                      {item?.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase text-stone-600 font-bold tracking-widest mb-1">{slot}</div>
                      <div className="text-stone-100 text-lg font-medium group-hover:text-amber-500 transition-colors truncate">{item?.name || '---'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Armor</h3>
              <div className="space-y-5">
                {['head', 'chest', 'hands', 'legs'].map((slot) => {
                  const item = build.equipment?.[slot];
                  return (
                    <div key={slot} className="flex items-center gap-5 p-2 rounded hover:bg-stone-900/40 transition-colors group">
                      <div className="w-14 h-14 relative bg-stone-900 border border-stone-800 rounded overflow-hidden shrink-0">
                        {item?.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-stone-500 uppercase tracking-widest mb-1 font-bold italic">{slot}</span>
                        <span className="text-stone-100 text-md font-medium truncate">{item?.name || 'No Armor'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Talismans</h3>
              <div className="space-y-5">
                {build.talismans?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-5 p-2 rounded hover:bg-stone-900/40 transition-colors group">
                    <div className="w-14 h-14 relative bg-stone-900 border border-stone-800 rounded overflow-hidden shrink-0">
                      {item?.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />}
                    </div>
                    <span className="text-stone-100 text-md font-medium truncate">{item?.name || 'Empty Slot'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Magic & Wondrous Physick</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-4">Spells</span>
                {build.spells?.map((s: any, i: number) => s && (
                  <div key={i} className="text-stone-200 text-md bg-stone-950/40 p-4 rounded-lg border border-stone-800/80 hover:border-blue-900 transition-colors truncate">
                    {s.name}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-4">Crystal Tears</span>
                {build.crystal_tears?.map((t: any, i: number) => t && (
                  <div key={i} className="text-amber-500/90 text-md bg-stone-950/40 p-4 rounded-lg border border-stone-800/80 font-medium truncate">
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