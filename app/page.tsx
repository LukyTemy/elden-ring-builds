import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import BuildCard from "@/components/BuildCard";
import { Sword } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: latestBuilds } = await supabase
    .from('builds')
    .select(`
      *,
      profiles (username),
      favorites (count)
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  const populatedBuilds = (latestBuilds || []).map(build => ({
    ...build,
    favorites_count: (build as any).favorites?.[0]?.count || 0
  }));

  if (populatedBuilds.length > 0) {
    const weaponIds = populatedBuilds
      .map(b => b.equipment?.rightHand1)
      .filter(id => id && typeof id === 'string');
      
    if (weaponIds.length > 0) {
      const { data: weapons } = await supabase
        .from('items')
        .select('id, name, image')
        .in('id', weaponIds);

      const weaponMap = Object.fromEntries(weapons?.map(w => [w.id, w]) || []);

      populatedBuilds.forEach(build => {
        const wId = build.equipment?.rightHand1;
        if (wId && weaponMap[wId]) {
          build.equipment.rightHand1 = weaponMap[wId];
        }
      });
    }
  }

  return (
    <div className="bg-stone-950">
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
          style={{ 
            backgroundImage: `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/page_bg_raw.jpg?t=1748630546')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/50 to-stone-950 shadow-[inset_0_0_200px_rgba(0,0,0,1)]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-4">
            <h2 className="text-amber-600 font-serif tracking-[0.5em] text-sm md:text-xl uppercase animate-pulse">
              The Grace Calls To You
            </h2>
            <h1 className="text-6xl md:text-9xl font-bold text-stone-100 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] tracking-tighter font-serif uppercase">
              Rise, <span className="text-amber-500">Tarnished</span>
            </h1>
          </div>

          <p className="text-lg md:text-2xl text-stone-300 max-w-3xl font-light leading-relaxed drop-shadow-md font-serif italic">
            The archives of the Lands Between await. Plan your attributes, master your armaments, and share your legend with the world.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 mt-6">
            {user ? (
              <Link 
                href="/create" 
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-6 px-16 rounded-sm text-2xl transition-all shadow-2xl shadow-amber-900/60 hover:-translate-y-1 uppercase tracking-widest font-serif"
              >
                Forge New Build
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-6 px-16 rounded-sm text-2xl transition-all shadow-2xl shadow-amber-900/60 hover:-translate-y-1 uppercase tracking-widest font-serif"
                >
                  Join the Tarnished
                </Link>
                <Link 
                  href="/builds" 
                  className="bg-stone-900/80 hover:bg-stone-800 text-amber-500 border border-amber-900/50 font-bold py-6 px-16 rounded-sm text-2xl transition-all backdrop-blur-md hover:-translate-y-1 uppercase tracking-widest font-serif"
                >
                  Explore Archives
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20">
        <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-md pointer-events-none border-t border-white/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="flex flex-col items-center mb-16 text-center">
            <Sword className="text-amber-600 mb-4 animate-bounce" size={48} />
            <h3 className="text-4xl font-serif font-bold text-stone-100 uppercase tracking-widest drop-shadow-lg">
              Latest Community Legends
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {populatedBuilds.map((build) => (
              <div key={build.id} className="transition-transform duration-500 hover:scale-[1.02]">
                <BuildCard build={build} />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link 
              href="/builds" 
              className="group inline-flex flex-col items-center"
            >
              <span className="text-stone-400 group-hover:text-amber-500 font-bold uppercase tracking-[0.3em] transition-colors font-serif">
                View All Archives
              </span>
              <div className="w-0 group-hover:w-full h-px bg-amber-800 transition-all duration-500 mt-2"></div>
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-48 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}