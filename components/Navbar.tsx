import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import UserNav from "./UserNav";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // Společný styl pro odkazy, aby to ladilo
  const linkStyle = "hidden md:block text-stone-400 hover:text-stone-100 transition-colors text-sm uppercase tracking-widest font-medium";
  
  // Styl pro support (trochu speciální hover barva - zlatá)
  const supportStyle = "hidden md:flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors text-sm uppercase tracking-widest font-medium";

  return (
    <nav className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="text-2xl font-serif font-bold text-stone-100 tracking-wider hover:text-amber-500 transition-colors">
          ELDEN RING PLANNER
        </Link>

        {/* LINKS + AUTH */}
        <div className="flex items-center gap-8">
          <Link href="/builds" className={linkStyle}>
            Explore
          </Link>
          <Link href="/create" className={linkStyle}>
            New Build
          </Link>
          
          {/* Decentní Support odkaz */}
          <Link href="https://ko-fi.com/lukastemelkov" target="_blank" className={supportStyle}>
             {/* Ikonka srdce (volitelné) */}
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
             Support
          </Link>

          {/* User Profile / Login */}
          <UserNav user={user} profile={profile} />
        </div>
      </div>
    </nav>
  );
}