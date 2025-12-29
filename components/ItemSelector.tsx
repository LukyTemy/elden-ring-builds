"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Item {
  id: string;
  name: string;
  image: string | null;
  category: string;
}

interface ItemSelectorProps {
  label: string;
  category: string; // Tímto říkáme, co má modal stahovat (např. 'helm', 'weapons')
  value: string; // ID vybraného itemu
  onChange: (id: string) => void;
  placeholderImage?: string; // Volitelná ikonka pro prázdný slot
}

export default function ItemSelector({ label, category, value, onChange }: ItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Ref pro input, abychom ho focusli po otevření
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Načtení detailů o aktuálně vybraném itemu (aby se zobrazil ve slotu, i když je modal zavřený)
  useEffect(() => {
    async function fetchCurrentItem() {
      if (!value) {
        setSelectedItem(null);
        return;
      }
      const { data } = await supabase.from('items').select('*').eq('id', value).single();
      if (data) setSelectedItem(data);
    }
    fetchCurrentItem();
  }, [value]);

  // Načtení seznamu itemů při otevření modalu
  useEffect(() => {
    if (isOpen && items.length === 0) {
      fetchItems();
    }
    if (isOpen) {
        // Malý timeout, aby se stihl vykreslit DOM
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function fetchItems() {
    setLoading(true);
    // Stáhneme vše z dané kategorie (zbraně, helmy...)
    // Řadíme abecedně
    const { data, error } = await supabase
      .from('items')
      .select('id, name, image, category')
      .eq('category', category) 
      .order('name');

    if (error) console.error(error);
    if (data) setItems(data);
    setLoading(false);
  }

  // Filtrace podle vyhledávání
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: Item | null) => {
    onChange(item ? item.id : "");
    setSelectedItem(item);
    setIsOpen(false);
    setSearch(""); // Vyčistit hledání pro příště
  };

  return (
    <>
      {/* --- VZHLED SLOTU NA STRÁNCE --- */}
      <div className="group">
        <label className="block text-xs text-stone-500 mb-1 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
          {label}
        </label>
        
        <button 
          onClick={() => setIsOpen(true)}
          className={`
            w-full h-16 bg-stone-950/50 border rounded flex items-center px-3 gap-3 transition-all
            ${selectedItem 
              ? 'border-amber-900/50 hover:border-amber-500' 
              : 'border-stone-800 hover:border-stone-600 border-dashed'}
          `}
        >
          {/* Ikonka itemu */}
          <div className="w-10 h-10 bg-stone-900 rounded border border-stone-800 flex items-center justify-center overflow-hidden shrink-0">
            {selectedItem?.image ? (
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-stone-900 opacity-20" /> 
            )}
          </div>

          {/* Název itemu */}
          <span className={`text-sm text-left truncate ${selectedItem ? 'text-stone-200 font-medium' : 'text-stone-600 italic'}`}>
            {selectedItem ? selectedItem.name : "Select Item..."}
          </span>

          {/* Šipka / Indikátor */}
          <div className="ml-auto text-stone-600 group-hover:text-amber-500">
            ▼
          </div>
        </button>
      </div>

      {/* --- MODAL OKNO --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            
          {/* Kliknutí mimo zavře modal */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            
            {/* Hlavička modalu */}
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/50 rounded-t-lg">
              <h3 className="text-xl text-amber-500 font-serif tracking-wide uppercase">{label} Selection</h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-white text-2xl px-2">&times;</button>
            </div>

            {/* Vyhledávání */}
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

            {/* Seznam itemů (Grid) */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="text-center py-10 text-stone-500 animate-pulse">Loading items from the Lands Between...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  
                  {/* Tlačítko pro "Empty Slot" */}
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
                      {/* Obrázek v seznamu */}
                      <div className="w-12 h-12 bg-stone-950 rounded border border-stone-800 shrink-0 overflow-hidden flex items-center justify-center relative">
                         {item.image ? (
                             <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                         ) : (
                             <span className="text-xs text-stone-700">?</span>
                         )}
                      </div>
                      
                      {/* Název */}
                      <span className="text-stone-300 group-hover:text-white truncate text-sm font-medium">
                        {item.name}
                      </span>
                    </button>
                  ))}

                  {filteredItems.length === 0 && (
                      <div className="col-span-full text-center py-8 text-stone-600">
                          No items found matching "{search}"
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