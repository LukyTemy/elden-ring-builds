"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import UserNav from "./UserNav";
import { Compass, Sword, PlusCircle, LayoutDashboard, Heart, Menu, X } from "lucide-react";

export default function Navbar({ initialUser, initialProfile }: { initialUser: any, initialProfile: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setProfile(initialProfile);
  }, [initialUser, initialProfile]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      if (event === "SIGNED_IN") {
        setUser(currentUser);
        if (currentUser) {
          const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
          setProfile(data);
        }
        router.refresh();
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        router.refresh();
      }

      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") {
        setUser(currentUser);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <nav className="border-b border-stone-800 bg-stone-950/95 backdrop-blur-md sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:bg-amber-500 transition-colors">
            <Sword size={22} className="text-stone-950" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-bold text-stone-100 tracking-tighter uppercase">
            ER <span className="text-amber-500">Planner</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/builds" className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${pathname === '/builds' ? 'text-amber-500' : 'text-stone-400 hover:text-stone-100'}`}>
            <Compass size={16} />
            <span>Explore</span>
          </Link>

          <a 
            href="https://ko-fi.com/lukastemelkov" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-amber-500 transition-colors"
          >
            <Heart size={16} className="text-red-500 fill-red-500/10" />
            <span>Support</span>
          </a>

          {user && (
            <>
              <Link href="/dashboard" className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${pathname === '/dashboard' ? 'text-amber-500' : 'text-stone-400 hover:text-stone-100'}`}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link href="/create" className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-700 rounded text-amber-500 text-xs font-bold uppercase tracking-widest hover:border-amber-600 transition-all">
                <PlusCircle size={16} />
                <span>Forge</span>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <UserNav user={user} profile={profile} />
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-stone-400 hover:text-amber-500 transition-colors md:hidden"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 animate-in slide-in-from-top-5 duration-300">
          <div className="flex flex-col p-4 space-y-4">
            
            <div className="sm:hidden border-b border-stone-900 pb-4 mb-2">
               <UserNav user={user} profile={profile} />
            </div>

            <Link href="/builds" className={`flex items-center gap-4 p-3 rounded-lg text-sm font-bold uppercase tracking-widest ${pathname === '/builds' ? 'bg-amber-900/10 text-amber-500' : 'text-stone-400'}`}>
              <Compass size={20} />
              Explore Builds
            </Link>

            {user && (
              <>
                <Link href="/dashboard" className={`flex items-center gap-4 p-3 rounded-lg text-sm font-bold uppercase tracking-widest ${pathname === '/dashboard' ? 'bg-amber-900/10 text-amber-500' : 'text-stone-400'}`}>
                  <LayoutDashboard size={20} />
                  My Dashboard
                </Link>
                <Link href="/create" className={`flex items-center gap-4 p-3 rounded-lg text-sm font-bold uppercase tracking-widest ${pathname === '/create' ? 'bg-amber-900/10 text-amber-500' : 'text-stone-400'}`}>
                  <PlusCircle size={20} />
                  Forge New Build
                </Link>
              </>
            )}

            <a 
              href="https://ko-fi.com/lukastemelkov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-3 text-stone-400 text-sm font-bold uppercase tracking-widest"
            >
              <Heart size={20} className="text-red-500" />
              Support on Ko-fi
            </a>
            
            {!user && (
                <Link href="/login" className="mt-4 w-full py-3 bg-stone-900 text-center text-amber-500 font-bold uppercase tracking-widest rounded-lg border border-stone-800">
                    Login / Sign Up
                </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}