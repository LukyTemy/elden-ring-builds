"use client";

import Link from "next/link";
import { signout } from "@/app/login/actions";
import { useState, useRef, useEffect } from "react";
import { LogOut, Bookmark, ChevronDown, User } from "lucide-react";

export default function UserNav({ user, profile }: { user: any, profile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/login" className="text-stone-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest bg-stone-900/50 px-4 py-2 rounded border border-stone-800 hover:border-amber-600 transition-all">
        Login
      </Link>
    );
  }

  const displayName = profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || "Tarnished";

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-3 text-stone-400 hover:text-amber-500 transition-all group font-serif bg-stone-900/30 px-3 py-1.5 rounded-full border border-stone-800 hover:border-stone-700"
      >
        <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-amber-900/20 transition-colors">
            <User size={14} className="text-stone-500 group-hover:text-amber-500" />
        </div>
        <span className="text-sm font-bold tracking-wide uppercase max-w-[100px] truncate">{displayName}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-stone-950 border border-stone-800 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 mb-2 border-b border-stone-900">
            <p className="text-[10px] text-stone-600 uppercase font-bold tracking-tighter">Logged in as</p>
            <p className="text-xs text-stone-400 truncate font-serif">{user.email}</p>
          </div>

          <Link href="/saved" className="flex items-center gap-3 px-4 py-3 text-sm text-stone-300 hover:bg-stone-900 hover:text-amber-500 transition-colors" onClick={() => setIsOpen(false)}>
            <Bookmark size={16} />
            <span>Saved Builds</span>
          </Link>

          <div className="border-t border-stone-900 my-1"></div>

          <form action={signout}>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500/70 hover:bg-red-950/20 hover:text-red-400 transition-colors text-left font-medium">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}