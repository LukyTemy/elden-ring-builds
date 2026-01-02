"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBuild, deleteBuildAction } from './actions';
import ItemSelector from '@/components/ItemSelector';
import ConfirmationModal from '@/components/ConfirmationModal';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { toast } from "sonner";

export default function EditBuildForm({ buildId, initialData, userId, allItems }: any) {
  const router = useRouter();
  const [isSaving, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buildName, setBuildName] = useState(initialData.name || "");

  const [stats, setStats] = useState(initialData.stats || {
    vigor: 10, mind: 10, endurance: 10, strength: 10, 
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });

  const [equipment, setEquipment] = useState({
    rightHand1: "", rightHand2: "", rightHand3: "",
    leftHand1: "", leftHand2: "", leftHand3: "",
    head: "", chest: "", hands: "", legs: "", spirit: "",
    ...initialData.equipment
  });

  const [talismans, setTalismans] = useState(initialData.talismans || ["", "", "", ""]);
  const [spells, setSpells] = useState(initialData.spells || ["", "", "", ""]);
  const [tears, setTears] = useState(initialData.crystal_tears || ["", ""]);

  const statOrder = ['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane'];

  const getItemsByCategory = (cat: string) => allItems.filter((i: any) => i.category === cat);
  const soulLevel = Object.values(stats).reduce((a: any, b: any) => a + (Number(b) || 0), 0) - 79;

  const handleStatChange = (stat: string, val: number) => {
    setStats((prev: any) => ({ ...prev, [stat]: val }));
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
    if (buildName.length < 3) {
      toast.error("Build name must be at least 3 characters.");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const result = await updateBuild(buildId, {
        name: buildName,
        stats,
        equipment,
        talismans,
        spells,
        tears
      });
      
      if (result.success) {
        toast.success("Changes saved successfully.", { id: toastId });
        window.location.href = `/build/${buildId}`;
      }
    } catch (err: any) {
      toast.error("Error: " + err.message, { id: toastId });
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Discarding legend...");
    try {
      const result = await deleteBuildAction(buildId);
      if (result.success) {
        toast.success("Legend discarded successfully.", { id: toastId });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message, { id: toastId });
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Discard Legend"
        message="Are you certain you wish to erase this legend from the archives? This action cannot be undone."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-800 pb-10">
        <div className="w-full md:w-auto">
          <input
            type="text"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            className="bg-transparent border-none text-5xl md:text-6xl font-serif font-bold text-amber-500 uppercase tracking-tight focus:ring-0 w-full p-0 outline-none mb-3"
            placeholder="ENTER BUILD NAME..."
          />
          <p className="text-stone-400 text-lg uppercase tracking-[0.4em]">
            Soul Level <span className="text-stone-100 font-bold ml-2">{soulLevel > 1 ? soulLevel : 1}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSaving || isDeleting}
            className="p-4 bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/50 rounded-md transition-all disabled:opacity-50"
            title="Discard Build"
          >
            <Trash2 size={24} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="flex items-center gap-3 px-10 py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-md font-bold uppercase transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Updating...' : 'Update Build'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl backdrop-blur-sm sticky top-24">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Attributes</h3>
            <div className="space-y-6">
              {statOrder.map((statKey) => {
                const value = (stats as any)[statKey];
                return (
                  <div key={statKey}>
                    <div className="flex justify-between text-sm uppercase tracking-widest text-stone-400 mb-2 font-bold font-serif">
                      <span>{statKey}</span>
                      <span className="text-amber-500 text-lg">{value as number}</span>
                    </div>
                    <input
                      type="range" min="1" max="99" value={value as number}
                      onChange={(e) => handleStatChange(statKey, parseInt(e.target.value))}
                      className="w-full h-2 bg-stone-800 rounded-full appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Armaments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Right Hand</span>
                <ItemSelector label="Slot 1" category="weapons" items={getItemsByCategory('weapons')} isLoading={false} value={equipment.rightHand1} onSelect={(i: any) => handleItemSelect('rightHand1', i?.id || "")} />
                <ItemSelector label="Slot 2" category="weapons" items={getItemsByCategory('weapons')} isLoading={false} value={equipment.rightHand2} onSelect={(i: any) => handleItemSelect('rightHand2', i?.id || "")} />
                <ItemSelector label="Slot 3" category="weapons" items={getItemsByCategory('weapons')} isLoading={false} value={equipment.rightHand3} onSelect={(i: any) => handleItemSelect('rightHand3', i?.id || "")} />
              </div>
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Left Hand</span>
                <ItemSelector label="Slot 1" category="weapons" items={getItemsByCategory('weapons')} isLoading={false} value={equipment.leftHand1} onSelect={(i: any) => handleItemSelect('leftHand1', i?.id || "")} />
                <ItemSelector label="Slot 2" category="weapons" items={getItemsByCategory('weapons')} isLoading={false} value={equipment.leftHand2} onSelect={(i: any) => handleItemSelect('leftHand2', i?.id || "")} />
                <ItemSelector label="Slot 3" category="weapons" items={getItemsByCategory('weapons')} isLoading={false} value={equipment.leftHand3} onSelect={(i: any) => handleItemSelect('leftHand3', i?.id || "")} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
              <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Armor Set</h3>
              <div className="space-y-6">
                <ItemSelector label="Head" category="helm" items={getItemsByCategory('helm')} isLoading={false} value={equipment.head} onSelect={(i: any) => handleItemSelect('head', i?.id || "")} />
                <ItemSelector label="Chest" category="chest" items={getItemsByCategory('chest')} isLoading={false} value={equipment.chest} onSelect={(i: any) => handleItemSelect('chest', i?.id || "")} />
                <ItemSelector label="Hands" category="hands" items={getItemsByCategory('hands')} isLoading={false} value={equipment.hands} onSelect={(i: any) => handleItemSelect('hands', i?.id || "")} />
                <ItemSelector label="Legs" category="legs" items={getItemsByCategory('legs')} isLoading={false} value={equipment.legs} onSelect={(i: any) => handleItemSelect('legs', i?.id || "")} />
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
                <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Talismans</h3>
                <div className="space-y-6">
                  {talismans.map((t: string, idx: number) => (
                    <ItemSelector key={`talisman-${idx}`} label={`Slot ${idx + 1}`} category="talismans" items={getItemsByCategory('talismans')} isLoading={false} value={t} onSelect={(i: any) => handleItemSelect(`talisman-${idx}`, i?.id || "")} />
                  ))}
                </div>
              </div>
              
              <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
                 <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-4 border-b border-stone-800 pb-4 font-bold">Summon</h3>
                 <ItemSelector label="Spirit Ash" category="spirits" items={getItemsByCategory('spirits')} isLoading={false} value={equipment.spirit} onSelect={(i: any) => handleItemSelect('spirit', i?.id || "")} />
              </div>
            </div>
          </div>

          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">Magic & Wondrous Physick</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Spells</span>
                {spells.map((s: string, idx: number) => (
                  <ItemSelector key={`spell-${idx}`} label={`Slot ${idx + 1}`} category="spells" items={getItemsByCategory('spells')} isLoading={false} value={s} onSelect={(i: any) => handleItemSelect(`spell-${idx}`, i?.id || "")} />
                ))}
              </div>
              <div className="space-y-6">
                <span className="text-xs text-stone-500 uppercase font-bold tracking-widest block mb-2">Crystal Tears</span>
                {tears.map((t: string, idx: number) => (
                  <ItemSelector key={`tear-${idx}`} label={`Tear ${idx + 1}`} category="crystal_tears" items={getItemsByCategory('crystal_tears')} isLoading={false} value={t} onSelect={(i: any) => handleItemSelect(`tear-${idx}`, i?.id || "")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}