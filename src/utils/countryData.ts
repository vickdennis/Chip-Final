export interface CountryInfo {
  name: string;
  code: string; // ISO 2-letter
  dialCode: string; // e.g. +234
  flag: string; // Emoji flag
  format?: string; // Example placeholder
}

// Comprehensive international country dialing dataset covering all world regions
export const WORLD_COUNTRIES: CountryInfo[] = [
  // Top / Frequent CHIP NG regions
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', format: '803 123 4567' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', format: '(555) 123-4567' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', format: '7911 123456' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', format: '(555) 123-4567' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', format: '24 123 4567' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', format: '712 345678' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', format: '82 123 4567' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', format: '50 123 4567' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', format: '151 12345678' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', format: '6 12 34 56 78' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', format: '98765 43210' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', format: '138 1234 5678' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', format: '412 345 678' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', format: '788 123 456' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', format: '100 123 4567' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', format: '50 123 4567' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', format: '3312 3456' },

  // A-Z Complete World Registry
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Andorra', code: 'AD', dialCode: '+376', flag: '🇦🇩' },
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: '🇦🇴' },
  { name: 'Antigua and Barbuda', code: 'AG', dialCode: '+1268', flag: '🇦🇬' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Armenia', code: 'AM', dialCode: '+374', flag: '🇦🇲' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', flag: '🇦🇿' },
  { name: 'Bahamas', code: 'BS', dialCode: '+1242', flag: '🇧🇸' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Barbados', code: 'BB', dialCode: '+1246', flag: '🇧🇧' },
  { name: 'Belarus', code: 'BY', dialCode: '+375', flag: '🇧🇾' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Belize', code: 'BZ', dialCode: '+501', flag: '🇧🇿' },
  { name: 'Benin', code: 'BJ', dialCode: '+229', flag: '🇧🇯' },
  { name: 'Bermuda', code: 'BM', dialCode: '+1441', flag: '🇧🇲' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: '🇧🇹' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: 'BW', dialCode: '+267', flag: '🇧🇼' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Brunei', code: 'BN', dialCode: '+673', flag: '🇧🇳' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: '🇧🇫' },
  { name: 'Burundi', code: 'BI', dialCode: '+257', flag: '🇧🇮' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855', flag: '🇰🇭' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲' },
  { name: 'Cape Verde', code: 'CV', dialCode: '+238', flag: '🇨🇻' },
  { name: 'Cayman Islands', code: 'KY', dialCode: '+1345', flag: '🇰🇾' },
  { name: 'Central African Republic', code: 'CF', dialCode: '+236', flag: '🇨🇫' },
  { name: 'Chad', code: 'TD', dialCode: '+235', flag: '🇹🇩' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Comoros', code: 'KM', dialCode: '+269', flag: '🇰🇲' },
  { name: 'Congo (Republic)', code: 'CG', dialCode: '+242', flag: '🇨🇬' },
  { name: 'Congo (DRC)', code: 'CD', dialCode: '+243', flag: '🇨🇩' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: '🇨🇷' },
  { name: 'Cote d\'Ivoire', code: 'CI', dialCode: '+225', flag: '🇨🇮' },
  { name: 'Croatia', code: 'HR', dialCode: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: 'CU', dialCode: '+53', flag: '🇨🇺' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Djibouti', code: 'DJ', dialCode: '+253', flag: '🇩🇯' },
  { name: 'Dominica', code: 'DM', dialCode: '+1767', flag: '🇩🇲' },
  { name: 'Dominican Republic', code: 'DO', dialCode: '+1809', flag: '🇩🇴' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨' },
  { name: 'Equatorial Guinea', code: 'GQ', dialCode: '+240', flag: '🇬🇶' },
  { name: 'Eritrea', code: 'ER', dialCode: '+291', flag: '🇪🇷' },
  { name: 'Estonia', code: 'EE', dialCode: '+372', flag: '🇪🇪' },
  { name: 'Eswatini', code: 'SZ', dialCode: '+268', flag: '🇸🇿' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹' },
  { name: 'Fiji', code: 'FJ', dialCode: '+679', flag: '🇫🇯' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: '🇬🇦' },
  { name: 'Gambia', code: 'GM', dialCode: '+220', flag: '🇬🇲' },
  { name: 'Georgia', code: 'GE', dialCode: '+995', flag: '🇬🇪' },
  { name: 'Gibraltar', code: 'GI', dialCode: '+350', flag: '🇬🇮' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'Grenada', code: 'GD', dialCode: '+1473', flag: '🇬🇩' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: '🇬🇹' },
  { name: 'Guinea', code: 'GN', dialCode: '+224', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: 'GW', dialCode: '+245', flag: '🇬🇼' },
  { name: 'Guyana', code: 'GY', dialCode: '+592', flag: '🇬🇾' },
  { name: 'Haiti', code: 'HT', dialCode: '+509', flag: '🇭🇹' },
  { name: 'Honduras', code: 'HN', dialCode: '+504', flag: '🇭🇳' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: '🇭🇰' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺' },
  { name: 'Iceland', code: 'IS', dialCode: '+354', flag: '🇮🇸' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1876', flag: '🇯🇲' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', flag: '🇰🇿' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', code: 'KG', dialCode: '+996', flag: '🇰🇬' },
  { name: 'Laos', code: 'LA', dialCode: '+856', flag: '🇱🇦' },
  { name: 'Latvia', code: 'LV', dialCode: '+371', flag: '🇱🇻' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Lesotho', code: 'LS', dialCode: '+266', flag: '🇱🇸' },
  { name: 'Liberia', code: 'LR', dialCode: '+231', flag: '🇱🇷' },
  { name: 'Libya', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: 'LI', dialCode: '+423', flag: '🇱🇮' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', flag: '🇱🇹' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺' },
  { name: 'Madagascar', code: 'MG', dialCode: '+261', flag: '🇲🇬' },
  { name: 'Malawi', code: 'MW', dialCode: '+265', flag: '🇲🇼' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: '🇲🇻' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: '🇲🇱' },
  { name: 'Malta', code: 'MT', dialCode: '+356', flag: '🇲🇹' },
  { name: 'Mauritania', code: 'MR', dialCode: '+222', flag: '🇲🇷' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: '🇲🇺' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Moldova', code: 'MD', dialCode: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: 'MC', dialCode: '+377', flag: '🇲🇨' },
  { name: 'Mongolia', code: 'MN', dialCode: '+976', flag: '🇲🇳' },
  { name: 'Montenegro', code: 'ME', dialCode: '+382', flag: '🇲🇪' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258', flag: '🇲🇿' },
  { name: 'Namibia', code: 'NA', dialCode: '+264', flag: '🇳🇦' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Niger', code: 'NE', dialCode: '+227', flag: '🇳🇪' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Panama', code: 'PA', dialCode: '+507', flag: '🇵🇦' },
  { name: 'Papua New Guinea', code: 'PG', dialCode: '+675', flag: '🇵🇬' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Senegal', code: 'SN', dialCode: '+221', flag: '🇸🇳' },
  { name: 'Serbia', code: 'RS', dialCode: '+381', flag: '🇷🇸' },
  { name: 'Seychelles', code: 'SC', dialCode: '+248', flag: '🇸🇨' },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232', flag: '🇸🇱' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', flag: '🇸🇰' },
  { name: 'Slovenia', code: 'SI', dialCode: '+386', flag: '🇸🇮' },
  { name: 'Somalia', code: 'SO', dialCode: '+252', flag: '🇸🇴' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Sudan', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: '🇹🇼' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: '🇹🇬' },
  { name: 'Trinidad and Tobago', code: 'TT', dialCode: '+1868', flag: '🇹🇹' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', flag: '🇺🇿' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Yemen', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼' }
];

/**
 * Detect country info from a phone number string (e.g. +447911..., +1415..., 0803...)
 */
export function detectCountryFromPhone(phone: string): CountryInfo {
  if (!phone) return WORLD_COUNTRIES[0]; // Default to Nigeria
  const cleaned = phone.trim();

  if (cleaned.startsWith('+')) {
    // Sort dial codes by length descending so +1242 matches Bahamas before +1 matches US
    const sorted = [...WORLD_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (cleaned.startsWith(c.dialCode)) {
        return c;
      }
    }
  }

  // Nigerian local prefixes (080, 081, 090, 091, 070)
  if (/^0[789][01]/.test(cleaned)) {
    return WORLD_COUNTRIES[0]; // NG
  }

  // UK local prefixes (07...)
  if (/^07\d{8,9}/.test(cleaned)) {
    return WORLD_COUNTRIES.find(c => c.code === 'GB') || WORLD_COUNTRIES[0];
  }

  // Default fallback
  return WORLD_COUNTRIES[0];
}

/**
 * Resolves a CountryInfo object from a CountryInfo, dial code string (+234), or ISO code (NG)
 */
export function resolveCountry(input?: CountryInfo | string): CountryInfo {
  if (!input) return WORLD_COUNTRIES[0];
  if (typeof input === 'object' && input.dialCode) return input;
  const str = String(input).trim();
  const cleanCode = str.startsWith('+') ? str : '+' + str.replace(/^\D+/, '');
  const found = WORLD_COUNTRIES.find(c => 
    c.dialCode === str || 
    c.dialCode === cleanCode || 
    c.code.toLowerCase() === str.toLowerCase() ||
    c.name.toLowerCase() === str.toLowerCase()
  );
  return found || WORLD_COUNTRIES[0];
}

/**
 * Formats any phone number into full international E.164 dialer format (+<countryCode><nationalNumber>)
 */
export function formatToInternationalE164(phone: string, defaultCountryInput: CountryInfo | string = WORLD_COUNTRIES[0]): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const defaultCountry = resolveCountry(defaultCountryInput);

  // If already starts with '+', clean inner invalid punctuation but preserve the leading '+'
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.replace(/[^0-9]/g, '');
  }

  // If starts with '00' (international direct prefix)
  if (trimmed.startsWith('00')) {
    return '+' + trimmed.slice(2).replace(/[^0-9]/g, '');
  }

  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  if (!digitsOnly) return '';

  // Check if digits start with country's dial code without the '+'
  const dialCodeDigits = defaultCountry.dialCode.replace('+', '');
  if (digitsOnly.startsWith(dialCodeDigits)) {
    return '+' + digitsOnly;
  }

  // Handle local trunk prefix '0' (e.g., 0803... in NG, 0791... in UK)
  if (digitsOnly.startsWith('0')) {
    return defaultCountry.dialCode + digitsOnly.slice(1);
  }

  // Prepend country code
  return defaultCountry.dialCode + digitsOnly;
}

/**
 * Returns a direct WhatsApp URL for any international phone number with optional message
 */
export function getInternationalWhatsAppUrl(
  phone: string, 
  countryOrDefaultOrMessage?: CountryInfo | string,
  messageText?: string
): string {
  if (!phone) return '';
  let defaultCountry: CountryInfo = WORLD_COUNTRIES[0];
  let message: string | undefined = undefined;

  if (typeof countryOrDefaultOrMessage === 'string') {
    // If it looks like a country code (e.g. '+234' or 'NG' or starts with '+')
    if (countryOrDefaultOrMessage.startsWith('+') || countryOrDefaultOrMessage.length <= 4) {
      defaultCountry = resolveCountry(countryOrDefaultOrMessage);
      message = messageText;
    } else {
      // It's a message text!
      message = countryOrDefaultOrMessage;
    }
  } else if (countryOrDefaultOrMessage && typeof countryOrDefaultOrMessage === 'object') {
    defaultCountry = resolveCountry(countryOrDefaultOrMessage);
    message = messageText;
  }

  const e164 = formatToInternationalE164(phone, defaultCountry);
  const cleanDigits = e164.replace(/[^0-9]/g, '');
  if (!cleanDigits) return '';
  const base = `https://wa.me/${cleanDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
