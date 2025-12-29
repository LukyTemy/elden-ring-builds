"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import BuildCard from "@/components/BuildCard";
import { Search, Loader2, PlusCircle, Ghost } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchBuilds() {
      const { data, error } = await supabase
        .from('builds')
        .select('*, profiles(username)') 
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading builds:", error);
      }
      
      if (data) {
        setBuilds(data);
      }
      setLoading(false);
    }
    fetchBuilds();
  }, [supabase]);

  const filteredBuilds = builds.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.profiles?.username && b.profiles.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20 bg-stone-950">
      
      {/* Hero Header */}
      <div className="bg-stone-900/20 border-b border-stone-800/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-amber-500 mb-4 tracking-tight uppercase">
            The Lands Between
          </h1>
          <p className="text-stone-500 text-lg uppercase tracking-[0.3em] mb-10">
            Registry of Legend
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
            <input 
              type="text" 
              placeholder="Search by build name or author..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-900/50 border border-stone-800 rounded-lg py-4 pl-12 pr-6 text-stone-200 focus:outline-none focus:border-amber-700 transition-all placeholder:text-stone-700 font-serif"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-amber-600/50 gap-4">
             <Loader2 size={40} className="animate-spin" />
             <span className="uppercase tracking-[0.2em] text-sm">Summoning builds...</span>
          </div>
        ) : (
          <>
            {/* STAV 1: V databázi nejsou vůbec žádné buildy */}
            {builds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-stone-800 rounded-2xl bg-stone-900/10 max-w-2xl mx-auto">
                    <Ghost size={64} className="text-stone-800 mb-6" />
                    <h2 className="text-2xl font-serif text-stone-300 mb-2 italic tracking-wide">
                        No legends have been forged yet...
                    </h2>
                    <p className="text-stone-500 mb-8 max-w-sm">
                        Be the first to create a build and guide others through the Lands Between.
                    </p>
                    <Link href="/create" className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-8 py-3 rounded-md font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20">
                        <PlusCircle size={20} /> Forge the First Build
                    </Link>
                </div>
            ) : filteredBuilds.length === 0 ? (
                /* STAV 2: Buildy v DB jsou, ale neodpovídají hledání */
                <div className="text-center py-32 flex flex-col items-center">
                    <p className="text-stone-500 text-xl font-serif italic mb-6">
                        The archives find no record of such a build.
                    </p>
                    <button 
                        onClick={() => setSearch("")} 
                        className="text-amber-600 hover:text-amber-500 uppercase text-xs tracking-widest font-bold underline transition-colors"
                    >
                        Clear Search Filter
                    </button>
                </div>
            ) : (
                /* STAV 3: Všechno funguje a buildy se zobrazují */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBuilds.map((build) => (
                        <BuildCard key={build.id} build={build} />
                    ))}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}