// app/saved/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Swords, ChevronRight, Archive } from "lucide-react";

export const metadata = {
  title: "Saved Builds | Elden Ring Builder",
};

export default async function SavedBuildsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please login to view saved builds");
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      build_id,
      builds (
        id,
        name,
        stats
      )
    `)
    .eq("user_id", user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800 pb-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Heart className="w-10 h-10 text-amber-500 fill-current" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-100 uppercase tracking-tighter">
              Saved <span className="text-amber-500">Builds</span>
            </h1>
            <p className="text-stone-500 uppercase tracking-[0.3em] text-xs mt-2 font-medium">
              The Great Archive of Tarnished Souls
            </p>
          </div>
        </div>
        <div className="text-stone-500 text-sm uppercase tracking-widest font-bold">
          Total Saved: <span className="text-amber-500 ml-2">{favorites?.length || 0}</span>
        </div>
      </div>

      {(!favorites || favorites.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 bg-stone-900/10 border border-stone-800/50 rounded-[2rem] text-center backdrop-blur-sm">
          <Archive className="w-20 h-20 text-stone-800 mb-8 stroke-[1px]" />
          <h2 className="text-2xl font-serif uppercase tracking-widest text-stone-400 mb-4">No records found</h2>
          <p className="text-stone-600 max-w-xs mb-10 italic">
            "Seek inspiration, and the paths to power shall open before thee."
          </p>
          <Link 
            href="/builds" 
            className="px-10 py-4 bg-stone-900 border border-stone-700 text-amber-500 font-bold uppercase tracking-[0.2em] text-sm rounded-full hover:border-amber-500 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Explore Community
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav: any) => {
            const build = fav.builds;
            const statsValues = build?.stats ? Object.values(build.stats) : [];
            const level = statsValues.length > 0 
              ? statsValues.reduce((a: any, b: any) => a + (Number(b) || 0), 0) - 79 
              : 1;

            return (
              <Link 
                key={fav.build_id} 
                href={`/build/${fav.build_id}`}
                className="group relative flex flex-col bg-stone-900/30 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-600/50 transition-all duration-500"
              >
                <div className="h-1 w-full bg-stone-800 group-hover:bg-amber-600 transition-colors duration-500" />
                
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <Swords className="w-5 h-5 text-stone-600 group-hover:text-amber-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
                      #{fav.build_id.slice(0, 5)}
                    </span>
                  </div>

                  {/* ZMĚNA: line-clamp-1 a break-all pro oříznutí dlouhých názvů v kartě */}
                  <h3 
                    className="text-2xl font-serif font-bold text-stone-200 uppercase tracking-tight group-hover:text-amber-500 transition-colors duration-300 leading-tight mb-6 line-clamp-1 break-all"
                    title={build.name}
                  >
                    {build.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 border-t border-stone-800/50 pt-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">Level</div>
                      <div className="text-2xl font-serif font-bold text-stone-100">
                        {level > 1 ? level : 1}
                      </div>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                      <div className="flex items-center gap-2 text-amber-600/80 font-bold uppercase tracking-tighter text-[10px] group-hover:text-amber-500 transition-colors">
                        View Build <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/5 blur-[50px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}