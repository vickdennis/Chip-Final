/**
 * CHIP NG — Google Form & Google Sheet Submissions Parser
 * Automatically ingests Google Form response sheets / CSV exports to create full user profiles.
 */

export interface ParsedFormUser {
  id?: string;
  full_name: string;
  email: string;
  username: string;
  headline?: string;
  bio?: string;
  phone_number?: string;
  address?: string;
  company?: string;
  calendar_link?: string;
  cover_image_url?: string;
  theme?: string;
  bg_color?: string;
  password?: string;
  socials?: Array<{ platform: string; url: string }>;
  custom_links?: Array<{ title: string; url: string }>;
  is_verified?: boolean;
  selected?: boolean;
  status?: 'pending' | 'creating' | 'success' | 'error';
  errorMessage?: string;
}

// Convert various Google Form/Sheet URL formats to exportable CSV URL
export function convertGoogleUrlToCsvExport(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // 1. Google Sheets URL: https://docs.google.com/spreadsheets/d/{ID}/edit...
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const sheetId = sheetMatch[1];
    // Check for specific gid (sheet tab)
    const gidMatch = url.match(/gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
  }

  // 2. Published Google Sheet CSV
  if (url.includes('/pub?output=csv') || url.includes('/export?format=csv')) {
    return url;
  }

  return null;
}

// Parse CSV text with full RFC 4180 support (escaped quotes, commas, newlines)
export function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: ""
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\t' && !insideQuotes && !normalized.includes(',')) {
      // Tab-delimited fallback
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Normalize column header for fuzzy matching
function cleanHeader(header: string): string {
  return (header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cleanUsername(raw: string, fallbackName: string, email: string): string {
  let val = (raw || '').trim().replace(/^@+/, '').toLowerCase();
  val = val.replace(/[^a-z0-9._-]/g, '');

  if (!val || val.length < 2) {
    // Generate from name or email
    if (fallbackName && fallbackName.trim()) {
      val = fallbackName.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, '');
    } else if (email && email.includes('@')) {
      val = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
    }
  }

  return val || `chip_${Math.random().toString(36).substring(2, 7)}`;
}

function generateStrongPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%';
  let gen = 'Chip';
  for (let i = 0; i < 8; i++) {
    gen += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return gen;
}

// Main parser that converts CSV matrix into structured ParsedFormUser array
export function mapCsvRowsToProfiles(rows: string[][]): ParsedFormUser[] {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(h => cleanHeader(h));
  const rawHeaders = rows[0];

  // Helper to find column index matching keywords
  const findCol = (...keywords: string[]): number => {
    for (const kw of keywords) {
      const cleanKw = cleanHeader(kw);
      const idx = headers.findIndex(h => h.includes(cleanKw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx = findCol('fullname', 'name', 'whoyouare', 'firstandlastname', 'clientname', 'full');
  const emailIdx = findCol('emailaddress', 'email', 'contactemail', 'workemail', 'personalemail');
  const usernameIdx = findCol('username', 'handle', 'desiredusername', 'chiphandle', 'preferredhandle', 'customusername');
  const headlineIdx = findCol('headline', 'jobtitle', 'title', 'profession', 'role', 'occupation', 'position');
  const bioIdx = findCol('bio', 'about', 'description', 'summary', 'tellusaboutyourself', 'intro');
  const phoneIdx = findCol('phone', 'whatsapp', 'phonenumber', 'mobile', 'tel', 'contactnumber');
  const addressIdx = findCol('address', 'location', 'city', 'state', 'country', 'office');
  const companyIdx = findCol('company', 'enterprise', 'brand', 'businessname', 'organization');
  const calendarIdx = findCol('calendly', 'calendar', 'booking', 'meetinglink', 'appointment');
  const photoIdx = findCol('photo', 'headshot', 'profilephoto', 'coverimage', 'avatar', 'picture', 'imageurl', 'drive');
  const themeIdx = findCol('theme', 'cardcolor', 'color', 'accentcolor', 'palette', 'style');
  const passwordIdx = findCol('password', 'initialpassword', 'preferredpassword', 'accountpassword');

  // Social columns
  const linkedinIdx = findCol('linkedin');
  const instagramIdx = findCol('instagram', 'ig');
  const twitterIdx = findCol('twitter', 'xprofile', 'xhandle', 'twitterx');
  const tiktokIdx = findCol('tiktok');
  const youtubeIdx = findCol('youtube');
  const githubIdx = findCol('github');
  const facebookIdx = findCol('facebook');
  const websiteIdx = findCol('website', 'portfolio', 'companywebsite', 'personallink', 'web');

  const users: ParsedFormUser[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx].trim().toLowerCase() : '';
    const fullName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : '';

    // Must have at least a name or email
    if (!email && !fullName) continue;

    const rawUsername = usernameIdx !== -1 && row[usernameIdx] ? row[usernameIdx].trim() : '';
    const username = cleanUsername(rawUsername, fullName, email);

    const headline = headlineIdx !== -1 && row[headlineIdx] ? row[headlineIdx].trim() : '';
    const bio = bioIdx !== -1 && row[bioIdx] ? row[bioIdx].trim() : '';
    const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : '';
    const address = addressIdx !== -1 && row[addressIdx] ? row[addressIdx].trim() : '';
    const company = companyIdx !== -1 && row[companyIdx] ? row[companyIdx].trim() : '';
    const calendar = calendarIdx !== -1 && row[calendarIdx] ? row[calendarIdx].trim() : '';
    const photo = photoIdx !== -1 && row[photoIdx] ? row[photoIdx].trim() : '';
    const theme = themeIdx !== -1 && row[themeIdx] ? row[themeIdx].trim().toLowerCase() : 'default';
    const rawPass = passwordIdx !== -1 && row[passwordIdx] ? row[passwordIdx].trim() : '';
    const password = rawPass || generateStrongPassword();

    // Collect socials
    const socials: Array<{ platform: string; url: string }> = [];

    const addSocial = (platform: string, idx: number) => {
      if (idx !== -1 && row[idx]) {
        let val = row[idx].trim();
        if (val) {
          if (!val.startsWith('http://') && !val.startsWith('https://')) {
            if (platform === 'linkedin') val = `https://linkedin.com/in/${val.replace(/^@/, '')}`;
            else if (platform === 'instagram') val = `https://instagram.com/${val.replace(/^@/, '')}`;
            else if (platform === 'twitter') val = `https://x.com/${val.replace(/^@/, '')}`;
            else if (platform === 'tiktok') val = `https://tiktok.com/@${val.replace(/^@/, '')}`;
            else if (platform === 'youtube') val = `https://youtube.com/@${val.replace(/^@/, '')}`;
            else if (platform === 'github') val = `https://github.com/${val.replace(/^@/, '')}`;
            else val = `https://${val}`;
          }
          socials.push({ platform, url: val });
        }
      }
    };

    addSocial('linkedin', linkedinIdx);
    addSocial('instagram', instagramIdx);
    addSocial('twitter', twitterIdx);
    addSocial('tiktok', tiktokIdx);
    addSocial('youtube', youtubeIdx);
    addSocial('github', githubIdx);
    addSocial('facebook', facebookIdx);
    if (websiteIdx !== -1 && row[websiteIdx]) {
      let web = row[websiteIdx].trim();
      if (web && !web.startsWith('http://') && !web.startsWith('https://')) {
        web = `https://${web}`;
      }
      if (web) socials.push({ platform: 'website', url: web });
    }

    // Auto-detect extra social columns if user added them
    for (let c = 0; c < row.length; c++) {
      const headerText = headers[c] || '';
      const cellVal = (row[c] || '').trim();
      if (!cellVal || !cellVal.startsWith('http')) continue;

      if (cellVal.includes('linkedin.com') && !socials.some(s => s.platform === 'linkedin')) {
        socials.push({ platform: 'linkedin', url: cellVal });
      } else if (cellVal.includes('instagram.com') && !socials.some(s => s.platform === 'instagram')) {
        socials.push({ platform: 'instagram', url: cellVal });
      } else if ((cellVal.includes('x.com') || cellVal.includes('twitter.com')) && !socials.some(s => s.platform === 'twitter')) {
        socials.push({ platform: 'twitter', url: cellVal });
      }
    }

    users.push({
      full_name: fullName || username,
      email: email || `${username}@chipng.com`,
      username,
      headline: headline || (company ? `Professional at ${company}` : 'CHIP NG Member'),
      bio,
      phone_number: phone,
      address,
      company,
      calendar_link: calendar,
      cover_image_url: photo,
      theme: theme.includes('gold') ? 'gold' : theme.includes('dark') || theme.includes('black') ? 'default' : theme,
      password,
      socials,
      is_verified: true,
      selected: true,
      status: 'pending'
    });
  }

  return users;
}
export function getGoogleSheetsTemplateCsv(): string {
  const headers = [
    'Timestamp',
    'Full Name',
    'Email Address',
    'Desired Username',
    'Professional Headline',
    'Bio',
    'Phone Number',
    'City Location',
    'Card Tier',
    'WhatsApp Direct Link',
    'LinkedIn URL',
    'Instagram URL',
    'Twitter or X URL',
    'Company Website',
    'Calendly Booking Link',
    'Initial Password'
  ];
  const sampleRow1 = [
    new Date().toISOString(),
    'Dr. Victor Dennis',
    'vickthor.dennis@gmail.com',
    'vickdennis',
    'Founder & Managing Director | Makro Global',
    'Pioneering contactless NFC smart cards and dynamic link-in-bio infrastructure across West Africa.',
    '+234 803 123 4567',
    'Victoria Island, Lagos',
    'NFC Smart Metal Card (Executive)',
    'https://wa.me/2348031234567',
    'https://linkedin.com/in/vickdennis',
    'https://instagram.com/chipng_official',
    'https://x.com/chipng',
    'https://chipng.com',
    'https://calendly.com/chipng',
    'ChipNg_2026!'
  ];
  return headers.join(',') + '\n' + sampleRow1.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
}

export function downloadGoogleSheetsTemplateCsv(): void {
  if (typeof window === 'undefined') return;
  const csvContent = getGoogleSheetsTemplateCsv();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'chipng_client_onboarding_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
