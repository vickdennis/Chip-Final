import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface PerformanceGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PerformanceGuard({ children, fallback }: PerformanceGuardProps) {
  const { isLiteMode } = useNetworkStatus();

  if (isLiteMode) {
    return (
      <>
        {fallback || (
          <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-8 text-center border border-black/5 dark:border-white/5">
            <div className="flex flex-col items-center gap-3">
              <span className="text-2xl animate-pulse">⚡</span>
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                Lite Mode activated to save data on slow networks.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Network is fast, or API is unsupported (fallback to heavy experience)
  return <>{children}</>;
}
