"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Item {
  id: string;
  name: string;
  category: string;
  image: string | null;
  weight: number;
}

interface Build {
  id: string;
  name: string;
  stats: {
    vigor: number;
    mind: number;
    endurance: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    faith: number;
    arcane: number;
  };
  equipment: {
    rightHand: string;
    head: string;
    chest: string;
    hands: string;
    legs: string;
    spirit: string;
  };
  talismans: string[];
  spells: string[];
  crystal_tears: string[];
}

export default function BuildPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [build, setBuild] = useState<Build | null>(null);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBuild() {
      if (!id) return;

      // 1. Stáhneme build včetně nových JSON sloupců
      const { data: buildData, error } = await supabase
        .from('builds')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !buildData) {
        setLoading(false);
        return;
      }

      setBuild(buildData);

      // 2. Sesbíráme všechna ID itemů (equipment + talismans + spells + tears)
      const equipmentIds = [
        ...Object.values(buildData.equipment),
        ...(buildData.talismans || []),
        ...(buildData.spells || []),
        ...(buildData.crystal_tears || [])
      ].filter(Boolean) as string[];

      // 3. Stáhneme detaily itemů (včetně váhy)
      if (equipmentIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('items')
          .select('id, name, category, image, weight')
          .in('id', equipmentIds);

        if (itemsData) {
          const itemsMap = itemsData.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {} as Record<string, Item>);
          setItems(itemsMap);
        }
      }

      setLoading(false);
    }

    fetchBuild();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-amber-500 text-xl animate-pulse">
        Summoning build data...
      </div>
    );
  }

  if (!build) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl text-red-500 font-bold">Build Not Found</h1>
        <Link href="/create" className="text-stone-400 hover:text-white underline">
          Return to Roundtable Hold
        </Link>
      </div>
    );
  }

  // --- VÝPOČTY (Level & Load) ---
  const soulLevel = Object.values(build.stats).reduce((a, b) => a + b, 0) - 79;

  // Spočítat aktuální váhu ze všech nasazených věcí
  const currentLoad = [
    ...Object.values(build.equipment),
    ...(build.talismans || [])
  ].reduce((total, itemId) => {
    const item = items[itemId];
    return total + (item?.weight || 0);
  }, 0);

  // Max Load vzorec (stejný jako v Create)
  const maxLoad = 45.0 + (build.stats.endurance > 8 ? (build.stats.endurance - 8) * 1.5 : 0);
  const loadRatio = maxLoad > 0 ? (currentLoad / maxLoad) * 100 : 0;

  let rollType = "Light Load";
  let rollColor = "text-green-500";
  let barColor = "bg-green-600";

  if (loadRatio >= 100) {
    rollType = "Overloaded"; rollColor = "text-red-600"; barColor = "bg-red-600";
  } else if (loadRatio >= 70) {
    rollType = "Fat Roll"; rollColor = "text-orange-500"; barColor = "bg-orange-600";
  } else if (loadRatio >= 30) {
    rollType = "Med. Roll"; rollColor = "text-yellow-500"; barColor = "bg-yellow-600";
  }


  // --- POMOCNÉ KOMPONENTY ---
  const StatRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex justify-between items-center py-2 border-b border-stone-800 last:border-0">
      <span className="text-stone-400 capitalize">{label}</span>
      <span className="text-amber-500 font-bold text-xl">{value}</span>
    </div>
  );

  const ItemRow = ({ label, itemId, subLabel }: { label?: string; itemId: string, subLabel?: string }) => {
    const item = items[itemId];
    return (
      <div className="py-3 border-b border-stone-800 last:border-0 flex items-center justify-between group">
        <div className="flex items-center gap-4">
            {/* Obrázek */}
            <div className="w-12 h-12 bg-stone-950 border border-stone-800 rounded overflow-hidden flex items-center justify-center shrink-0">
                {item?.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-stone-900 opacity-20" />
                )}
            </div>
            
            {/* Texty */}
            <div>
                {label && <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">{label}</span>}
                <span className={`text-base ${item ? 'text-stone-200' : 'text-stone-600 italic'}`}>
                    {item ? item.name : 'Empty'}
                </span>
                {subLabel && <span className="text-xs text-stone-500 block">{subLabel}</span>}
            </div>
        </div>

        {/* Váha (pokud existuje) */}
        {item && item.weight > 0 && (
            <span className="text-xs text-stone-600 font-mono">Wgt: {item.weight}</span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-800 pb-6 gap-4">
        <div>
          <h1 className="text-4xl text-amber-500 font-bold mb-2 uppercase tracking-wide">{build.name}</h1>
          <p className="text-stone-400 text-sm uppercase tracking-widest">
            Soul Level <span className="text-white font-bold">{soulLevel > 1 ? soulLevel : 1}</span>
          </p>
        </div>
        <Link 
          href="/create"
          className="px-6 py-2 border border-stone-700 hover:border-amber-600 rounded text-stone-400 hover:text-amber-500 transition-colors uppercase text-sm tracking-widest"
        >
          Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COL: STATS --- */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg">
            <h2 className="text-2xl text-stone-200 font-serif mb-6 pb-2 border-b border-stone-700">Attributes</h2>
            <div className="space-y-1">
                {Object.entries(build.stats).map(([key, val]) => (
                <StatRow key={key} label={key} value={val} />
                ))}
            </div>

            {/* EQUIP LOAD DISPLAY */}
            <div className="mt-8 pt-6 border-t border-stone-800">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-stone-400 uppercase tracking-wider font-bold">Equip Load</span>
                    <span className={`font-bold uppercase ${rollColor}`}>{rollType}</span>
                </div>
                <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div 
                        className={`h-full ${barColor}`} 
                        style={{ width: `${Math.min(loadRatio, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] text-stone-600 mt-1 font-mono">
                    <span>{currentLoad.toFixed(1)}</span>
                    <span>Max: {maxLoad.toFixed(1)}</span>
                </div>
            </div>
            </div>
        </div>

        {/* --- RIGHT COL: EQUIPMENT --- */}
        <div className="lg:col-span-7 space-y-6">
            
            {/* MAIN GEAR */}
            <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg">
                <h2 className="text-2xl text-amber-500 font-serif mb-4 pb-2 border-b border-stone-700">Equipment</h2>
                <div className="space-y-1">
                    <ItemRow label="Right Hand" itemId={build.equipment.rightHand} />
                    <ItemRow label="Head" itemId={build.equipment.head} />
                    <ItemRow label="Chest" itemId={build.equipment.chest} />
                    <ItemRow label="Gauntlets" itemId={build.equipment.hands} />
                    <ItemRow label="Legs" itemId={build.equipment.legs} />
                    <ItemRow label="Spirit Ash" itemId={build.equipment.spirit} />
                </div>
            </div>

            {/* TALISMANS & FLASK */}
            <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg">
                <h2 className="text-xl text-stone-300 font-serif mb-4 pb-2 border-b border-stone-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-600 rounded-full"></span> Talismans & Flask
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Talismans */}
                    <div className="col-span-full mb-4 space-y-2">
                        {build.talismans?.map((id, i) => (
                            <ItemRow key={`talisman-${i}`} itemId={id} subLabel={`Talisman ${i+1}`} />
                        ))}
                         {(!build.talismans || build.talismans.length === 0) && <p className="text-stone-600 italic text-sm">No talismans equipped</p>}
                    </div>

                    {/* Flask */}
                    <div className="col-span-full pt-4 border-t border-stone-800 space-y-2">
                         <h3 className="text-xs text-stone-500 uppercase tracking-widest mb-2">Flask of Wondrous Physick</h3>
                         {build.crystal_tears?.map((id, i) => (
                            <ItemRow key={`tear-${i}`} itemId={id} />
                        ))}
                         {(!build.crystal_tears || build.crystal_tears.every(t => !t)) && <p className="text-stone-600 italic text-sm">Empty Flask</p>}
                    </div>
                </div>
            </div>

            {/* SPELLS (Zobrazit jen pokud nějaké jsou) */}
            {build.spells && build.spells.some(s => s) && (
                <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg">
                    <h2 className="text-xl text-blue-400 font-serif mb-4 pb-2 border-b border-stone-700">Magic & Spells</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {build.spells.map((id, i) => id && (
                             <ItemRow key={`spell-${i}`} itemId={id} />
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}