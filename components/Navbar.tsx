import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-amber-500 tracking-wider hover:text-amber-400 transition-colors">
          ELDEN RING BUILDER
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-amber-500 transition-colors">
            Home
          </Link>
          <Link href="/create" className="text-amber-500 hover:text-amber-300 transition-colors font-semibold">
            + New Build
          </Link>
        </div>
      </div>
    </nav>
  );
}