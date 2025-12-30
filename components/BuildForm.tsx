"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Save, Loader2, ArrowLeft } from "lucide-react";

interface BuildFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BuildForm({ initialData, isEditing }: BuildFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [stats, setStats] = useState(initialData?.stats || {
    vigor: 10, mind: 10, endurance: 10, strength: 10,
    dexterity: 10, intelligence: 10, faith: 10, arcane: 10
  });

  const [equipment, setEquipment] = useState(initialData?.equipment || {});
  const [talismans, setTalismans] = useState(initialData?.talismans || [null, null, null, null]);
  const [spells, setSpells] = useState(initialData?.spells || []);
  const [crystalTears, setCrystalTears] = useState(initialData?.crystal_tears || [null, null]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const buildData = {
      name,
      stats,
      equipment: Object.fromEntries(
        Object.entries(equipment).map(([slot, item]: [string, any]) => [slot, item?.id || null])
      ),
      talismans: talismans.map((t: any) => t?.id || null),
      spells: spells.map((s: any) => s?.id || null),
      crystal_tears: crystalTears.map((t: any) => t?.id || null),
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("builds")
          .update(buildData)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("builds").insert(buildData);
        if (error) throw error;
      }

      router.push(isEditing ? `/builds/${initialData.id}` : "/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error saving build:", error);
      alert("Chyba při ukládání buildu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="flex justify-between items-center bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
        <div className="flex-1">
          <label className="block text-xs uppercase tracking-[0.3em] text-stone-500 font-bold mb-4">
            Build Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-6 py-4 text-2xl font-serif text-amber-500 focus:outline-none focus:border-amber-600 transition-colors"
            placeholder="ENTER BUILD NAME..."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
          <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">
            Attributes
          </h3>
          <div className="space-y-6">
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="group">
                <div className="flex justify-between text-xs uppercase tracking-widest text-stone-400 mb-2 font-bold group-hover:text-stone-200 transition-colors">
                  <span>{stat}</span>
                  <span className="text-amber-500 text-lg">{value as number}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={value as number}
                  onChange={(e) => setStats({ ...stats, [stat]: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="bg-stone-900/40 border border-stone-800 p-8 rounded-xl">
            <h3 className="text-stone-100 text-xl font-serif uppercase tracking-widest mb-8 border-b border-stone-800 pb-4 font-bold">
              Current Equipment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(equipment).map(([slot, item]: [string, any]) => (
                <div key={slot} className="relative aspect-square bg-stone-950 border border-stone-800 rounded-lg flex flex-col items-center justify-center p-2 group hover:border-amber-900 transition-colors">
                  {item?.image ? (
                    <Image src={item.image} alt={slot} fill className="object-contain p-2" unoptimized />
                  ) : (
                    <span className="text-[10px] text-stone-700 uppercase font-bold text-center">{slot}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50 flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-3 px-6 py-4 bg-stone-900 border border-stone-700 text-stone-300 rounded-full font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-full font-bold uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Save />}
          {isEditing ? "Update Build" : "Create Build"}
        </button>
      </div>
    </form>
  );
}