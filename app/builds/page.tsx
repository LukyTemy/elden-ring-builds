"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface BuildSummary {
  id: string;
  name: string;
  created_at: string;
  stats: Record<string, number>;
}

export default function BuildsList() {
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBuilds() {
      const { data, error } = await supabase
        .from('builds')
        .select('id, name, created_at, stats')
        .order('created_at', { ascending: false })
        .limit(50); // Načte posledních 50

      if (data) setBuilds(data);
      if (error) console.error(error);
      setLoading(false);
    }
    fetchBuilds();
  }, []);

  const calculateLevel = (stats: Record<string, number>) => {
    return Object.values(stats).reduce((a, b) => a + b, 0) - 79;
  };

  const filteredBuilds = builds.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl text-amber-500 font-bold">Latest Builds</h1>
        <input 
          type="text" 
          placeholder="Search builds..."
          className="bg-stone-900 border border-stone-700 text-stone-200 px-4 py-2 rounded focus:border-amber-500 outline-none w-full md:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center text-stone-500 animate-pulse">Loading builds...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuilds.map(build => {
            const level = calculateLevel(build.stats);
            return (
              <Link href={`/build/${build.id}`} key={build.id} className="block group">
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-lg hover:border-amber-600 transition-all hover:transform hover:-translate-y-1 h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-stone-200 group-hover:text-amber-500 transition-colors mb-2 truncate">
                      {build.name}
                    </h2>
                    <div className="text-sm text-stone-500 mb-4">
                      {new Date(build.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-stone-800 pt-4 mt-2">
                    <span className="text-stone-400 text-sm uppercase">Level</span>
                    <span className="text-amber-500 font-bold text-lg">{level > 1 ? level : 1}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          
          {filteredBuilds.length === 0 && (
             <div className="col-span-full text-center text-stone-500 py-10">
               No builds found. Be the first to create one!
             </div>
          )}
        </div>
      )}
    </div>
  );
}