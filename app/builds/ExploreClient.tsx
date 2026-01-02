"use client";

import { useState, useMemo } from "react";
import BuildCard from "@/components/BuildCard";
import { Search, Ghost, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function ExploreClient({ initialBuilds }: { initialBuilds: any[] }) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [rollFilter, setRollFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredBuilds = useMemo(() => {
    let result = initialBuilds.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                           (b.profiles?.username && b.profiles.username.toLowerCase().includes(search.toLowerCase()));
      
      const level = Object.values(b.stats).reduce((a: any, b: any) => a + b, 0) - 79;
      let matchesLevel = true;
      if (levelFilter === "low") matchesLevel = level <= 50;
      else if (levelFilter === "mid") matchesLevel = level > 50 && level <= 125;
      else if (levelFilter === "meta") matchesLevel = level > 125 && level <= 150;
      else if (levelFilter === "high") matchesLevel = level > 150;

      const matchesRoll = rollFilter === "all" || b.rollType === rollFilter;

      return matchesSearch && matchesLevel && matchesRoll;
    });

    if (sortBy === "liked") {
      result.sort((a, b) => b.favorites_count - a.favorites_count);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [initialBuilds, search, levelFilter, rollFilter, sortBy]);

  return (
    <div className="min-h-screen pb-20 bg-stone-950 font-serif">
      <div className="bg-stone-900/20 border-b border-stone-800/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-amber-500 mb-4 tracking-widest uppercase drop-shadow-2xl">
            The Archives
          </h1>
          <p className="text-stone-400 mt-4 max-w-lg mx-auto italic">
            Explore the most legendary equipment combinations forged by the community of Tarnished.
          </p>
          
          <div className="max-w-4xl mx-auto mt-12 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
              <input 
                type="text" 
                placeholder="Search legends or authors..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-900/50 border border-stone-800 rounded-lg py-4 pl-12 pr-6 text-stone-200 focus:outline-none focus:border-amber-700 transition-all shadow-inner"
              />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <select 
                    value={levelFilter} 
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-stone-900 border border-stone-800 text-stone-400 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                    <option value="all">Any Level</option>
                    <option value="low">RL 1 - 50</option>
                    <option value="mid">RL 51 - 125</option>
                    <option value="meta">RL 126 - 150</option>
                    <option value="high">RL 150+</option>
                </select>

                <select 
                    value={rollFilter} 
                    onChange={(e) => setRollFilter(e.target.value)}
                    className="bg-stone-900 border border-stone-800 text-stone-400 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                    <option value="all">Any Roll</option>
                    <option value="Light">Light Roll</option>
                    <option value="Medium">Medium Roll</option>
                    <option value="Heavy">Heavy Roll</option>
                    <option value="Overloaded">Overloaded</option>
                </select>

                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-stone-900 border border-stone-800 text-stone-400 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-amber-700 cursor-pointer col-span-2 sm:col-span-1"
                >
                    <option value="newest">Newest</option>
                    <option value="liked">Most Liked</option>
                </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8 text-stone-500 uppercase tracking-[0.2em] text-xs font-bold">
            <SlidersHorizontal size={14} />
            <span>Found {filteredBuilds.length} legends</span>
        </div>

        {filteredBuilds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Ghost size={64} className="text-stone-800 mb-6" />
            <h2 className="text-2xl text-stone-300 mb-2 italic font-serif">The archives are silent...</h2>
            <button 
                onClick={() => {setSearch(""); setLevelFilter("all"); setRollFilter("all");}}
                className="text-amber-600 hover:text-amber-500 font-bold uppercase tracking-widest underline underline-offset-8"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBuilds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}