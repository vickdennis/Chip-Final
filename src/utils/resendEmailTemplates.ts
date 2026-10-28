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
