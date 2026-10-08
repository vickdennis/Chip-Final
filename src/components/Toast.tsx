import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Global event bus for lightweight, zero-dependency toast triggers across any component
type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string) => {
    emitToast(message, 'success');
  },
  error: (message: string) => {
    emitToast(message, 'error');
  },
  info: (message: string) => {
    emitToast(message, 'info');
  }
};

export const showToast = (message: string, type: ToastType = 'info') => {
  emitToast(message, type);
};

function emitToast(message: string, type: ToastType) {
  const newToast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type
  };
  listeners.forEach(fn => fn(newToast));
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewToast: ToastListener = (newToast) => {
      setToasts(prev => [...prev.slice(-3), newToast]); // keep at most 4 active

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-[90vw] sm:w-auto pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 duration-200 ${
            t.type === 'success'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-[#D2F843]/50 ring-1 ring-[#D2F843]/30'
              : t.type === 'error'
              ? 'bg-red-950 text-white border-red-500/50 ring-1 ring-red-500/30'
              : 'bg-neutral-900 text-white border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#D2F843] dark:text-[#6c8600] shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#D2F843] shrink-0" />}
            <span className="truncate">{t.message}</span>
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
