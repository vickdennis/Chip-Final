/**
 * Executive-Grade Responsive HTML Email Template for CHIPNG Bulk Email Outreach (Resend)
 */
export function formatResendHtmlEmail(
  bodyText: string, 
  cardUrl: string = 'https://chipng.com',
  brandAccent: string = '#16a34a'
): string {
  // Convert line breaks and paragraph breaks into clean HTML
  const sanitized = bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const paragraphs = sanitized
    .split(/\n\s*\n/)
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
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 36px; background-color: #0b0f17; border-bottom: 3px solid ${brandAccent};">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      CHIP<span style="color: ${brandAccent};">NG</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px; color: #94a3b8; margin-top: 4px; font-weight: 600;">
                      Contactless Smart NFC Cards & Link-in-Bio
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(22, 163, 74, 0.15); border: 1px solid rgba(22, 163, 74, 0.35); border-radius: 9999px; font-size: 10px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 1px;">
                      Executive Update
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              ${paragraphs}

              <!-- Interactive Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                <tr>
                  <td align="center">
                    <a href="${cardUrl}" target="_blank" style="display: inline-block; background-color: ${brandAccent}; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35); letter-spacing: 0.2px;">
                      View Live Digital Profile & Demo →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary Benefit Strip -->
          <tr>
            <td style="padding: 18px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 12px; color: #475569; font-weight: 600;">
                    🌿 Eco-Friendly Zero Paper • Sub-10ms contactless NFC tap • Zero app required for recipients
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #ffffff; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748b;">
                CHIPNG Technologies • Lagos, Nigeria
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                You are receiving this personalized invitation as an executive or registered member of CHIPNG.<br/>
                Visit us online at <a href="https://chipng.com" style="color: ${brandAccent}; text-decoration: none; font-weight: 600;">chipng.com</a>
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
 * Standard CHIPNG Support HTML Email Wrapper for Admin Email Center
 * Matches requirements:
 * - Sender: CHIPNG Support <support@chipng.com>
 * - Footer: CHIPNG, https://chipng.com, Support: support@chipng.com
 * - Responsive, mobile-friendly table layout for Gmail, Outlook, Apple Mail
 */
export function wrapChipngSupportEmail(
  content: string,
  subjectTitle?: string
): string {
  // If already full document, return
  if (content.includes('<html') && content.includes('<body')) {
    return content;
  }

  // Format content: if no html tags, convert linebreaks to paragraphs
  let formattedBody = content;
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (!hasHtml) {
    const sanitized = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    formattedBody = sanitized
      .split(/\n\s*\n/)
      .map(p => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #1e293b;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectTitle || 'CHIPNG Support'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 26px 32px; background-color: #0b0f17; border-bottom: 3px solid #16a34a;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      CHIP<span style="color: #16a34a;">NG</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.6px; color: #94a3b8; margin-top: 3px; font-weight: 600;">
                      Contactless Smart NFC Cards & Link-in-Bio
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(22, 163, 74, 0.15); border: 1px solid rgba(22, 163, 74, 0.35); border-radius: 9999px; font-size: 10px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 1px;">
                      Official Support
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

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
                <a href="https://chipng.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">https://chipng.com</a>
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
