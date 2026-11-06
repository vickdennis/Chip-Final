/**
 * Universal Username Normalization & Path Parsing Helper
 * Extracts clean, sanitized usernames from all supported URL formats:
 * - /@username
 * - /username
 * - /p/username
 * - /u/username
 * - /user/username
 * - /profile/username
 * - /@username/vcard
 * - /username/vcard
 * - /@username.vcf
 * - /username.vcf
 */

export function extractUsernameFromPath(rawInput: string | null | undefined): string | null {
  if (!rawInput) return null;

  try {
    // 1. Remove query params and hashes
    let cleaned = String(rawInput).split('?')[0].split('#')[0].trim();

    // 2. Decode URL encoding (e.g. %40 -> @)
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch {
      // Keep original if decoding fails
    }

    // 3. Remove leading and trailing slashes
    cleaned = cleaned.replace(/^\/+|\/+$/g, '');

    if (!cleaned) return null;

    // 4. Strip suffixes (/vcard, .vcf)
    if (cleaned.toLowerCase().endsWith('/vcard')) {
      cleaned = cleaned.slice(0, -6);
    }
    if (cleaned.toLowerCase().endsWith('.vcf')) {
      cleaned = cleaned.slice(0, -4);
    }

    // 5. Strip known prefixes (p/, u/, user/, profile/)
    if (cleaned.startsWith('p/')) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('u/')) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('user/')) cleaned = cleaned.slice(5);
    else if (cleaned.startsWith('profile/')) cleaned = cleaned.slice(8);

    // 6. Strip all leading '@' characters
    cleaned = cleaned.replace(/^@+/, '');

    // 7. Strip any remaining trailing slashes
    cleaned = cleaned.replace(/\/+$/, '').trim();

    return cleaned || null;
  } catch (err) {
    console.warn('Error extracting username from path:', err);
    return null;
  }
}
