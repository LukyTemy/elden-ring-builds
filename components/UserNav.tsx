"use client";

import Link from "next/link";
import { signout } from "@/app/login/actions";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Bookmark, ChevronDown } from "lucide-react";

interface UserNavProps {
  user: any;
  profile: any;
}

export default function UserNav({ user, profile }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Zavření menu při kliknutí mimo něj
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
      <Link 
        href="/login"
        className="text-stone-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold"
      >
        Login
      </Link>
    );
  }

  const displayName = profile?.username || user.email?.split('@')[0] || "Tarnished";

  return (
    <div className="relative" ref={menuRef}>
      {/* Tlačítko pro otevření menu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors group"
      >
        <span className="text-sm font-bold tracking-wide group-hover:text-amber-500">
          {displayName}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-stone-900 border border-stone-800 rounded-md shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Saved Builds Link */}
          <Link 
            href="/saved" 
            className="flex items-center gap-2 px-4 py-3 text-sm text-stone-300 hover:bg-stone-800 hover:text-amber-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Bookmark size={16} />
            <span>Saved Builds</span>
          </Link>

          {/* Oddělovač */}
          <div className="border-t border-stone-800 my-1"></div>

          {/* Sign Out Button */}
          <form action={signout}>
            <button 
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-stone-300 hover:bg-red-900/20 hover:text-red-400 transition-colors text-left"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}