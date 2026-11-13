import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface CurrencySelectorProps {
  compact?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ compact = false, className = '' }) => {
  const {
    currency,
    currencyConfig,
    countryName,
    isManualOverride,
    popularCurrencies,
    setManualCurrency,
    resetToAutoDetected,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 dark:border-white/15 bg-white/90 dark:bg-neutral-900/90 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold transition-all cursor-pointer shadow-2xs ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
        title={`Showing prices in ${currencyConfig.name} (${countryName})`}
      >
        <span className="text-sm leading-none">{currencyConfig.flag}</span>
        <span className="font-mono font-bold">{currencyConfig.code}</span>
        {!compact && (
          <span className="text-neutral-500 dark:text-neutral-400 font-normal hidden sm:inline">
            ({currencyConfig.symbol.trim()})
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#141720] border border-neutral-200/80 dark:border-white/15 shadow-2xl z-[120] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2.5 border-b border-neutral-100 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
              <Globe className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>{countryName ? `Detected: ${countryName}` : 'Select Currency'}</span>
            </div>
            {isManualOverride && (
              <button
                type="button"
                onClick={() => {
                  resetToAutoDetected();
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
                title="Reset to my location currency"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Auto
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto py-1.5">
            {popularCurrencies.map((c) => {
              const isSelected = c.code === currency;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setManualCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#16a34a]/10 text-[#16a34a] font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none">{c.flag}</span>
                    <div className="truncate">
                      <span className="font-mono font-bold mr-1.5">{c.code}</span>
                      <span className="text-[11px] opacity-70 truncate">{c.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[11px] opacity-70">{c.symbol.trim()}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
