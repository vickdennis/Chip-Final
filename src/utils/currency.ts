/**
 * CHIP NG - Global Location-Based Multi-Currency & FX Utility
 * Base catalog prices are stored in NGN (₦) and dynamically converted
 * to each visitor's local currency with Flutterwave multi-currency checkout compatibility.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
  flutterwaveSupported: boolean;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', decimals: 0, flutterwaveSupported: true },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2, flutterwaveSupported: true },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2, flutterwaveSupported: true },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2, flutterwaveSupported: true },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2, flutterwaveSupported: true },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2, flutterwaveSupported: true },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭', decimals: 2, flutterwaveSupported: true },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', decimals: 0, flutterwaveSupported: true },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', decimals: 2, flutterwaveSupported: true },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2, flutterwaveSupported: true },
  RWF: { code: 'RWF', symbol: 'RF ', name: 'Rwandan Franc', flag: '🇷🇼', decimals: 0, flutterwaveSupported: true },
  UGX: { code: 'UGX', symbol: 'USh ', name: 'Ugandan Shilling', flag: '🇺🇬', decimals: 0, flutterwaveSupported: true },
  TZS: { code: 'TZS', symbol: 'TSh ', name: 'Tanzanian Shilling', flag: '🇹🇿', decimals: 0, flutterwaveSupported: true },
  XOF: { code: 'XOF', symbol: 'CFA ', name: 'West African CFA', flag: '🇸🇳', decimals: 0, flutterwaveSupported: true },
  XAF: { code: 'XAF', symbol: 'FCFA ', name: 'Central African CFA', flag: '🇨🇲', decimals: 0, flutterwaveSupported: true },
  ZMW: { code: 'ZMW', symbol: 'ZK ', name: 'Zambian Kwacha', flag: '🇿🇲', decimals: 2, flutterwaveSupported: true },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬', decimals: 2, flutterwaveSupported: true },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 0, flutterwaveSupported: false },
  SAR: { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal', flag: '🇸🇦', decimals: 2, flutterwaveSupported: false },
  QAR: { code: 'QAR', symbol: 'QAR ', name: 'Qatari Riyal', flag: '🇶🇦', decimals: 2, flutterwaveSupported: false },
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', flag: '🇨🇭', decimals: 2, flutterwaveSupported: false },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', decimals: 0, flutterwaveSupported: false },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', decimals: 2, flutterwaveSupported: false },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2, flutterwaveSupported: false },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', decimals: 2, flutterwaveSupported: false },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽', decimals: 2, flutterwaveSupported: false },
};

// Quick-select featured currencies shown in navbar/shop switcher
export const POPULAR_CURRENCY_CODES = [
  'NGN',
  'USD',
  'GBP',
  'EUR',
  'CAD',
  'GHS',
  'KES',
  'ZAR',
  'AED',
  'AUD',
  'RWF',
  'INR',
];

// Fallback FX rates: 1 NGN = X Target Currency (updated at runtime by /api/geo-currency)
export const FALLBACK_RATES_FROM_NGN: Record<string, number> = {
  NGN: 1,
  USD: 0.000645,   // ~₦1,550 / $1
  GBP: 0.000505,   // ~₦1,980 / £1
  EUR: 0.000595,   // ~₦1,680 / €1
  CAD: 0.000893,   // ~₦1,120 / CA$1
  AUD: 0.00099,    // ~₦1,010 / A$1
  GHS: 0.0096,     // ~₦104 / GH₵1
  KES: 0.0833,     // ~₦12 / KSh1
  ZAR: 0.0116,     // ~₦86 / R1
  AED: 0.00237,    // ~₦422 / AED1
  RWF: 0.89,
  UGX: 2.38,
  TZS: 1.72,
  XOF: 0.39,
  XAF: 0.39,
  ZMW: 0.0175,
  EGP: 0.0318,
  INR: 0.0546,
  SAR: 0.00242,
  QAR: 0.00235,
  CHF: 0.000568,
  JPY: 0.098,
  CNY: 0.00465,
  SGD: 0.00086,
  BRL: 0.0037,
  MXN: 0.0129,
};

// Map ISO 2-letter Country Code -> Currency Code
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  NG: 'NGN',
  US: 'USD', PR: 'USD', VI: 'USD', GU: 'USD', EC: 'USD', PA: 'USD', SV: 'USD',
  GB: 'GBP', GG: 'GBP', JE: 'GBP', IM: 'GBP', GI: 'GBP',
  CA: 'CAD',
  AU: 'AUD', NZ: 'AUD',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR', NA: 'ZAR', LS: 'ZAR', SZ: 'ZAR',
  AE: 'AED',
  RW: 'RWF',
  UG: 'UGX',
  TZ: 'TZS',
  ZM: 'ZMW',
  EG: 'EGP',
  IN: 'INR',
  SA: 'SAR',
  QA: 'QAR',
  CH: 'CHF', LI: 'CHF',
  JP: 'JPY',
  CN: 'CNY', HK: 'USD', TW: 'USD',
  SG: 'SGD',
  BR: 'BRL',
  MX: 'MXN',
  // Eurozone countries
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  IE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR', HR: 'EUR', MC: 'EUR', AD: 'EUR',
  // West African CFA
  SN: 'XOF', CI: 'XOF', BJ: 'XOF', TG: 'XOF', ML: 'XOF', BF: 'XOF', NE: 'XOF', GW: 'XOF',
  // Central African CFA
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
};

export const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  IE: 'Ireland',
  BE: 'Belgium',
  PT: 'Portugal',
  AT: 'Austria',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  RW: 'Rwanda',
  UG: 'Uganda',
  TZ: 'Tanzania',
  EG: 'Egypt',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  QA: 'Qatar',
  AU: 'Australia',
  IN: 'India',
  SG: 'Singapore',
  JP: 'Japan',
  CN: 'China',
  BR: 'Brazil',
  MX: 'Mexico',
};

// Instant client-side timezone -> country fallback so first render matches region
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA',
  'Africa/Kigali': 'RW',
  'Africa/Kampala': 'UG',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Cairo': 'EG',
  'Africa/Dakar': 'SN',
  'Africa/Abidjan': 'CI',
  'Africa/Douala': 'CM',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT',
  'Europe/Lisbon': 'PT',
  'Europe/Zurich': 'CH',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Singapore': 'SG',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
};

export function guessCountryFromBrowser(): string {
  if (typeof window === 'undefined') return 'NG';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }
    if (tz) {
      if (tz.startsWith('America/')) return 'US';
      if (tz.startsWith('Europe/')) return 'EUR';
      if (tz.startsWith('Australia/')) return 'AU';
    }
    const lang = navigator.language || '';
    const region = lang.split('-')[1]?.toUpperCase();
    if (region && COUNTRY_TO_CURRENCY[region]) {
      return region;
    }
  } catch {
    // fallback
  }
  return 'NG';
}

export function getCurrencyForCountry(countryCode: string): string {
  if (!countryCode) return 'NGN';
  const upper = countryCode.toUpperCase();
  if (upper === 'EUR') return 'EUR';
  return COUNTRY_TO_CURRENCY[upper] || 'USD';
}

export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  const upper = (currencyCode || 'NGN').toUpperCase();
  return (
    CURRENCIES[upper] || {
      code: upper,
      symbol: `${upper} `,
      name: upper,
      flag: '🌍',
      decimals: 2,
      flutterwaveSupported: false,
    }
  );
}

/**
 * Converts a base NGN price into the target currency with clean presentation rounding.
 */
export function convertFromNgn(
  ngnAmount: number,
  targetCurrency: string,
  rates: Record<string, number> = FALLBACK_RATES_FROM_NGN
): number {
  const cleanNgn = Number(ngnAmount) || 0;
  if (cleanNgn === 0) return 0;

  const code = (targetCurrency || 'NGN').toUpperCase();
  if (code === 'NGN') return Math.round(cleanNgn);

  const rate = rates[code] ?? FALLBACK_RATES_FROM_NGN[code] ?? FALLBACK_RATES_FROM_NGN.USD;
  const raw = cleanNgn * rate;
  const cfg = getCurrencyConfig(code);

  if (cfg.decimals === 0) {
    // Round zero-decimal currencies cleanly (e.g. KES, JPY, INR, RWF)
    if (raw >= 1000) return Math.round(raw / 10) * 10;
    return Math.max(1, Math.round(raw));
  }

  // Round to 2 decimals for USD, GBP, EUR, CAD, etc.
  return Math.max(0.5, Math.round(raw * 100) / 100);
}

/**
 * Formats an already-converted amount in the specified currency.
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  options?: { compact?: boolean }
): string {
  const cfg = getCurrencyConfig(currencyCode);
  const num = Number(amount) || 0;

  if (options?.compact && num >= 1000 && cfg.decimals === 0) {
    return `${cfg.symbol}${Math.round(num / 1000)}k`;
  }

  if (cfg.code === 'NGN') {
    return `₦${Math.round(num).toLocaleString('en-US')}`;
  }

  const formattedNum = num.toLocaleString('en-US', {
    minimumFractionDigits: cfg.decimals === 0 ? 0 : (Number.isInteger(num) ? 0 : 2),
    maximumFractionDigits: cfg.decimals,
  });

  return `${cfg.symbol}${formattedNum}`;
}

/**
 * Returns the exact amount and Flutterwave-supported currency to charge at checkout.
 * If the visitor's display currency isn't directly supported by Flutterwave inline,
 * safely falls back to USD settlement so foreign cards/Apple Pay never fail.
 */
export function getFlutterwaveCheckoutDetails(
  ngnAmount: number,
  displayCurrency: string,
  rates: Record<string, number> = FALLBACK_RATES_FROM_NGN
): {
  checkoutCurrency: string;
  checkoutAmount: number;
  displayCurrency: string;
  displayAmount: number;
  isFallbackToUsd: boolean;
} {
  const cfg = getCurrencyConfig(displayCurrency);
  const displayAmount = convertFromNgn(ngnAmount, cfg.code, rates);

  if (cfg.flutterwaveSupported) {
    return {
      checkoutCurrency: cfg.code,
      checkoutAmount: displayAmount,
      displayCurrency: cfg.code,
      displayAmount,
      isFallbackToUsd: false,
    };
  }

  const usdAmount = convertFromNgn(ngnAmount, 'USD', rates);
  return {
    checkoutCurrency: 'USD',
    checkoutAmount: usdAmount,
    displayCurrency: cfg.code,
    displayAmount,
    isFallbackToUsd: true,
  };
}

/**
 * Returns optimal Flutterwave payment_options for the chosen checkout currency.
 */
export function getFlutterwavePaymentOptions(currencyCode: string): string {
  const c = (currencyCode || 'NGN').toUpperCase();
  switch (c) {
    case 'NGN':
      return 'card,banktransfer,ussd,opay';
    case 'GHS':
      return 'card,mobilemoneyghana';
    case 'KES':
      return 'card,mpesa';
    case 'RWF':
      return 'card,mobilemoneyrwanda';
    case 'UGX':
      return 'card,mobilemoneyuganda';
    case 'ZMW':
      return 'card,mobilemoneyzambia';
    case 'XOF':
    case 'XAF':
      return 'card,mobilemoneyfranco';
    case 'TZS':
      return 'card,mobilemoneytanzania';
    case 'ZAR':
      return 'card,1voucher';
    case 'USD':
    case 'GBP':
    case 'EUR':
    case 'CAD':
    case 'AUD':
      return 'card,applepay,googlepay';
    default:
      return 'card';
  }
}

/**
 * International DHL Express shipping cost in NGN when shipping outside Nigeria.
 * Free for orders >= ₦150,000 (e.g., Corporate Bundles).
 */
export function getInternationalShippingNgn(countryCode: string, orderSubtotalNgn: number): number {
  const cleanCountry = (countryCode || 'NG').toUpperCase();
  if (cleanCountry === 'NG') return 0;
  if (orderSubtotalNgn >= 150000) return 0; // Free worldwide VIP DHL Express on large orders/bundles
  // West/East/South Africa regional DHL Express vs Worldwide DHL Express
  const africaRegional = new Set(['GH', 'KE', 'ZA', 'RW', 'UG', 'TZ', 'SN', 'CI', 'CM', 'BJ', 'TG']);
  return africaRegional.has(cleanCountry) ? 18000 : 28000;
}
