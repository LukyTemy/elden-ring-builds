"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import BuildCard from "@/components/BuildCard";
import { Trash2, LayoutDashboard, Plus, Pencil } from "lucide-react";
import Link from "next/link";

export default function DashboardClient({ initialBuilds }: { initialBuilds: any[] }) {
  const [builds, setBuilds] = useState(initialBuilds);
  const supabase = createClient();

  const deleteBuild = async (id: string) => {
    if (!confirm("Are you sure you want to discard this legend?")) return;

    const { error } = await supabase
      .from('builds')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting build");
    } else {
      setBuilds(builds.filter(b => b.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12 border-b border-stone-800 pb-6">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="text-amber-500" size={32} />
          <h1 className="text-4xl font-serif font-bold text-stone-100 uppercase tracking-tight">
            My Repository
          </h1>
        </div>
        <Link href="/create" className="bg-amber-700 hover:bg-amber-600 text-stone-950 px-6 py-2 rounded font-bold uppercase tracking-widest transition-all flex items-center gap-2 text-sm">
          <Plus size={18} /> New Build
        </Link>
      </div>

      {builds.length === 0 ? (
        <div className="text-center py-24 bg-stone-900/20 border border-dashed border-stone-800 rounded-xl">
          <p className="text-stone-500 text-xl font-serif italic mb-6">You have not forged any builds yet.</p>
          <Link href="/create" className="text-amber-600 hover:text-amber-500 font-bold uppercase tracking-widest underline decoration-stone-700 underline-offset-8">
            Begin your journey
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {builds.map((build) => (
            <div key={build.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BuildCard build={build} />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                <Link 
                  href={`/edit/${build.id}`}
                  className="p-2 bg-stone-900/90 border border-stone-700 text-stone-400 rounded-md hover:border-amber-600 hover:text-amber-500 transition-all"
                  title="Edit Build"
                >
                  <Pencil size={18} />
                </Link>
                <button 
                  onClick={() => deleteBuild(build.id)}
                  className="p-2 bg-red-950/80 border border-red-900 text-red-400 rounded-md hover:bg-red-600 hover:text-white transition-all"
                  title="Delete Build"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}