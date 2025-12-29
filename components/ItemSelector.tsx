"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image'; // Import pro správné načítání obrázků

interface Item {
  id: string;
  name: string;
  image: string | null;
  category: string;
  weight: number;
}

interface ItemSelectorProps {
  label: string;
  category: string;
  value: string;
  onSelect: (item: Item | null) => void; 
}

export default function ItemSelector({ label, category, value, onSelect }: ItemSelectorProps) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Načtení aktuálně vybraného itemu podle ID (value)
  useEffect(() => {
    async function fetchCurrentItem() {
      if (!value) {
        setSelectedItem(null);
        return;
      }
      // Optimalizace: Pokud už item máme v seznamu, netahat ho znovu
      const existing = items.find(i => i.id === value);
      if (existing) {
        setSelectedItem(existing);
        return;
      }

      const { data } = await supabase.from('items').select('*').eq('id', value).single();
      if (data) setSelectedItem(data);
    }
    fetchCurrentItem();
  }, [value, items, supabase]);

  // Funkce pro načtení seznamu (vytvořena pomocí useCallback pro stabilitu)
  const fetchItems = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    // Debug log - uvidíš v konzoli prohlížeče, co se reálně posílá
    console.log(`Fetching category: ${category}`);

    const { data, error } = await supabase
      .from('items')
      .select('id, name, image, category, weight')
      .eq('category', category) 
      .order('name');

    if (error) {
      console.error("Supabase Error:", error.message);
    }
    
    if (data) {
      setItems(data);
    }
    setLoading(false);
  }, [category, supabase]);

  // Spustit načítání, jakmile se Modal otevře
  useEffect(() => {
    if (isOpen) {
      fetchItems();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, fetchItems]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: Item | null) => {
    onSelect(item);
    setSelectedItem(item);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <>
      <div className="group">
        <label className="block text-xs text-stone-500 mb-1 uppercase tracking-widest group-hover:text-amber-500 transition-colors flex justify-between">
          <span>{label}</span>
          {selectedItem && selectedItem.weight > 0 && (
            <span className="text-stone-600 text-[10px]">Wgt: {selectedItem.weight}</span>
          )}
        </label>
        
        <button 
          type="button" // Důležité, aby nedocházelo k náhodnému odeslání formu
          onClick={() => setIsOpen(true)}
          className={`
            w-full h-16 bg-stone-950/50 border rounded flex items-center px-3 gap-3 transition-all relative
            ${selectedItem 
              ? 'border-amber-900/50 hover:border-amber-500' 
              : 'border-stone-800 hover:border-stone-600 border-dashed'}
          `}
        >
          <div className="w-10 h-10 bg-stone-900 rounded border border-stone-800 flex items-center justify-center overflow-hidden shrink-0 relative">
            {selectedItem?.image ? (
              <Image 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                fill 
                className="object-contain p-1" // Lepší zobrazení pro itemy z Elden Ring API
              />
            ) : (
              <div className="w-full h-full bg-stone-900 opacity-20" /> 
            )}
          </div>

          <span className={`text-sm text-left truncate pr-6 ${selectedItem ? 'text-stone-200 font-medium' : 'text-stone-600 italic'}`}>
            {selectedItem ? selectedItem.name : `Select ${label}...`}
          </span>

          <div className="ml-auto text-stone-600 group-hover:text-amber-500 absolute right-3">
            ▼
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-2xl relative z-10">
            
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/50 rounded-t-lg">
              <h3 className="text-xl text-amber-500 font-serif tracking-wide uppercase">{label} Selection</h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-white text-2xl px-2">&times;</button>
            </div>

            <div className="p-4 border-b border-stone-800 bg-stone-900 sticky top-0">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder={`Search ${category}...`} 
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 p-3 rounded focus:border-amber-500 outline-none placeholder-stone-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading && items.length === 0 ? (
                <div className="text-center py-10 text-stone-500 animate-pulse">Searching the Lands Between...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleSelect(null)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-red-900/20 border border-transparent hover:border-red-900/50 transition-colors text-left group"
                  >
                    <div className="w-12 h-12 bg-stone-950 border border-stone-800 rounded flex items-center justify-center text-stone-600 group-hover:text-red-500">
                        &times;
                    </div>
                    <span className="text-stone-500 group-hover:text-stone-300">Unequip / Empty</span>
                  </button>

                  {filteredItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => handleSelect(item)}
                      className={`
                        flex items-center gap-3 p-2 rounded border transition-all text-left group
                        ${selectedItem?.id === item.id 
                            ? 'bg-amber-900/20 border-amber-600/50' 
                            : 'bg-stone-950/30 border-stone-800 hover:border-stone-600 hover:bg-stone-800'}
                      `}
                    >
                      <div className="w-12 h-12 bg-stone-950 rounded border border-stone-800 shrink-0 overflow-hidden flex items-center justify-center relative">
                         {item.image ? (
                             <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                sizes="48px"
                                className="object-contain p-1"
                             />
                         ) : (
                             <span className="text-xs text-stone-700 font-bold">{item.weight}</span>
                         )}
                      </div>
                      
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-stone-300 group-hover:text-white truncate text-sm font-medium">
                            {item.name}
                        </span>
                        {item.weight > 0 && (
                            <span className="text-xs text-stone-600">Wgt: {item.weight}</span>
                        )}
                      </div>
                    </button>
                  ))}

                  {!loading && filteredItems.length === 0 && (
                      <div className="col-span-full text-center py-8 text-stone-600">
                          No {category} found matching "{search}"
                      </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}