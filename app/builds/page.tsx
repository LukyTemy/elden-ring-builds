"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface BuildSummary {
  id: string;
  name: string;
  created_at: string;
  stats: Record<string, number>;
  equipment: Record<string, string>;
  talismans: string[];
}

const ITEMS_PER_PAGE = 24;

export default function BuildsList() {
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [itemWeights, setItemWeights] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce efekt: Nastaví vyhledávací dotaz až 500ms po dopsání
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); 
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Hlavní funkce pro načítání buildů
  const fetchBuilds = useCallback(async (pageNumber: number, searchQuery: string, isNewSearch: boolean) => {
    if (pageNumber === 0) setLoading(true);
    else setLoadingMore(true);

    const from = pageNumber * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('builds')
      .select('id, name, created_at, stats, equipment, talismans')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data: buildsData, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (buildsData) {
      if (buildsData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const newItemIds = new Set<string>();
      
      buildsData.forEach(build => {
        Object.values(build.equipment).forEach(id => {
          if (id) newItemIds.add(id as string);
        });
        if (Array.isArray(build.talismans)) {
          build.talismans.forEach(id => {
            if (id) newItemIds.add(id);
          });
        }
      });

      if (newItemIds.size > 0) {
        const idsToFetch = Array.from(newItemIds).filter(id => !itemWeights[id]);
        
        if (idsToFetch.length > 0) {
          const { data: itemsData } = await supabase
            .from('items')
            .select('id, weight')
            .in('id', idsToFetch);

          if (itemsData) {
            setItemWeights(prev => {
              const newMap = { ...prev };
              itemsData.forEach(item => {
                newMap[item.id] = item.weight;
              });
              return newMap;
            });
          }
        }
      }

      setBuilds(prev => isNewSearch ? buildsData : [...prev, ...buildsData]);
    }
    
    setLoading(false);
    setLoadingMore(false);
  }, [itemWeights]); 

  // Trigger při změně vyhledávání nebo stránky
  useEffect(() => {
    fetchBuilds(page, debouncedSearch, page === 0);
  }, [page, debouncedSearch]);

  const calculateLevel = (stats: Record<string, number>) => {
    return Object.values(stats).reduce((a, b) => a + b, 0) - 79;
  };

  const getRollStatus = (build: BuildSummary) => {
    let currentWeight = 0;
    
    Object.values(build.equipment).forEach(id => {
      if (id && itemWeights[id]) currentWeight += itemWeights[id];
    });
    
    if (Array.isArray(build.talismans)) {
      build.talismans.forEach(id => {
        if (id && itemWeights[id]) currentWeight += itemWeights[id];
      });
    }

    const endurance = build.stats.endurance || 10;
    const maxLoad = 45.0 + (endurance > 8 ? (endurance - 8) * 1.5 : 0);
    const ratio = maxLoad > 0 ? (currentWeight / maxLoad) * 100 : 0;

    if (ratio >= 100) return { label: "Overloaded", color: "text-red-500 border-red-900/50 bg-red-900/10" };
    if (ratio >= 70) return { label: "Fat Roll", color: "text-orange-500 border-orange-900/50 bg-orange-900/10" };
    if (ratio >= 30) return { label: "Med. Roll", color: "text-yellow-500 border-yellow-900/50 bg-yellow-900/10" };
    return { label: "Light Roll", color: "text-green-500 border-green-900/50 bg-green-900/10" };
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl text-amber-500 font-bold">Latest Builds</h1>
        <div className="relative w-full md:w-64">
            <input 
            type="text" 
            placeholder="Search builds..."
            className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-2 rounded focus:border-amber-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
            {loading && search !== debouncedSearch && (
                <div className="absolute right-3 top-2.5 text-amber-500 animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            )}
        </div>
      </div>

      {loading && builds.length === 0 ? (
        <div className="text-center text-stone-500 animate-pulse py-20">Summoning builds...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {builds.map(build => {
              const level = calculateLevel(build.stats);
              const roll = getRollStatus(build);

              return (
                <Link href={`/build/${build.id}`} key={build.id} className="block group">
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-lg hover:border-amber-600 transition-all hover:transform hover:-translate-y-1 h-full flex flex-col justify-between shadow-xl">
                    
                    <div>
                      <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl font-bold text-stone-200 group-hover:text-amber-500 transition-colors truncate pr-2">
                          {build.name}
                          </h2>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`text-xs px-2 py-1 rounded border font-bold uppercase tracking-wide ${roll.color}`}>
                              {roll.label}
                          </span>
                          <span className="text-xs px-2 py-1 rounded border border-stone-800 bg-stone-950 text-stone-500">
                              {new Date(build.created_at).toLocaleDateString()}
                          </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-stone-800 pt-4 mt-2">
                      <div className="text-xs text-stone-500 flex flex-col gap-1">
                          <span className="uppercase tracking-widest">Main Stats</span>
                          <div className="flex gap-2 text-stone-300 font-mono">
                              <span title="Vigor">VIG {build.stats.vigor}</span>
                              <span title="Endurance">END {build.stats.endurance}</span>
                          </div>
                      </div>
                      
                      <div className="text-right">
                          <span className="text-stone-500 text-xs uppercase block">Level</span>
                          <span className="text-amber-500 font-bold text-2xl leading-none">{level > 1 ? level : 1}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                className="px-8 py-3 bg-stone-900 border border-stone-700 hover:border-amber-600 text-stone-300 hover:text-amber-500 rounded uppercase tracking-widest font-bold transition-all disabled:opacity-50"
              >
                {loadingMore ? 'Summoning...' : 'Load More Builds'}
              </button>
            </div>
          )}

          {builds.length === 0 && !loading && (
             <div className="col-span-full text-center text-stone-500 py-20 flex flex-col items-center gap-4">
               <div className="text-4xl">🤷‍♂️</div>
               <p>No builds found matching "{debouncedSearch}"</p>
               {debouncedSearch && (
                   <button onClick={() => setSearch("")} className="text-amber-500 hover:underline">Clear Search</button>
               )}
             </div>
          )}
        </>
      )}
    </div>
  );
}