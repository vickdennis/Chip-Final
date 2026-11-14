import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Safely serialize any message into a renderable string to prevent [object Object], {}, or React child crashes
export function safeFormatToastMessage(raw: any): string {
  if (raw == null) return '';

  const isEmptySerialized = (val: string) => {
    const trimmed = val.trim();
    return (
      !trimmed ||
      trimmed === '{}' ||
      trimmed === '[]' ||
      trimmed === 'null' ||
      trimmed === 'undefined' ||
      trimmed === '[object Object]' ||
      trimmed === '[object Error]' ||
      trimmed.includes('[object Object]')
    );
  };

  // Extract from Error instance
  if (raw instanceof Error) {
    if (raw.message && !isEmptySerialized(raw.message)) {
      return raw.message;
    }
    const anyErr = raw as any;
    if (typeof anyErr.msg === 'string' && !isEmptySerialized(anyErr.msg)) return anyErr.msg;
    if (typeof anyErr.error_description === 'string' && !isEmptySerialized(anyErr.error_description)) return anyErr.error_description;
    if (typeof anyErr.details === 'string' && !isEmptySerialized(anyErr.details)) return anyErr.details;
    if (typeof anyErr.error === 'string' && !isEmptySerialized(anyErr.error)) return anyErr.error;
    if (anyErr.error && typeof anyErr.error === 'object' && typeof anyErr.error.message === 'string' && !isEmptySerialized(anyErr.error.message)) {
      return anyErr.error.message;
    }
    if (anyErr.status && Number(anyErr.status) >= 500) {
      return 'Authentication or server error occurred. Please try again shortly.';
    }
    return 'An unexpected server issue occurred. Please check details or retry.';
  }

  // Handle plain objects
  if (typeof raw === 'object') {
    if (typeof raw.msg === 'string' && !isEmptySerialized(raw.msg)) return raw.msg;
    if (typeof raw.message === 'string' && !isEmptySerialized(raw.message)) return raw.message;
    if (typeof raw.error_description === 'string' && !isEmptySerialized(raw.error_description)) return raw.error_description;
    if (typeof raw.error === 'string' && !isEmptySerialized(raw.error)) return raw.error;
    if (raw.error && typeof raw.error === 'object') {
      if (typeof raw.error.message === 'string' && !isEmptySerialized(raw.error.message)) return raw.error.message;
    }
    if (typeof raw.details === 'string' && !isEmptySerialized(raw.details)) return raw.details;
    try {
      const s = JSON.stringify(raw);
      if (s && !isEmptySerialized(s)) return s.slice(0, 200);
    } catch {}
    return 'An unexpected response was received. Please try again.';
  }

  const str = String(raw).trim();
  if (isEmptySerialized(str)) {
    return 'A temporary server or network error occurred. Please try again.';
  }

  return str;
}

// Global event bus for lightweight, zero-dependency toast triggers across any component
type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: any) => {
    emitToast(message, 'success');
  },
  error: (message: any) => {
    emitToast(message, 'error');
  },
  info: (message: any) => {
    emitToast(message, 'info');
  }
};

export const showToast = (message: any, type: ToastType = 'info') => {
  emitToast(message, type);
};

function emitToast(message: any, type: ToastType) {
  const safeMsg = safeFormatToastMessage(message);
  const newToast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    message: safeMsg,
    type
  };
  listeners.forEach(fn => {
    try {
      fn(newToast);
    } catch (e) {
      console.warn('Toast listener error:', e);
    }
  });
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
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-[#16a34a]/50 ring-1 ring-[#16a34a]/30'
              : t.type === 'error'
              ? 'bg-red-950 text-white border-red-500/50 ring-1 ring-red-500/30'
              : 'bg-neutral-900 text-white border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#16a34a] dark:text-[#16a34a] shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#16a34a] shrink-0" />}
            <span className="truncate whitespace-pre-line">{safeFormatToastMessage(t.message)}</span>
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
