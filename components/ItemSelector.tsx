"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ItemSelectorProps {
  label: string;
  category: string;
  value: string;
  items: any[];
  isLoading: boolean;
  onSelect: (item: any | null) => void; 
}

export default function ItemSelector({ label, category, value, items, isLoading, onSelect }: ItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(i => i.id === value) || null;

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="group">
      <label className="block text-xs text-stone-500 mb-1 uppercase tracking-widest flex justify-between">
        <span>{label}</span>
        {selectedItem && <span className="text-[10px]">Wgt: {selectedItem.weight}</span>}
      </label>
      
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className={`w-full h-16 bg-stone-950/50 border rounded flex items-center px-3 gap-3 transition-all relative ${selectedItem ? 'border-amber-900/50 hover:border-amber-500' : 'border-stone-800 hover:border-stone-600 border-dashed'}`}
      >
        <div className="w-10 h-10 bg-stone-900 rounded border border-stone-800 flex items-center justify-center overflow-hidden shrink-0 relative">
          {selectedItem?.image ? (
            <Image 
              src={selectedItem.image} 
              alt={selectedItem.name} 
              fill 
              sizes="40px"
              className="object-contain p-1"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-stone-900 opacity-20" /> 
          )}
        </div>
        <span className={`text-sm truncate pr-4 ${selectedItem ? 'text-stone-200 font-medium' : 'text-stone-600 italic'}`}>
          {selectedItem ? selectedItem.name : `Select ${label}...`}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl max-h-[85vh] flex flex-col rounded shadow-2xl relative z-10 overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
              <h3 className="text-amber-500 font-serif uppercase tracking-widest">{label}</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-white text-2xl px-2">&times;</button>
            </div>
            
            <div className="p-4 bg-stone-900 border-b border-stone-800">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search items..." 
                className="w-full bg-stone-950 border border-stone-800 text-stone-200 p-3 rounded outline-none focus:border-amber-600 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2 custom-scrollbar bg-stone-900">
              {isLoading && items.length === 0 ? (
                <div className="col-span-full text-center py-20 text-stone-600 animate-pulse uppercase tracking-[0.2em] text-xs">
                  Accessing database...
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => { onSelect(null); setIsOpen(false); }} className="flex items-center gap-3 p-3 rounded bg-stone-950/30 border border-stone-800 hover:border-red-900 transition-all text-left">
                    <div className="w-10 h-10 flex items-center justify-center text-red-900 bg-black border border-stone-800 rounded">∅</div>
                    <span className="text-stone-500 italic text-sm">Remove Item</span>
                  </button>
                  {filteredItems.map(item => (
                    <button 
                      key={item.id} 
                      type="button"
                      onClick={() => { onSelect(item); setIsOpen(false); }}
                      className={`flex items-center gap-3 p-3 rounded bg-stone-950/30 border transition-all text-left ${selectedItem?.id === item.id ? 'border-amber-600 bg-amber-900/10' : 'border-stone-800 hover:border-stone-600'}`}
                    >
                      <div className="w-10 h-10 relative shrink-0 bg-black rounded border border-stone-800">
                        {item.image && <Image src={item.image} alt={item.name} fill sizes="40px" className="object-contain p-1" unoptimized />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-stone-300 text-sm truncate font-medium">{item.name}</span>
                        <span className="text-[10px] text-stone-600 uppercase">Wgt: {item.weight}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}