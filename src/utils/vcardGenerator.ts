/**
 * CHIP NG — RFC 2426 Compliant vCard 3.0 Engine
 * Generates verified, universal virtual contact files (.vcf) compatible with
 * Apple iOS Contacts, Google Contacts (Android), Samsung Contacts, Microsoft Outlook,
 * macOS Address Book, and all modern smartphone operating systems.
 */

export interface VCardProfileData {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  headline?: string | null;
  bio?: string | null;
  cover_image_url?: string | null;
  contact_email?: string | null;
  email?: string | null;
  phone_number?: string | null;
  is_whatsapp?: boolean | null;
  address?: string | null;
  company?: string | null;
  enterprise?: {
    name?: string | null;
    brand_color?: string | null;
  } | null;
  social_links?: Array<{
    platform?: string;
    url?: string;
  }> | null;
}

export interface VCardOptions {
  imageBase64?: string | null;
  imageMimeType?: string | null;
  customNote?: string | null;
  includeSocials?: boolean;
}

/**
 * Escapes characters that have special meaning in vCard 3.0 values:
 * backslashes, semicolons, commas, and newlines.
 */
function escapeVCardValue(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
    .trim();
}

/**
 * Parses a full name into RFC 2426 structured components:
 * FamilyName;GivenName;AdditionalNames;HonorificPrefixes;HonorificSuffixes
 */
function parseStructuredName(fullName: string | null | undefined, fallbackUsername: string = 'Contact'): {
  family: string;
  given: string;
  additional: string;
  formatted: string;
} {
  const clean = (fullName || '').trim();
  if (!clean) {
    return {
      family: '',
      given: fallbackUsername,
      additional: '',
      formatted: fallbackUsername
    };
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return {
      family: '',
      given: parts[0],
      additional: '',
      formatted: parts[0]
    };
  }

  if (parts.length === 2) {
    return {
      family: parts[1],
      given: parts[0],
      additional: '',
      formatted: clean
    };
  }

  // 3 or more names (e.g. Abubakar Soyemi Adeniji)
  const given = parts[0];
  const family = parts[parts.length - 1];
  const additional = parts.slice(1, -1).join(' ');

  return {
    family,
    given,
    additional,
    formatted: clean
  };
}

/**
 * Extracts all valid phone numbers from a profile field.
 * Supports JSON string array (e.g. '["07240200165","07240532272"]'),
 * comma-separated strings, or standard single numbers.
 */
export function extractPhoneNumbers(phoneInput: string | null | undefined): string[] {
  if (!phoneInput) return [];
  const raw = String(phoneInput).trim();
  if (!raw) return [];

  // Try JSON array
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(p => String(p).trim()).filter(Boolean);
      }
    } catch (e) {}
  }

  // Try comma-separated
  if (raw.includes(',')) {
    return raw.split(',').map(p => p.trim()).filter(Boolean);
  }

  return [raw];
}

/**
 * Builds a 100% RFC 2426 compliant vCard 3.0 string with CRLF line breaks.
 */
export function generateVCardString(profile: VCardProfileData, options: VCardOptions = {}): string {
  const username = (profile.username || 'contact').trim();
  const nameParts = parseStructuredName(profile.full_name, username);
  
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0'
  ];

  // 1. Structured Name & Formatted Name (Mandatory in vCard 3.0 RFC 2426)
  lines.push(`N:${escapeVCardValue(nameParts.family)};${escapeVCardValue(nameParts.given)};${escapeVCardValue(nameParts.additional)};;;`);
  lines.push(`FN:${nameParts.formatted}`);

  // 2. Organization / Company
  const orgName = profile.enterprise?.name || profile.company;
  if (orgName) {
    lines.push(`ORG:${escapeVCardValue(orgName)}`);
  }

  // 3. Job Title / Headline
  if (profile.headline) {
    lines.push(`TITLE:${escapeVCardValue(profile.headline)}`);
  }

  // 4. Phone Numbers (Cell & Primary)
  const phones = extractPhoneNumbers(profile.phone_number);
  phones.forEach((phone, idx) => {
    // Strip redundant punctuation for clean dialer recognition while retaining leading +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const dialPhone = cleanPhone || phone;
    if (idx === 0) {
      lines.push(`TEL;TYPE=CELL,VOICE;TYPE=pref:${dialPhone}`);
    } else {
      lines.push(`TEL;TYPE=CELL,VOICE:${dialPhone}`);
    }
  });

  // 5. Emails (Work & Contact)
  const primaryEmail = (profile.contact_email || profile.email || '').trim();
  if (primaryEmail) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK;TYPE=pref:${primaryEmail}`);
  }
  if (profile.email && profile.contact_email && profile.email.toLowerCase() !== profile.contact_email.toLowerCase()) {
    lines.push(`EMAIL;TYPE=INTERNET,HOME:${profile.email.trim()}`);
  }

  // 6. Address
  if (profile.address) {
    lines.push(`ADR;TYPE=WORK;TYPE=pref:;;${escapeVCardValue(profile.address)};;;;`);
  }

  // 7. Canonical CHIP NG Profile URL
  const profileUrl = `https://www.chipng.com/@${username}`;
  lines.push(`URL;TYPE=WORK:${profileUrl}`);

  // 8. Social Profiles (iOS & modern Android contact card recognition)
  if (options.includeSocials !== false && Array.isArray(profile.social_links)) {
    profile.social_links.forEach(link => {
      if (!link || !link.url) return;
      const platform = (link.platform || '').toLowerCase().trim();
      const url = link.url.trim();

      if (platform.includes('whatsapp') || url.includes('wa.me') || url.includes('whatsapp.com')) {
        const match = url.match(/\d+/g);
        if (match) {
          lines.push(`X-SOCIALPROFILE;type=WhatsApp:${url}`);
        }
      } else if (platform.includes('linkedin') || url.includes('linkedin.com')) {
        lines.push(`X-SOCIALPROFILE;type=LinkedIn:${url}`);
      } else if (platform.includes('twitter') || platform.includes('x') || url.includes('twitter.com') || url.includes('x.com')) {
        lines.push(`X-SOCIALPROFILE;type=Twitter:${url}`);
      } else if (platform.includes('instagram') || url.includes('instagram.com')) {
        lines.push(`X-SOCIALPROFILE;type=Instagram:${url}`);
      } else if (platform.includes('facebook') || url.includes('facebook.com')) {
        lines.push(`X-SOCIALPROFILE;type=Facebook:${url}`);
      } else if (platform.includes('tiktok') || url.includes('tiktok.com')) {
        lines.push(`X-SOCIALPROFILE;type=TikTok:${url}`);
      } else if (platform.includes('youtube') || url.includes('youtube.com')) {
        lines.push(`X-SOCIALPROFILE;type=YouTube:${url}`);
      } else if (platform.includes('github') || url.includes('github.com')) {
        lines.push(`X-SOCIALPROFILE;type=GitHub:${url}`);
      } else {
        lines.push(`URL;TYPE=${escapeVCardValue(link.platform || 'OTHER')}:${url}`);
      }
    });
  }

  // 8b. Dedicated WhatsApp Number integration for verified 1-tap messaging
  if (profile.is_whatsapp !== false && phones.length > 0) {
    const cleanDigits = phones[0].replace(/[^\d]/g, '');
    if (cleanDigits && !lines.some(l => l.includes('type=WhatsApp'))) {
      lines.push(`X-SOCIALPROFILE;type=WhatsApp:https://wa.me/${cleanDigits}`);
    }
  }

  // 9. Photo Avatar
  if (options.imageBase64) {
    const type = (options.imageMimeType || 'JPEG').replace('image/', '').toUpperCase();
    lines.push(`PHOTO;ENCODING=b;TYPE=${type}:${options.imageBase64}`);
  } else if (profile.cover_image_url) {
    lines.push(`PHOTO;VALUE=URI:${profile.cover_image_url}`);
  }

  // 10. Notes / Bio / Verification Footprint
  const noteParts: string[] = [];
  if (profile.bio) noteParts.push(profile.bio.trim());
  if (profile.headline && !profile.bio) noteParts.push(profile.headline.trim());
  noteParts.push(`Saved via CHIP NG Contactless Smart Card: ${profileUrl}`);
  
  if (options.customNote) {
    noteParts.push(options.customNote.trim());
  }
  
  lines.push(`NOTE:${escapeVCardValue(noteParts.join('\n\n'))}`);

  // 11. Revision timestamp & Close
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  // RFC 2426 strictly requires CRLF line endings
  return lines.join('\r\n');
}

/**
 * Client-Side Instant vCard Download.
 * Executed synchronously on user interaction to guarantee zero Safari / Chrome popup blocking.
 */
export function downloadVCardClient(
  profile: VCardProfileData,
  options?: {
    showToast?: boolean;
    onSuccess?: () => void;
  }
): boolean {
  if (!profile) return false;

  try {
    const cleanUsername = (profile.username || 'contact').toLowerCase().trim();
    const cleanName = (profile.full_name || profile.username || 'contact')
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_');
      
    const filename = `${cleanName}.vcf`;
    const vCardContent = generateVCardString(profile);

    // Primary: Blob URL with standard text/vcard MIME
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
    }, 2000);

    if (options?.onSuccess) {
      options.onSuccess();
    }

    return true;
  } catch (err) {
    console.error('Client vCard download error:', err);
    // Fallback: direct window location to server endpoint
    if (profile.username) {
      window.location.href = `/api/vcard/${encodeURIComponent(profile.username)}`;
      return true;
    }
    return false;
  }
}
