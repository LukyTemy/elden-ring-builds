"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ItemSelector from '@/components/ItemSelector'; // Importujeme novou komponentu

export default function CreateBuild() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [buildName, setBuildName] = useState("");

  const [stats, setStats] = useState({
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });
  
  // Už nepotřebujeme stahovat weapons/armors tady. Komponenta si to řeší sama.

  const [equipment, setEquipment] = useState({
    rightHand: "",
    head: "",
    chest: "",
    hands: "",
    legs: ""
  });

  const soulLevel = Object.values(stats).reduce((a, b) => a + b, 0) - 79;
  const isNameValid = buildName.trim().length > 0;

  const handleStatChange = (stat: keyof typeof stats, value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 99) {
      setStats(prev => ({ ...prev, [stat]: num }));
    }
  };

  const saveBuild = async () => {
    if (!isNameValid) return;

    setIsSaving(true);
    
    const buildData = {
      name: buildName,
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
        router.push(`/build/${data.id}`);
      }
      
    } catch (error: any) {
      console.error('Error saving build:', error);
      alert('Failed to save build: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* NAME INPUT */}
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="ENTER BUILD NAME..." 
          className={`w-full bg-transparent text-4xl md:text-5xl font-bold placeholder-stone-700 border-b outline-none py-4 text-center transition-colors
            ${isNameValid ? 'text-amber-500 border-amber-500' : 'text-stone-500 border-stone-800 focus:border-red-900'}
          `}
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
        />
        {!isNameValid && (
          <p className="text-center text-stone-600 text-sm mt-2 uppercase tracking-widest">
            * Name required to save
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- STATY --- */}
        <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl h-full">
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

        {/* --- VYBAVENÍ (S novými modaly) --- */}
        <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl h-full flex flex-col justify-between">
          <div>
            <h2 className="text-3xl text-amber-500 font-serif tracking-widest mb-8 border-b border-stone-700 pb-4">
              Equipment
            </h2>
            
            <div className="space-y-8">
              {/* Sekce: Zbraně */}
              <div>
                <h3 className="text-stone-400 text-sm uppercase font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full"></span> Armament
                </h3>
                <ItemSelector 
                  label="Right Hand Weapon"
                  category="weapons" 
                  value={equipment.rightHand}
                  onChange={(val) => setEquipment({...equipment, rightHand: val})}
                />
              </div>

              {/* Sekce: Armor (Správně rozděleno) */}
              <div>
                <h3 className="text-stone-400 text-sm uppercase font-bold mb-3 mt-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-stone-500 rounded-full"></span> Armor
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <ItemSelector 
                    label="Helm"
                    category="helm" 
                    value={equipment.head}
                    onChange={(val) => setEquipment({...equipment, head: val})}
                  />
                  <ItemSelector 
                    label="Chest Armor"
                    category="chest" 
                    value={equipment.chest}
                    onChange={(val) => setEquipment({...equipment, chest: val})}
                  />
                  <ItemSelector 
                    label="Gauntlets"
                    category="hands" 
                    value={equipment.hands}
                    onChange={(val) => setEquipment({...equipment, hands: val})}
                  />
                  <ItemSelector 
                    label="Leg Armor"
                    category="legs" 
                    value={equipment.legs}
                    onChange={(val) => setEquipment({...equipment, legs: val})}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="col-span-1 lg:col-span-2 flex justify-center mt-8 pt-8 border-t border-stone-800">
          <button
            onClick={saveBuild}
            disabled={isSaving || !isNameValid}
            className={`
              font-bold py-4 px-12 rounded shadow-lg text-xl tracking-widest transition-all
              ${!isNameValid 
                ? 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700' 
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 hover:scale-105 shadow-amber-900/20'}
            `}
          >
            {isSaving ? 'SAVING...' : isNameValid ? 'SAVE BUILD' : 'ENTER NAME'}
          </button>
        </div>

      </div>
    </div>
  );
}