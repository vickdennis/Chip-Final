/**
 * Official hosted CHIPNG brand logo emblem (3D microchip + CHIPNG squircle)
 * used across all transactional, support, order, and bulk outreach emails.
 */
export const CHIPNG_EMAIL_LOGO_URL = 'https://www.chipng.com/chipng_exact_tile.png';

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url: string, fallback: string, allowRelativePath: boolean = false): string {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return fallback;
  if (allowRelativePath && /^\/[a-zA-Z0-9._/-]+$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Fallback to safe canonical URL
  }
  return fallback;
}

function sanitizeHexColor(color: string, fallback: string = '#16a34a'): string {
  const trimmed = String(color ?? '').trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(trimmed) ? trimmed : fallback;
}

/**
 * Shared table-based email header featuring the actual CHIPNG brand logo emblem,
 * compatible with Gmail (iOS/Android/Web), Apple Mail, and Outlook.
 */
export function buildChipngEmailHeaderHtml(
  badgeLabel: string = 'Official Support',
  brandAccent: string = '#16a34a',
  logoUrl: string = CHIPNG_EMAIL_LOGO_URL
): string {
  const safeAccent = sanitizeHexColor(brandAccent, '#16a34a');
  const safeLogoUrl = sanitizeUrl(logoUrl, CHIPNG_EMAIL_LOGO_URL, true);
  const safeBadge = escapeHtml(badgeLabel);

  return `          <!-- Header Banner -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b0f17; border-bottom: 3px solid ${safeAccent};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle" style="padding-right: 12px;">
                    <a href="https://www.chipng.com" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${escapeHtml(safeLogoUrl)}"
                        alt="CHIPNG"
                        width="64"
                        height="64"
                        style="display: block; width: 64px; height: 64px; border-radius: 14px; border: 0; outline: none; text-decoration: none;"
                      />
                    </a>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.6px; color: #94a3b8; margin-top: 10px; font-weight: 600; line-height: 1.4;">
                      Contactless Smart NFC Cards &amp; Link-in-Bio
                    </div>
                  </td>
                  <td align="right" valign="middle" style="white-space: nowrap;">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(22, 163, 74, 0.15); border: 1px solid rgba(22, 163, 74, 0.4); border-radius: 9999px; font-size: 10px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; text-align: center;">
                      ${safeBadge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/**
 * Executive-Grade Responsive HTML Email Template for CHIPNG Bulk Email Outreach (Resend)
 */
export function formatResendHtmlEmail(
  bodyText: string,
  cardUrl: string = 'https://www.chipng.com',
  brandAccent: string = '#16a34a',
  logoUrl: string = CHIPNG_EMAIL_LOGO_URL
): string {
  const safeAccent = sanitizeHexColor(brandAccent, '#16a34a');
  const safeCardUrl = sanitizeUrl(cardUrl, 'https://www.chipng.com', false);

  // Convert line breaks and paragraph breaks into clean HTML
  const sanitized = escapeHtml(bodyText || '');

  const paragraphs = sanitized
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0)
    .map(p => {
      const lineFormatted = p.replace(/\n/g, '<br/>');
      return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #1e293b;">${lineFormatted}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CHIPNG</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
${buildChipngEmailHeaderHtml('Executive Update', safeAccent, logoUrl)}

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              ${paragraphs}

              <!-- Interactive Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(safeCardUrl)}" target="_blank" style="display: inline-block; background-color: ${safeAccent}; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35); letter-spacing: 0.2px;">
                      View Live Digital Profile &amp; Demo &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary Benefit Strip -->
          <tr>
            <td style="padding: 18px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 12px; color: #475569; font-weight: 600;">
                    Eco-Friendly Zero Paper &bull; Sub-10ms contactless NFC tap &bull; Zero app required for recipients
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #ffffff; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748b;">
                CHIPNG Technologies &bull; Lagos, Nigeria
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                You are receiving this personalized message from CHIPNG.<br/>
                Visit us online at <a href="https://www.chipng.com" style="color: ${safeAccent}; text-decoration: none; font-weight: 600;">chipng.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Standard CHIPNG Support HTML Email Wrapper for Admin Email Center & Order Receipts
 * Matches requirements:
 * - Sender: CHIPNG Support <support@chipng.com>
 * - Actual CHIPNG brand logo in the dark executive header banner
 * - Footer: CHIPNG, https://chipng.com, Support: support@chipng.com
 * - Responsive, mobile-friendly table layout for Gmail, Outlook, Apple Mail
 */
export function wrapChipngSupportEmail(
  content: string,
  subjectTitle?: string,
  logoUrl: string = CHIPNG_EMAIL_LOGO_URL
): string {
  // If already full document, return
  if (content.includes('<html') && content.includes('<body')) {
    return content;
  }

  // Format content: if no html tags, convert linebreaks to paragraphs
  let formattedBody = content;
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (!hasHtml) {
    const sanitized = escapeHtml(content);
    formattedBody = sanitized
      .split(/\n\s*\n/)
      .map(p => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #1e293b;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  const safeTitle = escapeHtml(subjectTitle || 'CHIPNG Support');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
${buildChipngEmailHeaderHtml('Official Support', '#16a34a', logoUrl)}

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 34px 32px 28px 32px; font-size: 15px; line-height: 1.65; color: #1e293b;">
              ${formattedBody}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                CHIPNG
              </p>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569;">
                <a href="https://www.chipng.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">https://chipng.com</a>
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #475569;">
                Support: <a href="mailto:support@chipng.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@chipng.com</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.4;">
                This email was sent by an authorized administrator from CHIPNG Support using our verified transactional delivery infrastructure.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
