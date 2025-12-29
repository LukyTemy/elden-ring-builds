import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <h1 className="text-6xl md:text-8xl font-bold text-amber-500 drop-shadow-lg tracking-tighter">
        RISE, TARNISHED
      </h1>
      <p className="text-xl md:text-2xl text-stone-400 max-w-2xl">
        Prepare for the Lands Between. Plan your stats, choose your weapons, and share your ultimate build with the world.
      </p>
      
      <div className="flex gap-4 mt-8">
        <Link 
          href="/create" 
          className="bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold py-4 px-8 rounded text-xl transition-all hover:scale-105"
        >
          Create New Build
        </Link>
      </div>
    </div>
  );
}