"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Item {
  id: string;
  name: string;
  category: string;
  image: string | null;
}

export default function CreateBuild() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [stats, setStats] = useState({
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });
  
  const [weapons, setWeapons] = useState<Item[]>([]);
  const [armors, setArmors] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [equipment, setEquipment] = useState({
    rightHand: "",
    head: "",
    chest: "",
    hands: "",
    legs: ""
  });

  const soulLevel = Object.values(stats).reduce((a, b) => a + b, 0) - 79;

  useEffect(() => {
    async function fetchGear() {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, category, image')
        .in('category', ['weapons', 'armors'])
        .order('name');
      
      if (data) {
        setWeapons(data.filter(i => i.category === 'weapons'));
        setArmors(data.filter(i => i.category === 'armors'));
      }
      if (error) console.error(error);
      setLoading(false);
    }
    fetchGear();
  }, []);

  const handleStatChange = (stat: keyof typeof stats, value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 99) {
      setStats(prev => ({ ...prev, [stat]: num }));
    }
  };

  const saveBuild = async () => {
    setIsSaving(true);
    
    const buildData = {
      name: "Untitled Tarnished",
      stats: stats,
      equipment: equipment
    };

    try {
      const { data, error } = await supabase
        .from('builds')
        .insert([buildData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        alert(`Build saved! ID: ${data.id}`);
      }
      
    } catch (error: any) {
      console.error('Error saving build:', error);
      alert('Failed to save build: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const EquipmentSlot = ({ label, value, options, onChange }: any) => (
    <div className="bg-stone-950/50 p-3 rounded border border-stone-800 hover:border-amber-700 transition-colors group">
      <label className="block text-xs text-stone-500 mb-1 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
        {label}
      </label>
      <select 
        className="w-full bg-transparent text-stone-300 outline-none text-sm cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" className="bg-stone-900 text-stone-500">-- Empty --</option>
        {options.map((item: Item) => (
          <option key={item.id} value={item.id} className="bg-stone-900">
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
      
      <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl">
        <div className="flex justify-between items-end mb-8 border-b border-stone-700 pb-4">
          <h2 className="text-3xl text-amber-500 font-serif tracking-widest">Attributes</h2>
          <div className="text-right">
            <span className="text-stone-400 text-sm uppercase">Soul Level</span>
            <div className="text-4xl font-bold text-white">{soulLevel > 1 ? soulLevel : 1}</div>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="flex items-center gap-4 hover:bg-stone-800/50 p-1 rounded transition-colors">
              <label className="capitalize text-stone-400 w-28 font-medium">{key}</label>
              <input 
                type="number" 
                value={val} 
                onChange={(e) => handleStatChange(key as keyof typeof stats, e.target.value)}
                className="w-14 bg-stone-950 border border-stone-700 rounded p-1 text-center text-amber-500 font-bold focus:border-amber-500 outline-none"
              />
              <input 
                type="range" min="1" max="99" 
                value={val} 
                onChange={(e) => handleStatChange(key as keyof typeof stats, e.target.value)}
                className="flex-1 accent-amber-600 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl h-fit">
        <h2 className="text-3xl text-amber-500 font-serif tracking-widest mb-8 border-b border-stone-700 pb-4">
          Equipment
        </h2>
        
        {loading ? (
          <div className="text-stone-500 animate-pulse text-center py-10">Accessing Inventory...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-stone-400 text-sm uppercase font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span> Armament
              </h3>
              <EquipmentSlot 
                label="Right Hand" 
                value={equipment.rightHand} 
                options={weapons} 
                onChange={(v: string) => setEquipment(prev => ({...prev, rightHand: v}))} 
              />
            </div>

            <div>
              <h3 className="text-stone-400 text-sm uppercase font-bold mb-2 mt-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-stone-500 rounded-full"></span> Armor
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <EquipmentSlot 
                  label="Head" 
                  value={equipment.head} 
                  options={armors} 
                  onChange={(v: string) => setEquipment(prev => ({...prev, head: v}))} 
                />
                <EquipmentSlot 
                  label="Chest" 
                  value={equipment.chest} 
                  options={armors} 
                  onChange={(v: string) => setEquipment(prev => ({...prev, chest: v}))} 
                />
                <EquipmentSlot 
                  label="Gauntlets" 
                  value={equipment.hands} 
                  options={armors} 
                  onChange={(v: string) => setEquipment(prev => ({...prev, hands: v}))} 
                />
                <EquipmentSlot 
                  label="Legs" 
                  value={equipment.legs} 
                  options={armors} 
                  onChange={(v: string) => setEquipment(prev => ({...prev, legs: v}))} 
                />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-stone-800 opacity-50">
               <div className="text-xs text-stone-600 uppercase text-center">Talismans (Coming Soon)</div>
               <div className="flex justify-center gap-2 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 border border-stone-800 rounded bg-stone-950"></div>
                  ))}
               </div>
            </div>

          </div>
        )}
      </div>

      <div className="col-span-1 lg:col-span-2 flex justify-center mt-8 pt-8 border-t border-stone-800">
        <button
          onClick={saveBuild}
          disabled={isSaving}
          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-4 px-12 rounded shadow-lg text-xl tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'SAVING...' : 'SAVE BUILD'}
        </button>
      </div>

    </div>
  );
}