"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ItemSelector from '@/components/ItemSelector';
import { Save } from 'lucide-react';

export default function CreateBuild() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [buildName, setBuildName] = useState("");

  const [stats, setStats] = useState({
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });

  // ROZŠÍŘENÉ RUCE PODLE TVOJI STRUKTURY
  const [equipment, setEquipment] = useState({
    rightHand1: "", rightHand2: "", rightHand3: "",
    leftHand1: "", leftHand2: "", leftHand3: "",
    head: "", chest: "", hands: "", legs: "", spirit: ""
  });

  const [talismans, setTalismans] = useState(["", "", "", ""]);
  const [spells, setSpells] = useState(["", "", "", ""]);
  const [tears, setTears] = useState(["", ""]);

  // --- VÝPOČTY (HP, FP, Stamina, Load) ---
  const soulLevel = Object.values(stats).reduce((a, b) => a + b, 0) - 79;
  const hp = Math.floor(300 + (stats.vigor * 15));
  const fp = Math.floor(50 + (stats.mind * 9));
  const stamina = Math.floor(80 + (stats.endurance * 2));
  const load = (45 + (stats.endurance * 1.5)).toFixed(1);

  const isNameValid = buildName.trim().length > 0;

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

  const saveBuild = async () => {
    if (!isNameValid) return;
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('builds').insert({
      user_id: user.id,
      name: buildName,
      stats,
      equipment,
      talismans,
      spells,
      crystal_tears: tears
    });

    if (error) {
      alert("Error saving: " + error.message);
      setIsSaving(false);
    } else {
      router.push('/builds');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-800 pb-10">
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="ENTER BUILD NAME..."
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            className="bg-transparent border-none text-5xl md:text-6xl font-serif font-bold text-amber-500 uppercase tracking-tight placeholder:text-stone-800 focus:ring-0 w-full p-0"
          />
          <p className="text-stone-400 text-lg uppercase tracking-[0.4em] mt-3">
            Soul Level <span className="text-stone-100 font-bold ml-2">{soulLevel > 1 ? soulLevel : 1}</span>
          </p>
        </div>

        <button
          onClick={saveBuild}
          disabled={isSaving || !isNameValid}
          className={`flex items-center gap-3 px-10 py-4 rounded-md font-bold uppercase tracking-widest transition-all text-sm
            ${!isNameValid ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-lg'}`}
        >
          <Save size={20} /> {isSaving ? 'Saving...' : 'Save Build'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* STATS PANEL */}
        <div className="space-y-8">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl backdrop-blur-sm sticky top-24">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Attributes</h3>
            <div className="space-y-6">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat}>
                  <div className="flex justify-between text-sm uppercase tracking-widest text-stone-400 mb-2 font-bold">
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

            {/* LIVE CALCS */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { label: 'HP', val: hp, color: 'text-red-500' },
                { label: 'FP', val: fp, color: 'text-blue-400' },
                { label: 'Stamina', val: stamina, color: 'text-green-500' },
                { label: 'Load', val: load, color: 'text-stone-300' }
              ].map((s) => (
                <div key={s.label} className="bg-stone-950/60 border border-stone-800 p-4 rounded-lg text-center">
                  <div className="text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">{s.label}</div>
                  <div className={`${s.color} font-bold text-xl`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EQUIPMENT PANEL */}
        <div className="lg:col-span-2 space-y-10">
          
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Armaments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Right Hand</span>
                <ItemSelector label="Weapon 1" category="weapons" value={equipment.rightHand1} onSelect={(i) => handleItemSelect('rightHand1', i)} />
                <ItemSelector label="Weapon 2" category="weapons" value={equipment.rightHand2} onSelect={(i) => handleItemSelect('rightHand2', i)} />
                <ItemSelector label="Weapon 3" category="weapons" value={equipment.rightHand3} onSelect={(i) => handleItemSelect('rightHand3', i)} />
              </div>
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Left Hand</span>
                <ItemSelector label="Weapon 1" category="weapons" value={equipment.leftHand1} onSelect={(i) => handleItemSelect('leftHand1', i)} />
                <ItemSelector label="Weapon 2" category="weapons" value={equipment.leftHand2} onSelect={(i) => handleItemSelect('leftHand2', i)} />
                <ItemSelector label="Weapon 3" category="weapons" value={equipment.leftHand3} onSelect={(i) => handleItemSelect('leftHand3', i)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ARMOR SECTION */}
            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Armor Set</h3>
              <div className="space-y-6">
                <ItemSelector label="Head" category="helm" value={equipment.head} onSelect={(i) => handleItemSelect('head', i)} />
                <ItemSelector label="Chest" category="chest" value={equipment.chest} onSelect={(i) => handleItemSelect('chest', i)} />
                <ItemSelector label="Hands" category="hands" value={equipment.hands} onSelect={(i) => handleItemSelect('hands', i)} />
                <ItemSelector label="Legs" category="legs" value={equipment.legs} onSelect={(i) => handleItemSelect('legs', i)} />
              </div>
            </div>

            {/* TALISMANS & SPIRIT */}
            <div className="space-y-10">
              <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
                <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Talismans</h3>
                <div className="space-y-6">
                  {talismans.map((t, idx) => (
                    <ItemSelector key={idx} label={`Slot ${idx + 1}`} category="talismans" value={t} onSelect={(i) => handleItemSelect(`talisman-${idx}`, i)} />
                  ))}
                </div>
              </div>
              <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
                 <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-4 border-b border-stone-800 pb-4">Summon</h3>
                 <ItemSelector label="Spirit Ash" category="spirits" value={equipment.spirit} onSelect={(i) => handleItemSelect('spirit', i)} />
              </div>
            </div>
          </div>

          {/* MAGIC & MISC */}
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4">Magic & Wondrous Physick</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Spells</span>
                {spells.map((s, idx) => (
                  <ItemSelector key={idx} label={`Slot ${idx + 1}`} category="spells" value={s} onSelect={(i) => handleItemSelect(`spell-${idx}`, i)} />
                ))}
              </div>
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Crystal Tears</span>
                {tears.map((t, idx) => (
                  <ItemSelector key={idx} label={`Tear ${idx + 1}`} category="crystal_tears" value={t} onSelect={(i) => handleItemSelect(`tear-${idx}`, i)} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}