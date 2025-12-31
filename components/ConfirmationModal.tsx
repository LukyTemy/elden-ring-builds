"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 p-8 rounded-xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-6 text-red-500">
          <AlertTriangle size={32} />
          <h2 className="text-2xl font-serif font-bold uppercase tracking-tight">{title}</h2>
        </div>
        <p className="text-stone-400 mb-8 leading-relaxed italic">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}