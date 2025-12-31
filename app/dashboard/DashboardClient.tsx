"use client";

import { useState } from "react";
import BuildCard from "@/components/BuildCard";
import { Trash2, LayoutDashboard, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "sonner";

export default function DashboardClient({ initialBuilds }: { initialBuilds: any[] }) {
  const [builds, setBuilds] = useState(initialBuilds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBuildId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBuildId) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from('builds')
      .delete()
      .eq('id', selectedBuildId);

    if (error) {
      toast.error("Failed to discard the legend.");
      setIsDeleting(false);
    } else {
      setBuilds(builds.filter(b => b.id !== selectedBuildId));
      toast.success("Legend discarded successfully.");
      setIsModalOpen(false);
      setIsDeleting(false);
      setSelectedBuildId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Discard Legend"
        message="Are you certain you wish to erase this legend from the archives? This action cannot be undone."
      />

      <div className="flex justify-between items-center mb-12 border-b border-stone-800 pb-6">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="text-amber-500" size={32} />
          <h1 className="text-4xl font-serif font-bold text-stone-100 uppercase tracking-tight">My Repository</h1>
        </div>
        <Link href="/create" className="bg-amber-700 hover:bg-amber-600 text-stone-950 px-6 py-2 rounded font-bold uppercase tracking-widest transition-all flex items-center gap-2 text-sm">
          <Plus size={18} /> New Build
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {builds.map((build) => (
          <div key={build.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BuildCard build={build} />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
              <Link href={`/edit/${build.id}`} className="p-2 bg-stone-900/90 border border-stone-700 text-stone-400 rounded-md hover:border-amber-600 hover:text-amber-500 transition-all">
                <Pencil size={18} />
              </Link>
              <button onClick={(e) => openDeleteModal(e, build.id)} className="p-2 bg-red-950/80 border border-red-900 text-red-400 rounded-md hover:bg-red-600 hover:text-white transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}