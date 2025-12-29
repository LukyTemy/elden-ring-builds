import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold text-amber-500 tracking-wider hover:text-amber-400 transition-colors flex items-center gap-2">
           <span className="hidden sm:inline">ELDEN RING BUILDER</span>
           <span className="sm:hidden">ER BUILDER</span>
        </Link>

        {/* PRAVÁ ČÁST */}
        <div className="flex gap-4 items-center">

            <a 
            href="https://ko-fi.com/lukastemelkov"
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#FF5E5B] hover:bg-[#ff4f4c] text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 shadow-lg"
          >
            <span>☕</span>
            <span className="hidden sm:inline">Support</span>
          </a>
          
          <Link href="/builds" className="text-stone-400 hover:text-amber-500 transition-colors uppercase text-sm tracking-widest font-bold hidden md:block">
            Explore
          </Link>

          {/* KO-FI TLAČÍTKO */}

          <Link href="/create" className="bg-amber-600 hover:bg-amber-700 text-stone-950 px-4 py-2 rounded font-bold transition-all text-sm uppercase tracking-wide">
            + New Build
          </Link>
        </div>
      </div>
    </nav>
  );
}