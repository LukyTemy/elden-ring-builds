"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Search, Loader2 } from "lucide-react";
import Image from "next/image";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: "weapons" | "armor" | "talismans" | "spells";
  onSelect: (item: any) => void;
}

export default function ItemModal({ isOpen, onClose, category, onSelect }: ItemModalProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  // 1. PŘESNÉ MAPOVÁNÍ PODLE TVÉHO VÝPISU Z DATABÁZE
  const dbCategoryMap: Record<string, string | string[]> = {
    weapons: "weapons",       // Přímá shoda
    talismans: "talismans",   // Přímá shoda
    spells: "spells",         // Přímá shoda
    // Armor na frontendu spojíme se 4 kategoriemi v DB
    armor: ["helm", "chest", "hands", "legs"], 
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchItems = async () => {
      setLoading(true);
      
      const targetCategory = dbCategoryMap[category];
      
      let query = supabase
        .from("items") // Tabulka se jmenuje 'items'
        .select("*")
        .order("name");

      // 2. Logika pro filtrování
      if (Array.isArray(targetCategory)) {
        // Pokud je to pole (Armor), použijeme .in()
        // To najde všechno, co je helm NEBO chest NEBO hands NEBO legs
        query = query.in("category", targetCategory);
      } else {
        // Pro zbraně, talismany atd. stačí rovná se
        query = query.eq("category", targetCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };

    fetchItems();
  }, [isOpen, category, supabase]); // dependencies

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/50 rounded-t-lg">
          <h2 className="text-xl font-serif text-amber-500 uppercase tracking-widest">
            Select {category}
          </h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-800 bg-stone-950">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              type="text"
              placeholder={`Search ${category}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-md py-2 pl-10 pr-4 text-stone-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-amber-500 gap-2">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-sm uppercase tracking-widest">Summoning items...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <p>No items found.</p>
              <p className="text-xs mt-2 text-stone-600">
                 Looking for category: <strong>{Array.isArray(dbCategoryMap[category]) ? (dbCategoryMap[category] as string[]).join(', ') : dbCategoryMap[category]}</strong>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="flex items-center gap-3 p-2 rounded border border-transparent hover:bg-stone-800 hover:border-stone-700 transition-all text-left group"
                >
                  <div className="w-12 h-12 relative bg-stone-900 border border-stone-800 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-700">IMG</div>
                    )}
                  </div>
                  <div>
                    <span className="block text-stone-300 text-sm font-medium group-hover:text-amber-500 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}