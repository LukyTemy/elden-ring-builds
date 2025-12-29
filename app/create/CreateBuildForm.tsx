"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBuild } from './actions';
import ItemSelector from '@/components/ItemSelector';
import { createClient } from '@/utils/supabase/client';
import { Save, Loader2 } from 'lucide-react';

export default function CreateBuildForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [buildName, setBuildName] = useState("");
  
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [stats, setStats] = useState({
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });

  const [equipment, setEquipment] = useState({
    rightHand1: "", rightHand2: "", rightHand3: "",
    leftHand1: "", leftHand2: "", leftHand3: "",
    head: "", chest: "", hands: "", legs: "", spirit: ""
  });

  const [talismans, setTalismans] = useState(["", "", "", ""]);
  const [spells, setSpells] = useState(["", "", "", ""]);
  const [tears, setTears] = useState(["", ""]);

  // 1. OPRAVA LIMITU: Stahujeme ve dvou várkách, abychom obešli limit 1000
  useEffect(() => {
    async function loadData() {
      setIsDataLoading(true);
      console.log("Stahuji data (část 1)...");
      
      // První várka 0-1000
      const req1 = supabase.from('items').select('*').range(0, 999);
      // Druhá várka 1000-2000
      const req2 = supabase.from('items').select('*').range(1000, 1999);

      const [res1, res2] = await Promise.all([req1, req2]);

      const combined = [...(res1.data || []), ...(res2.data || [])];
      setAllItems(combined);
      console.log(`Celkem načteno ${combined.length} položek.`);
      setIsDataLoading(false);
    }
    loadData();
  }, [supabase]);

  const getItemsByCategory = (cat: string) => allItems.filter(i => i.category === cat);

  const soulLevel = Object.values(stats).reduce((a, b) => a + b, 0) - 79;
  const hp = Math.floor(300 + (stats.vigor * 15));
  const fp = Math.floor(50 + (stats.mind * 9));
  const stamina = Math.floor(80 + (stats.endurance * 2));
  const load = (45 + (stats.endurance * 1.5)).toFixed(1);

  const handleStatChange = (stat: string, val: number) => {
    setStats(prev => ({ ...prev, [stat]: val }));
  };

  const handleItemSelect = (slot: string, itemId: string) => {
    if (slot.startsWith('talisman-')) {
      const idx = parseInt(slot.split('-')[1]);
      const newTalis = [...talismans];
      newTalis[idx] = itemId;
      setTalismans(newTalis);
    } else if (slot.startsWith('spell-')) {
      const idx = parseInt(slot.split('-')[1]);
      const newSpells = [...spells];
      newSpells[idx] = itemId;
      setSpells(newSpells);
    } else if (slot.startsWith('tear-')) {
      const idx = parseInt(slot.split('-')[1]);
      const newTears = [...tears];
      newTears[idx] = itemId;
      setTears(newTears);
    } else {
      setEquipment(prev => ({ ...prev, [slot]: itemId }));
    }
  };

  const handleSave = async () => {
    if (!buildName.trim()) return;
    setIsSaving(true);
    try {
      const result = await createBuild({
        name: buildName,
        stats,
        equipment,
        talismans,
        spells,
        tears
      });
      
      if (result.success) {
        router.push("/dashboard"); // Přesměrování proběhne v klidu zde
      }
    } catch (err: any) {
      // Teď už to zachytí jen skutečné chyby, ne redirect
      alert("Error: " + err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-800 pb-10">
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="ENTER BUILD NAME..."
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            className="bg-transparent border-none text-5xl md:text-6xl font-serif font-bold text-amber-500 uppercase tracking-tight placeholder:text-stone-800 focus:ring-0 w-full p-0 outline-none"
          />
          <p className="text-stone-400 text-lg uppercase tracking-[0.4em] mt-3 font-serif">
            Soul Level <span className="text-stone-100 font-bold ml-2">{soulLevel > 1 ? soulLevel : 1}</span>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !buildName.trim()}
          className="flex items-center gap-3 px-10 py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-md font-bold uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {isSaving ? 'Forging...' : 'Save Build'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* STATS */}
        <div className="space-y-8">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl backdrop-blur-sm sticky top-24">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Attributes</h3>
            <div className="space-y-6">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat}>
                  <div className="flex justify-between text-sm uppercase tracking-widest text-stone-400 mb-2 font-bold font-serif">
                    <span>{stat}</span>
                    <span className="text-amber-500 text-lg">{value}</span>
                  </div>
                  <input
                    type="range" min="1" max="99" value={value}
                    onChange={(e) => handleStatChange(stat, parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-800 rounded-full appearance-none cursor-pointer accent-amber-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          {/* WEAPONS */}
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Armaments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Right Hand</span>
                <ItemSelector label="Weapon 1" category="weapons" items={getItemsByCategory('weapons')} isLoading={isDataLoading} value={equipment.rightHand1} onSelect={(i: any) => handleItemSelect('rightHand1', i?.id || "")} />
                <ItemSelector label="Weapon 2" category="weapons" items={getItemsByCategory('weapons')} isLoading={isDataLoading} value={equipment.rightHand2} onSelect={(i: any) => handleItemSelect('rightHand2', i?.id || "")} />
                <ItemSelector label="Weapon 3" category="weapons" items={getItemsByCategory('weapons')} isLoading={isDataLoading} value={equipment.rightHand3} onSelect={(i: any) => handleItemSelect('rightHand3', i?.id || "")} />
              </div>
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Left Hand</span>
                <ItemSelector label="Weapon 1" category="weapons" items={getItemsByCategory('weapons')} isLoading={isDataLoading} value={equipment.leftHand1} onSelect={(i: any) => handleItemSelect('leftHand1', i?.id || "")} />
                <ItemSelector label="Weapon 2" category="weapons" items={getItemsByCategory('weapons')} isLoading={isDataLoading} value={equipment.leftHand2} onSelect={(i: any) => handleItemSelect('leftHand2', i?.id || "")} />
                <ItemSelector label="Weapon 3" category="weapons" items={getItemsByCategory('weapons')} isLoading={isDataLoading} value={equipment.leftHand3} onSelect={(i: any) => handleItemSelect('leftHand3', i?.id || "")} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ARMOR */}
            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Armor Set</h3>
              <div className="space-y-6">
                <ItemSelector label="Head" category="helm" items={getItemsByCategory('helm')} isLoading={isDataLoading} value={equipment.head} onSelect={(i: any) => handleItemSelect('head', i?.id || "")} />
                <ItemSelector label="Chest" category="chest" items={getItemsByCategory('chest')} isLoading={isDataLoading} value={equipment.chest} onSelect={(i: any) => handleItemSelect('chest', i?.id || "")} />
                <ItemSelector label="Hands" category="hands" items={getItemsByCategory('hands')} isLoading={isDataLoading} value={equipment.hands} onSelect={(i: any) => handleItemSelect('hands', i?.id || "")} />
                <ItemSelector label="Legs" category="legs" items={getItemsByCategory('legs')} isLoading={isDataLoading} value={equipment.legs} onSelect={(i: any) => handleItemSelect('legs', i?.id || "")} />
              </div>
            </div>

            <div className="space-y-10">
              {/* TALISMANS */}
              <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
                <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Talismans</h3>
                <div className="space-y-6">
                  {talismans.map((t, idx) => (
                    <ItemSelector key={`talisman-${idx}`} label={`Slot ${idx + 1}`} category="talismans" items={getItemsByCategory('talismans')} isLoading={isDataLoading} value={t} onSelect={(i: any) => handleItemSelect(`talisman-${idx}`, i?.id || "")} />
                  ))}
                </div>
              </div>
              
              {/* SPIRITS (Teď už načtené) */}
              <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
                 <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-4 border-b border-stone-800 pb-4 font-bold">Summon</h3>
                 <ItemSelector label="Spirit Ash" category="spirits" items={getItemsByCategory('spirits')} isLoading={isDataLoading} value={equipment.spirit} onSelect={(i: any) => handleItemSelect('spirit', i?.id || "")} />
              </div>
            </div>
          </div>

          {/* MAGIC & TEARS SECTION (VRÁCENO ZPĚT) */}
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Magic & Wondrous Physick</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Spells</span>
                {spells.map((s, idx) => (
                  <ItemSelector key={`spell-${idx}`} label={`Slot ${idx + 1}`} category="spells" items={getItemsByCategory('spells')} isLoading={isDataLoading} value={s} onSelect={(i: any) => handleItemSelect(`spell-${idx}`, i?.id || "")} />
                ))}
              </div>
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Crystal Tears</span>
                {tears.map((t, idx) => (
                  <ItemSelector key={`tear-${idx}`} label={`Tear ${idx + 1}`} category="crystal_tears" items={getItemsByCategory('crystal_tears')} isLoading={isDataLoading} value={t} onSelect={(i: any) => handleItemSelect(`tear-${idx}`, i?.id || "")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}