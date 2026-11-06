import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import { WORLD_COUNTRIES, CountryInfo, detectCountryFromPhone, formatToInternationalE164 } from '../utils/countryData';

export interface InternationalPhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  defaultCountryCode?: string; // e.g. 'NG', 'US', 'GB'
  id?: string;
}

export default function InternationalPhoneInput({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  defaultCountryCode = 'NG',
  id
}: InternationalPhoneInputProps) {
  // Detect selected country initially from current value or default
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    if (value && value.trim()) {
      return detectCountryFromPhone(value);
    }
    return WORLD_COUNTRIES.find(c => c.code === defaultCountryCode) || WORLD_COUNTRIES[0];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keep country in sync if value changes externally and starts with a different country code
  useEffect(() => {
    if (value && value.trim().startsWith('+')) {
      const detected = detectCountryFromPhone(value);
      if (detected.dialCode !== selectedCountry.dialCode) {
        setSelectedCountry(detected);
      }
    }
  }, [value]);

  // Extract the local/national part of the number for display in the input
  const localNumber = useMemo(() => {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.startsWith('+')) {
      if (trimmed.startsWith(selectedCountry.dialCode)) {
        return trimmed.slice(selectedCountry.dialCode.length).trim();
      }
      return trimmed;
    }
    return trimmed;
  }, [value, selectedCountry]);

  // Handle number input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    
    // If user types or pastes a number starting with '+', auto detect country!
    if (rawInput.trim().startsWith('+')) {
      const detected = detectCountryFromPhone(rawInput);
      setSelectedCountry(detected);
      onChange(rawInput);
      return;
    }

    // Clean input - only allow digits, spaces, hyphens, parentheses
    const cleaned = rawInput.replace(/[^0-9\s()-]/g, '');
    
    // If empty
    if (!cleaned.trim()) {
      onChange('');
      return;
    }

    // Strip leading 0 if local trunk (e.g. 080... in NG becomes +234 80...)
    let nationalPart = cleaned.trim();
    if (nationalPart.startsWith('0')) {
      nationalPart = nationalPart.slice(1);
    }

    const full = `${selectedCountry.dialCode} ${nationalPart}`.trim();
    onChange(full);
  };

  // Handle selecting a country from the dropdown
  const handleSelectCountry = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');

    // Reformat existing number with new dial code
    if (value && value.trim()) {
      let digits = value.replace(/[^0-9]/g, '');
      const oldDialDigits = selectedCountry.dialCode.replace('+', '');
      if (digits.startsWith(oldDialDigits)) {
        digits = digits.slice(oldDialDigits.length);
      }
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      if (digits) {
        onChange(`${country.dialCode} ${digits}`.trim());
      } else {
        onChange('');
      }
    }
  };

  // Filter countries by name, code, or dial code
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return WORLD_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return WORLD_COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [searchQuery]);

  const defaultPlaceholder = selectedCountry.format || 'Phone number';

  return (
    <div className={`relative flex items-center ${className}`} ref={dropdownRef}>
      {/* Country Selector Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200/80 dark:border-white/10 border-r-0 rounded-l-xl text-neutral-900 dark:text-white transition-colors cursor-pointer shrink-0 select-none text-xs sm:text-sm font-semibold"
        title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
      >
        <span className="text-base sm:text-lg leading-none" role="img" aria-label={selectedCountry.name}>
          {selectedCountry.flag}
        </span>
        <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Phone Number Input */}
      <input
        id={id}
        type="tel"
        disabled={disabled}
        required={required}
        value={localNumber}
        onChange={handleInputChange}
        placeholder={placeholder || defaultPlaceholder}
        className={`flex-1 min-w-0 px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-r-xl text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${inputClassName}`}
      />

      {/* Searchable Country Dropdown Modal/Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 max-h-72 bg-white dark:bg-[#121620] border border-neutral-200/80 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="p-2.5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black/30 border border-neutral-200/80 dark:border-white/10 rounded-xl">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100 dark:divide-white/[0.03]">
            {filteredCountries.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map(country => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={country.code + country.dialCode}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs ${
                      isSelected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base sm:text-lg shrink-0">{country.flag}</span>
                      <span className="truncate font-medium">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs opacity-70">{country.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
