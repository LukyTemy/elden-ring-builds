"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import UserNav from "./UserNav";
import { Compass, Sword, PlusCircle, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && pathname === "/login") {
        window.location.assign("/");
        return;
      }

      if (event === "SIGNED_OUT") {
        window.location.assign("/login");
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, pathname, fetchProfile]);

  return (
    <nav className="border-b border-stone-800 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:bg-amber-500 transition-colors">
            <Sword size={22} className="text-stone-950" />
          </div>
          <span className="text-2xl font-serif font-bold text-stone-100 tracking-tighter hidden sm:block">
            ELDEN RING <span className="text-amber-500">PLANNER</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            href="/builds" 
            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/builds' ? 'text-amber-500' : 'text-stone-400 hover:text-stone-100'}`}
          >
            <Compass size={18} />
            <span className="hidden md:block">Explore</span>
          </Link>

          {user && (
            <>
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/dashboard' ? 'text-amber-500' : 'text-stone-400 hover:text-stone-100'}`}
              >
                <LayoutDashboard size={18} />
                <span className="hidden md:block">Dashboard</span>
              </Link>
              
              <Link 
                href="/create" 
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-700 rounded text-amber-500 text-sm font-bold uppercase tracking-widest hover:border-amber-600 transition-all"
              >
                <PlusCircle size={18} />
                <span className="hidden md:block">Forge</span>
              </Link>
            </>
          )}

          <div className="h-6 w-[1px] bg-stone-800 mx-2 hidden sm:block"></div>

          <UserNav user={user} profile={profile} />
        </div>
      </div>
    </nav>
  );
}