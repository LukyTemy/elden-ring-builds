"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Item {
  id: string;
  name: string;
  category: string;
}

export default function CreateBuild() {
  const [stats, setStats] = useState({
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });
  
  const [weapons, setWeapons] = useState<Item[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Výpočet Soul Levelu (základ je cca 1, zjednodušeno)
  const soulLevel = Object.values(stats).reduce((a, b) => a + b, 0) - 79;

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from('items')
        .select('id, name, category')
        .eq('category', 'weapons')
        .order('name');
      
      if (data) setWeapons(data);
      setLoading(false);
    }
    fetchItems();
  }, []);

  const handleStatChange = (stat: keyof typeof stats, value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 99) {
      setStats(prev => ({ ...prev, [stat]: num }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Levý sloupec - STATY */}
      <div className="bg-stone-900 p-6 rounded-lg border border-stone-800 shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-stone-700 pb-4">
          <h2 className="text-2xl text-amber-500 font-bold">Stats</h2>
          <span className="text-xl text-stone-300">Level: <span className="text-white font-bold">{soulLevel > 1 ? soulLevel : 1}</span></span>
        </div>

        <div className="space-y-4">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="capitalize text-stone-400 w-32 font-semibold">{key}</label>
              <input 
                type="number" 
                value={val} 
                onChange={(e) => handleStatChange(key as keyof typeof stats, e.target.value)}
                className="w-16 bg-stone-950 border border-stone-700 rounded p-2 text-center text-amber-500 focus:border-amber-500 outline-none"
              />
              <input 
                type="range" min="1" max="99" 
                value={val} 
                onChange={(e) => handleStatChange(key as keyof typeof stats, e.target.value)}
                className="w-full ml-4 accent-amber-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pravý sloupec - VYBAVENÍ */}
      <div className="bg-stone-900 p-6 rounded-lg border border-stone-800 shadow-xl">
        <h2 className="text-2xl text-amber-500 font-bold mb-6 border-b border-stone-700 pb-4">Equipment</h2>
        
        <div className="mb-6">
          <label className="block text-stone-400 mb-2 font-semibold">Right Hand Weapon</label>
          {loading ? (
            <div className="text-stone-500 animate-pulse">Loading arsenal...</div>
          ) : (
            <select 
              className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 outline-none focus:border-amber-500"
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value)}
            >
              <option value="">-- Select Weapon --</option>
              {weapons.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <div className="p-4 bg-stone-950/50 rounded text-stone-500 text-sm text-center border border-stone-800 border-dashed">
          More slots (Armor, Talismans) coming soon...
        </div>
      </div>

    </div>
  );
}