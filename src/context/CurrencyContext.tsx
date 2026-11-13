import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CURRENCIES,
  CurrencyConfig,
  FALLBACK_RATES_FROM_NGN,
  POPULAR_CURRENCY_CODES,
  COUNTRY_NAMES,
  convertFromNgn,
  formatCurrencyAmount,
  getCurrencyConfig,
  getCurrencyForCountry,
  getFlutterwaveCheckoutDetails,
  guessCountryFromBrowser,
} from '../utils/currency';

const STORAGE_CURRENCY_KEY = 'chipng_preferred_currency';
const STORAGE_COUNTRY_KEY = 'chipng_detected_country';

interface CurrencyContextValue {
  currency: string;
  currencyConfig: CurrencyConfig;
  countryCode: string;
  countryName: string;
  city: string;
  isInternational: boolean;
  isDetecting: boolean;
  rates: Record<string, number>;
  isManualOverride: boolean;
  convertNgn: (ngnAmount: number) => number;
  formatNgn: (ngnAmount: number, options?: { compact?: boolean }) => string;
  getCheckout: (ngnAmount: number) => {
    checkoutCurrency: string;
    checkoutAmount: number;
    displayCurrency: string;
    displayAmount: number;
    isFallbackToUsd: boolean;
  };
  setManualCurrency: (currencyCode: string) => void;
  resetToAutoDetected: () => void;
  popularCurrencies: CurrencyConfig[];
}

const defaultCurrencyValue: CurrencyContextValue = {
  currency: 'NGN',
  currencyConfig: CURRENCIES.NGN,
  countryCode: 'NG',
  countryName: 'Nigeria',
  city: 'Lagos',
  isInternational: false,
  isDetecting: false,
  rates: FALLBACK_RATES_FROM_NGN,
  isManualOverride: false,
  convertNgn: (ngn: number) => ngn,
  formatNgn: (ngn: number, opts?: { compact?: boolean }) => formatCurrencyAmount(ngn, 'NGN', opts),
  getCheckout: (ngn: number) => getFlutterwaveCheckoutDetails(ngn, 'NGN', FALLBACK_RATES_FROM_NGN),
  setManualCurrency: () => {},
  resetToAutoDetected: () => {},
  popularCurrencies: POPULAR_CURRENCY_CODES.map((c) => CURRENCIES[c]).filter(Boolean),
};

const CurrencyContext = createContext<CurrencyContextValue>(defaultCurrencyValue);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCode] = useState<string>(() => {
    if (typeof window === 'undefined') return 'NG';
    try {
      const savedCountry = localStorage.getItem(STORAGE_COUNTRY_KEY);
      if (savedCountry) return savedCountry.toUpperCase();
    } catch {}
    return guessCountryFromBrowser();
  });

  const [countryName, setCountryName] = useState<string>(() => {
    return COUNTRY_NAMES[countryCode] || 'Nigeria';
  });
  const [city, setCity] = useState<string>('');

  const [isManualOverride, setIsManualOverride] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(localStorage.getItem(STORAGE_CURRENCY_KEY));
    } catch {
      return false;
    }
  });

  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window === 'undefined') return 'NGN';
    try {
      const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
      if (saved) return saved.toUpperCase();
    } catch {}
    const guessed = guessCountryFromBrowser();
    return getCurrencyForCountry(guessed);
  });

  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES_FROM_NGN);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  const fetchGeoCurrency = useCallback(async (forceResetCurrency = false) => {
    try {
      const res = await fetch('/api/geo-currency');
      if (!res.ok) throw new Error('Geo currency endpoint unavailable');
      const data = await res.json();

      if (data.rates && typeof data.rates === 'object') {
        setRates((prev) => ({ ...prev, ...data.rates }));
      }

      if (data.countryCode) {
        const cleanCode = String(data.countryCode).toUpperCase();
        setCountryCode(cleanCode);
        setCountryName(data.countryName || COUNTRY_NAMES[cleanCode] || cleanCode);
        if (data.city) setCity(data.city);
        try {
          localStorage.setItem(STORAGE_COUNTRY_KEY, cleanCode);
        } catch {}

        const savedOverride = (() => {
          try {
            return localStorage.getItem(STORAGE_CURRENCY_KEY);
          } catch {
            return null;
          }
        })();

        if (forceResetCurrency || !savedOverride) {
          const detectedCurrency = data.currency || getCurrencyForCountry(cleanCode);
          setCurrency(detectedCurrency.toUpperCase());
        }
      } else if (data.currency && (forceResetCurrency || !localStorage.getItem(STORAGE_CURRENCY_KEY))) {
        setCurrency(String(data.currency).toUpperCase());
      }
    } catch {
      // Keep instant browser timezone fallback & fallback FX rates seamlessly
    } finally {
      setIsDetecting(false);
    }
  }, []);

  useEffect(() => {
    fetchGeoCurrency(false);
  }, [fetchGeoCurrency]);

  const setManualCurrency = useCallback((currencyCode: string) => {
    const upper = (currencyCode || 'NGN').toUpperCase();
    setCurrency(upper);
    setIsManualOverride(true);
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, upper);
    } catch {}
  }, []);

  const resetToAutoDetected = useCallback(() => {
    setIsManualOverride(false);
    try {
      localStorage.removeItem(STORAGE_CURRENCY_KEY);
    } catch {}
    fetchGeoCurrency(true);
  }, [fetchGeoCurrency]);

  const convertNgn = useCallback(
    (ngnAmount: number) => convertFromNgn(ngnAmount, currency, rates),
    [currency, rates]
  );

  const formatNgn = useCallback(
    (ngnAmount: number, options?: { compact?: boolean }) => {
      const converted = convertFromNgn(ngnAmount, currency, rates);
      return formatCurrencyAmount(converted, currency, options);
    },
    [currency, rates]
  );

  const getCheckout = useCallback(
    (ngnAmount: number) => getFlutterwaveCheckoutDetails(ngnAmount, currency, rates),
    [currency, rates]
  );

  const currencyConfig = useMemo(() => getCurrencyConfig(currency), [currency]);
  const isInternational = useMemo(
    () => currency !== 'NGN' || (countryCode !== 'NG' && countryCode !== ''),
    [currency, countryCode]
  );

  const popularCurrencies = useMemo(
    () => POPULAR_CURRENCY_CODES.map((c) => CURRENCIES[c]).filter(Boolean),
    []
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      currencyConfig,
      countryCode,
      countryName,
      city,
      isInternational,
      isDetecting,
      rates,
      isManualOverride,
      convertNgn,
      formatNgn,
      getCheckout,
      setManualCurrency,
      resetToAutoDetected,
      popularCurrencies,
    }),
    [
      currency,
      currencyConfig,
      countryCode,
      countryName,
      city,
      isInternational,
      isDetecting,
      rates,
      isManualOverride,
      convertNgn,
      formatNgn,
      getCheckout,
      setManualCurrency,
      resetToAutoDetected,
      popularCurrencies,
    ]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
