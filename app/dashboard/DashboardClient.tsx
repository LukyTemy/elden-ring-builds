"use client";

import { useState, useMemo } from "react";
import BuildCard from "@/components/BuildCard";
import { Trash2, LayoutDashboard, Plus, Pencil, Search, Ghost, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";
import { deleteBuildAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DashboardClient({ initialBuilds }: { initialBuilds: any[] }) {
  const [builds, setBuilds] = useState(initialBuilds);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [rollFilter, setRollFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const filteredBuilds = useMemo(() => {
    let result = builds.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      
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
  }, [builds, search, levelFilter, rollFilter, sortBy]);

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBuildId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBuildId) return;
    setIsDeleting(true);

    try {
      const result = await deleteBuildAction(selectedBuildId);
      if (result.success) {
        setBuilds(prev => prev.filter(b => b.id !== selectedBuildId));
        toast.success("Legend discarded successfully.");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Failed to discard: " + err.message);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setSelectedBuildId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-serif">
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Discard Legend"
        message="Are you certain you wish to erase this legend from the archives? This action cannot be undone."
      />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-stone-800 pb-8">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="text-amber-500" size={40} />
          <h1 className="text-4xl md:text-5xl font-bold text-stone-100 uppercase tracking-tighter">
            Your Repository
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                <input 
                    type="text" 
                    placeholder="Search your builds..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-800 rounded-md py-2.5 pl-10 pr-4 text-stone-200 focus:outline-none focus:border-amber-700 text-sm"
                />
            </div>

            <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-stone-400 text-xs rounded-md px-3 py-2.5 focus:outline-none focus:border-amber-700 cursor-pointer"
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
                className="bg-stone-900 border border-stone-800 text-stone-400 text-xs rounded-md px-3 py-2.5 focus:outline-none focus:border-amber-700 cursor-pointer"
            >
                <option value="all">Any Roll</option>
                <option value="Light">Light Roll</option>
                <option value="Medium">Medium Roll</option>
                <option value="Heavy">Heavy Roll</option>
                <option value="Overloaded">Overloaded</option>
            </select>

            <Link href="/create" className="bg-amber-700 hover:bg-amber-600 text-stone-950 px-6 py-2.5 rounded-md font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-amber-900/20">
                <Plus size={16} /> New Build
            </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 text-stone-500 uppercase tracking-[0.2em] text-[10px] font-bold">
          <SlidersHorizontal size={12} />
          <span>Found {filteredBuilds.length} legends in your collection</span>
      </div>

      {filteredBuilds.length === 0 ? (
        <div className="text-center py-32 bg-stone-900/20 border border-dashed border-stone-800 rounded-xl">
          <Ghost className="mx-auto text-stone-800 mb-4" size={48} />
          <p className="text-stone-500 text-xl italic mb-6">No matching builds found in your repository.</p>
          <button 
              onClick={() => {setSearch(""); setLevelFilter("all"); setRollFilter("all");}}
              className="text-amber-600 hover:text-amber-500 font-bold uppercase tracking-widest underline underline-offset-8"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBuilds.map((build) => (
            <div key={build.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BuildCard build={build} />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                <Link 
                  href={`/edit/${build.id}`}
                  className="p-2 bg-stone-900/90 border border-stone-700 text-stone-400 rounded-md hover:border-amber-600 hover:text-amber-500 transition-all shadow-xl"
                >
                  <Pencil size={18} />
                </Link>
                <button 
                  onClick={(e) => openDeleteModal(e, build.id)}
                  disabled={isDeleting}
                  className="p-2 bg-red-950/80 border border-red-900 text-red-400 rounded-md hover:bg-red-600 hover:text-white transition-all shadow-xl"
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