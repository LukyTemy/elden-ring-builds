"use client";

import Link from "next/link";
import { signout } from "@/app/login/actions";

interface UserNavProps {
  user: any;
  profile: any;
}

export default function UserNav({ user, profile }: UserNavProps) {
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

  // Zobrazíme username z profilu, nebo fallback na část emailu
  const displayName = profile?.username || user.email?.split('@')[0] || "Tarnished";

  return (
    <div className="flex items-center gap-6">
      <span className="text-amber-500 text-sm font-bold tracking-wide">
        {displayName}
      </span>
      <form action={signout}>
        <button 
          className="text-stone-500 hover:text-red-400 text-xs uppercase tracking-widest transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}