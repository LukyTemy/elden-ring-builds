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
  };
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

      const equipmentIds = Object.values(buildData.equipment).filter(Boolean) as string[];

      if (equipmentIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('items')
          .select('id, name, category, image')
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

  const soulLevel = Object.values(build.stats).reduce((a, b) => a + b, 0) - 79;

  const StatRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex justify-between items-center py-2 border-b border-stone-800 last:border-0">
      <span className="text-stone-400 capitalize">{label}</span>
      <span className="text-amber-500 font-bold text-xl">{value}</span>
    </div>
  );

  const EquipmentRow = ({ label, itemId }: { label: string; itemId: string }) => {
    const item = items[itemId];
    return (
      <div className="py-3 border-b border-stone-800 last:border-0 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 uppercase tracking-widest block mb-1">{label}</span>
          <span className={`text-lg ${item ? 'text-stone-200' : 'text-stone-600 italic'}`}>
            {item ? item.name : 'Empty'}
          </span>
        </div>
        
        {item && item.image && (
          <div className="w-12 h-12 bg-stone-950 border border-stone-700 rounded overflow-hidden flex items-center justify-center">
             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex justify-between items-center border-b border-stone-800 pb-6">
        <div>
          <h1 className="text-4xl text-amber-500 font-bold mb-2">{build.name}</h1>
          <p className="text-stone-400 text-sm uppercase tracking-widest">
            Soul Level <span className="text-white font-bold">{soulLevel > 1 ? soulLevel : 1}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg h-full">
          <h2 className="text-2xl text-stone-200 font-serif mb-6 pb-2 border-b border-stone-700">Attributes</h2>
          <div className="space-y-1">
            {Object.entries(build.stats).map(([key, val]) => (
              <StatRow key={key} label={key} value={val} />
            ))}
          </div>
        </div>

        <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg h-full">
          <h2 className="text-2xl text-stone-200 font-serif mb-6 pb-2 border-b border-stone-700">Equipment</h2>
          <div className="space-y-2">
            <EquipmentRow label="Right Hand" itemId={build.equipment.rightHand} />
            <EquipmentRow label="Head" itemId={build.equipment.head} />
            <EquipmentRow label="Chest" itemId={build.equipment.chest} />
            <EquipmentRow label="Gauntlets" itemId={build.equipment.hands} />
            <EquipmentRow label="Legs" itemId={build.equipment.legs} />
          </div>
        </div>
      </div>
    </div>
  );
}