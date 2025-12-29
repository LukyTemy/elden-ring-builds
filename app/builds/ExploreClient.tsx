"use client";

import { useState } from "react";
import BuildCard from "@/components/BuildCard";
import { Search, PlusCircle, Ghost } from "lucide-react";
import Link from "next/link";

export default function ExploreClient({ initialBuilds }: { initialBuilds: any[] }) {
  const [search, setSearch] = useState("");
  
  // Používáme data, která přišla ze serveru, žádný useEffect s fetchBuilds
  const filteredBuilds = initialBuilds.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.profiles?.username && b.profiles.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20 bg-stone-950">
      <div className="bg-stone-900/20 border-b border-stone-800/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-amber-500 mb-4 tracking-tight uppercase tracking-widest">
            The Lands Between
          </h1>
          <div className="max-w-md mx-auto relative mt-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
            <input 
              type="text" 
              placeholder="Search builds or authors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-900/50 border border-stone-800 rounded-lg py-4 pl-12 pr-6 text-stone-200 focus:outline-none focus:border-amber-700 font-serif"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {filteredBuilds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Ghost size={64} className="text-stone-800 mb-6" />
            <h2 className="text-2xl font-serif text-stone-300 mb-2 italic">No legends found...</h2>
            <Link href="/create" className="text-amber-600 hover:text-amber-500 font-bold uppercase tracking-widest underline mt-4">
              Forge the first one
            </Link>
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