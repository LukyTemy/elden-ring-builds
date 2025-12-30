"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface FavoriteButtonProps {
  buildId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  userId?: string;
}

export default function FavoriteButton({ buildId, initialLikes, initialIsLiked, userId }: FavoriteButtonProps) {
  const [count, setCount] = useState(Number(initialLikes) || 0);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert("Pro přidání do oblíbených se musíš přihlásit.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('build_id', buildId)
          .eq('user_id', userId);

        if (!error) {
          setCount(prev => Math.max(0, prev - 1));
          setIsLiked(false);
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ build_id: buildId, user_id: userId });

        if (!error) {
          setCount(prev => prev + 1);
          setIsLiked(true);
        }
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      disabled={isLoading}
      className={`relative z-30 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all pointer-events-auto shadow-lg ${
        isLiked 
        ? 'bg-red-500/10 border-red-500 text-red-500' 
        : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-red-500/50 hover:text-red-400'
      }`}
    >
      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-bold">{count}</span>
    </button>
  );
}