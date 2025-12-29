"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ItemSelector from '@/components/ItemSelector';

interface Item {
  id: string;
  weight: number;
}

export default function CreateBuild() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [buildName, setBuildName] = useState("");
  const [showMagic, setShowMagic] = useState(false);

  const [stats, setStats] = useState({
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });

  const [equipment, setEquipment] = useState({
    rightHand: "", head: "", chest: "", hands: "", legs: "", spirit: ""
  });

  const [talismans, setTalismans] = useState(["", "", "", ""]);
  const [spells, setSpells] = useState(["", "", "", ""]);
  const [tears, setTears] = useState(["", ""]);

  const [weights, setWeights] = useState<Record<string, number>>({});

  const soulLevel = Object.values(stats).reduce((a, b) => a + b, 0) - 79;
  const isNameValid = buildName.trim().length > 0;
  
  const currentLoad = Object.values(weights).reduce((a, b) => a + b, 0);
  // Zjednodušený vzorec pro Max Load (cca 45 base + scaling)
  const maxLoad = 45.0 + (stats.endurance > 8 ? (stats.endurance - 8) * 1.5 : 0); 
  const loadRatio = maxLoad > 0 ? (currentLoad / maxLoad) * 100 : 0;

  let rollType = "Light Roll";
  let rollColor = "text-green-500";
  let barColor = "bg-green-600";

  if (loadRatio >= 100) {
    rollType = "Overloaded"; rollColor = "text-red-600"; barColor = "bg-red-600";
  } else if (loadRatio >= 70) {
    rollType = "Fat Roll"; rollColor = "text-orange-500"; barColor = "bg-orange-600";
  } else if (loadRatio >= 30) {
    rollType = "Med. Roll"; rollColor = "text-yellow-500"; barColor = "bg-yellow-600";
  }

  const handleStatChange = (stat: keyof typeof stats, value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 99) {
      setStats(prev => ({ ...prev, [stat]: num }));
    }
  };

  const handleItemSelect = (key: string, item: Item | null) => {
    if (key.startsWith('talisman-')) {
      const index = parseInt(key.split('-')[1]);
      const newTalismans = [...talismans];
      newTalismans[index] = item ? item.id : "";
      setTalismans(newTalismans);
    } else if (key.startsWith('spell-')) {
        const index = parseInt(key.split('-')[1]);
        const newSpells = [...spells];
        newSpells[index] = item ? item.id : "";
        setSpells(newSpells);
    } else if (key.startsWith('tear-')) {
        const index = parseInt(key.split('-')[1]);
        const newTears = [...tears];
        newTears[index] = item ? item.id : "";
        setTears(newTears);
    } else {
      setEquipment(prev => ({ ...prev, [key]: item ? item.id : "" }));
    }

    setWeights(prev => ({ ...prev, [key]: item ? item.weight : 0 }));
  };

  const saveBuild = async () => {
    if (!isNameValid) return;
    setIsSaving(true);
    
    const buildData = {
      name: buildName,
      stats: stats,
      equipment: equipment,
      talismans: talismans,
      spells: spells,
      crystal_tears: tears
    };

    try {
      const { data, error } = await supabase.from('builds').insert([buildData]).select().single();
      if (error) throw error;
      if (data) router.push(`/build/${data.id}`);
    } catch (error: any) {
      alert('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32">
      
      <div className="mb-10 text-center">
        <input 
          type="text" 
          placeholder="NAME YOUR BUILD..." 
          className={`w-full max-w-3xl bg-transparent text-4xl md:text-5xl font-bold placeholder-stone-700 border-b outline-none py-4 text-center transition-colors
            ${isNameValid ? 'text-amber-500 border-amber-500' : 'text-stone-500 border-stone-800 focus:border-red-900'}
          `}
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEVÝ SLOUPEC (STATS & LOAD) --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl">
            <div className="flex justify-between items-end mb-6 border-b border-stone-700 pb-4">
              <h2 className="text-2xl text-amber-500 font-serif tracking-widest">Attributes</h2>
              <div className="text-right">
                <span className="text-stone-400 text-xs uppercase">Soul Level</span>
                <div className="text-3xl font-bold text-white">{soulLevel > 1 ? soulLevel : 1}</div>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3 hover:bg-stone-800/50 p-1 rounded transition-colors">
                  <label className="capitalize text-stone-400 w-24 font-medium text-sm">{key}</label>
                  <input 
                    type="number" 
                    value={val} 
                    onChange={(e) => handleStatChange(key as keyof typeof stats, e.target.value)}
                    className="w-12 bg-stone-950 border border-stone-700 rounded p-1 text-center text-amber-500 font-bold focus:border-amber-500 outline-none"
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

            {/* EQUIP LOAD BAR */}
            <div className="mt-8 pt-6 border-t border-stone-700">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-400 uppercase tracking-wider font-bold">Equip Load</span>
                    <span className={`font-bold uppercase ${rollColor}`}>{rollType}</span>
                </div>
                <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div 
                        className={`h-full transition-all duration-500 ${barColor}`} 
                        style={{ width: `${Math.min(loadRatio, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-stone-500 mt-1 font-mono">
                    <span>{currentLoad.toFixed(1)}</span>
                    <span> / {maxLoad.toFixed(1)}</span>
                </div>
            </div>
          </div>
        </div>

        {/* --- PRAVÝ SLOUPEC (GEAR) --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* WEAPONS & ARMOR */}
          <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl">
            <h2 className="text-2xl text-amber-500 font-serif tracking-widest mb-6 border-b border-stone-700 pb-2">
              Equipment
            </h2>
            
            <div className="space-y-6">
              <ItemSelector label="Right Hand" category="weapons" value={equipment.rightHand} onSelect={(i) => handleItemSelect('rightHand', i)} />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <ItemSelector label="Helm" category="helm" value={equipment.head} onSelect={(i) => handleItemSelect('head', i)} />
                <ItemSelector label="Chest" category="chest" value={equipment.chest} onSelect={(i) => handleItemSelect('chest', i)} />
                <ItemSelector label="Gauntlets" category="hands" value={equipment.hands} onSelect={(i) => handleItemSelect('hands', i)} />
                <ItemSelector label="Legs" category="legs" value={equipment.legs} onSelect={(i) => handleItemSelect('legs', i)} />
              </div>
            </div>
          </div>

          {/* TALISMANS & ITEMS */}
          <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-6 rounded-lg shadow-2xl">
             <h2 className="text-xl text-stone-300 font-serif tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-amber-600 rounded-full"></span> Talismans & Flask
             </h2>
             
             <div className="grid grid-cols-2 gap-4 mb-6">
                 {talismans.map((t, idx) => (
                    <ItemSelector 
                        key={`talisman-${idx}`} 
                        label={`Talisman ${idx + 1}`} 
                        category="talismans" 
                        value={t} 
                        onSelect={(i) => handleItemSelect(`talisman-${idx}`, i)} 
                    />
                 ))}
             </div>

             <div className="grid grid-cols-2 gap-4 border-t border-stone-800 pt-4">
                 <ItemSelector label="Crystal Tear 1" category="crystal_tears" value={tears[0]} onSelect={(i) => handleItemSelect('tear-0', i)} />
                 <ItemSelector label="Crystal Tear 2" category="crystal_tears" value={tears[1]} onSelect={(i) => handleItemSelect('tear-1', i)} />
             </div>
             
             <div className="mt-4 pt-4 border-t border-stone-800">
                <ItemSelector label="Spirit Ashes (Summon)" category="spirits" value={equipment.spirit} onSelect={(i) => handleItemSelect('spirit', i)} />
             </div>
          </div>

          {/* MAGIC TOGGLE SECTION */}
          <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-4 rounded-lg shadow-lg">
             <button 
                onClick={() => setShowMagic(!showMagic)}
                className="w-full flex justify-between items-center text-stone-400 hover:text-amber-500 transition-colors uppercase tracking-widest font-bold text-sm"
             >
                <span>Magic & Spells (Optional)</span>
                <span>{showMagic ? '−' : '+'}</span>
             </button>
             
             {showMagic && (
                 <div className="grid grid-cols-2 gap-4 mt-6 animate-in slide-in-from-top-2 duration-300">
                     {spells.map((s, idx) => (
                        <ItemSelector 
                            key={`spell-${idx}`} 
                            label={`Memory Slot ${idx + 1}`} 
                            category="spells" 
                            value={s} 
                            onSelect={(i) => handleItemSelect(`spell-${idx}`, i)} 
                        />
                     ))}
                 </div>
             )}
          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="col-span-1 lg:col-span-12 flex justify-center mt-4">
          <button
            onClick={saveBuild}
            disabled={isSaving || !isNameValid}
            className={`
              font-bold py-4 px-20 rounded shadow-lg text-xl tracking-widest transition-all
              ${!isNameValid 
                ? 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700' 
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 hover:scale-105 shadow-amber-900/20'}
            `}
          >
            {isSaving ? 'SAVING...' : isNameValid ? 'SAVE BUILD' : 'ENTER NAME FIRST'}
          </button>
        </div>

      </div>
    </div>
  );
}