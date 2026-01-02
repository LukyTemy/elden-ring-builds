import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[99] w-full h-full flex items-center justify-center overflow-hidden bg-black">
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center grayscale"
        style={{ 
          backgroundImage: `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/page_bg_raw.jpg?t=1748630546')`,
        }}
      >
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-8xl md:text-[12rem] font-serif font-bold text-red-900/80 tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(153,27,27,0.5)] blur-[1px]">
          You Died
        </h1>
        
        <div className="mt-8 space-y-6">
          <p className="text-stone-500 text-xl font-serif uppercase tracking-[0.4em] italic">
            The path you seek has been lost to the fog.
          </p>
          
          <div className="pt-10">
            <Link 
              href="/" 
              className="group relative inline-flex items-center justify-center px-12 py-4 border border-stone-800 text-stone-400 hover:text-amber-500 transition-all duration-500 uppercase tracking-[0.3em] font-serif text-sm overflow-hidden"
            >
              <span className="relative z-10">Return to Grace</span>
              <div className="absolute inset-0 bg-stone-900/50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 w-full flex justify-center opacity-20">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-stone-700 to-transparent"></div>
      </div>
    </div>
  );
}