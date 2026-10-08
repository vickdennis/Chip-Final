/**
 * Advanced SSR & Bot Pre-Rendering Engine for CHIP NG
 * Serves fully pre-rendered semantic HTML, Schema.org JSON-LD, and metadata to
 * AI Answer Engines (Perplexity, ChatGPT, Claude) and web crawlers (Googlebot, Bingbot).
 */

import { BUY_CARD_PRE_RENDER_HTML, BUY_CARD_SCHEMA_JSON_LD, BUY_CARD_META } from './buyCardSeo';

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',
  'twitterbot',
  'facebookexternalhit',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  // AI Search & LLM Web Crawlers
  'gptbot',
  'chatgpt-user',
  'perplexitybot',
  'claudebot',
  'anthropic-ai',
  'google-extended',
  'cohere-ai',
  'bytespider',
  'ccbot',
  'diffbot'
];

export function isCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export const HOME_SCHEMA_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://chipng.com/#localbusiness',
      name: 'CHIP NG',
      alternateName: 'CHIP Nigeria',
      image: 'https://chipng.com/chipng_3d_logo.jpg',
      logo: 'https://chipng.com/chipng_exact_tile.png',
      url: 'https://chipng.com',
      telephone: '+2348100764154',
      email: 'hello@chipng.com',
      priceRange: '₦₦',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Lekki Phase 1',
        addressLocality: 'Lagos',
        addressRegion: 'Lagos State',
        postalCode: '105102',
        addressCountry: 'NG'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 6.4474,
        longitude: 3.4831
      }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://chipng.com/#software',
      name: 'CHIP NG Digital Identity Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'iOS, Android, Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN'
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://chipng.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is CHIP NG?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CHIP NG is Nigeria premier contactless smart business card and dynamic link-in-bio platform. Combining physical NTAG216 NFC hardware with a cloud profile engine, CHIP NG lets professionals share contacts, social links, and portfolios in sub-10ms with zero app required.'
          }
        },
        {
          '@type': 'Question',
          name: 'How much does an NFC business card cost in Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'NFC Smart Black/White PVC Card is ₦30,000 (was ₦35,000); NFC Smart Metal Card is ₦50,000; and Metal Debit Card + Custom Design is ₦80,000 to ₦100,000. All cards include free lifetime digital profile hosting.'
          }
        }
      ]
    }
  ]
});

export const PRICING_SCHEMA_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': 'https://chipng.com/pricing#product-pricing',
      name: 'CHIP NG Smart Business Card Range',
      description: 'Official 2026 pricing for CHIP NG contactless smart cards in Nigeria.',
      brand: { '@type': 'Brand', name: 'CHIP NG' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'NGN',
        lowPrice: '30000',
        highPrice: '100000',
        offerCount: '3',
        offers: [
          {
            '@type': 'Offer',
            name: 'NFC Smart Black/White PVC Card',
            price: '30000',
            priceCurrency: 'NGN',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=pvc'
          },
          {
            '@type': 'Offer',
            name: 'NFC Smart Metal Card',
            price: '50000',
            priceCurrency: 'NGN',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=metal'
          },
          {
            '@type': 'Offer',
            name: 'Metal Debit Card + Custom Design',
            price: '80000',
            priceCurrency: 'NGN',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=heavy_metal'
          }
        ]
      }
    }
  ]
});

export const FAQ_SCHEMA_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is NFC and how does CHIP NG work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NFC operates at 13.56 MHz. CHIP NG embeds genuine certified NTAG216 microchips. When touched to an iPhone or Android phone, the phone reads the signal in sub-10ms and opens your profile with zero app needed.'
      }
    },
    {
      '@type': 'Question',
      name: 'How much does CHIP NG cost in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NFC Smart PVC Card: ₦30,000; NFC Smart Metal Card: ₦50,000; Metal Debit Card + Custom Design: ₦80,000–₦100,000. Free lifetime cloud profile hosting included.'
      }
    },
    {
      '@type': 'Question',
      name: 'How fast is delivery in Lagos and nationwide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lagos orders are crafted in our local workshop and delivered within 24 to 48 hours. Nationwide orders arrive in 2 to 4 business days via DHL and GIG Logistics.'
      }
    }
  ]
});

export const HOME_PRE_RENDER_HTML = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #111; max-width: 1100px; margin: 0 auto; padding: 32px 16px;">
    <header style="text-align: center; margin-bottom: 40px;">
      <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4f46e5; background: #eef2ff; padding: 4px 12px; border-radius: 999px;">
        Contactless NFC Hardware • Dynamic Digital Profiles
      </span>
      <h1 style="font-size: 40px; font-weight: 900; line-height: 1.2; margin: 16px 0 12px 0;">
        Your Business Identity. One Tap Away.
      </h1>
      <p style="font-size: 18px; color: #4b5563; max-width: 700px; margin: 0 auto; line-height: 1.6;">
        The premier contactless NFC smart business card and dynamic link-in-bio platform engineered in Lagos for Nigerian entrepreneurs, founders, and dealmakers. Sub-10ms response, zero app needed.
      </p>
    </header>

    <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 48px;">
      <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; background: #ffffff;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280;">Tier 1 • High Volume</span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 8px 0;">NFC Smart PVC Card</h2>
        <div style="font-size: 28px; font-weight: 900; margin-bottom: 12px;">₦30,000 <span style="font-size: 14px; color: #9ca3af; text-decoration: line-through;">₦35,000</span></div>
        <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">Featherlight 5g polymer PVC in Glacier White & Matte Obsidian with full-color UV protective coating and sub-10ms NTAG216 chip.</p>
      </div>

      <div style="border: 2px solid #4f46e5; border-radius: 16px; padding: 24px; background: #0f172a; color: #ffffff;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #a5b4fc;">Tier 2 • Executive Bestseller</span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 8px 0; color: #ffffff;">NFC Smart Metal Card</h2>
        <div style="font-size: 28px; font-weight: 900; margin-bottom: 12px; color: #ffffff;">₦50,000</div>
        <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">Solid 24g 304 stainless steel with precision fiber-laser engraving, radio-frequency ferrite shielding, and distinct acoustic table clink.</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; background: #ffffff;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #d97706;">Tier 3 • Bespoke Luxury</span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 8px 0;">Metal Debit Card + Custom Design</h2>
        <div style="font-size: 28px; font-weight: 900; margin-bottom: 12px;">₦80,000 – ₦100,000</div>
        <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">28g aerospace alloy with functional EMV bank debit transplant, deep CNC dual-sided engraving, and 1-on-1 designer proofing.</p>
      </div>
    </section>

    <section style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 40px;">
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 16px;">Technical Hardware Specifications</h2>
      <ul style="font-size: 14px; line-height: 1.8; color: #374151;">
        <li><strong>NFC Chipset:</strong> Genuine NXP NTAG216 (888 bytes memory, 13.56 MHz, ISO 14443A)</li>
        <li><strong>Response Time:</strong> Sub-10ms contactless read initiation</li>
        <li><strong>Compatibility:</strong> Apple iOS (iPhone 7 to iPhone 16) and all Android NFC smartphones</li>
        <li><strong>Recipient Requirement:</strong> Zero app required (Direct native mobile browser & vCard prompt)</li>
        <li><strong>Cloud Hosting:</strong> CHIP Core Dynamic Cloud Hosting included with unlimited free lifetime updates</li>
      </ul>
    </section>
  </div>
</div>
`;

export const PRICING_PRE_RENDER_HTML = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #111; max-width: 960px; margin: 0 auto; padding: 32px 16px;">
    <header style="text-align: center; margin-bottom: 36px;">
      <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4f46e5;">2026 Transparent Hardware Pricing</span>
      <h1 style="font-size: 36px; font-weight: 900; margin: 12px 0;">NFC Business Card Price in Nigeria</h1>
      <p style="font-size: 16px; color: #4b5563;">One-time hardware investment. Free lifetime dynamic digital profile hosting with ₦0 monthly subscription fees.</p>
    </header>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 36px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <thead>
        <tr style="background: #f3f4f6; text-align: left; border-bottom: 2px solid #e5e7eb;">
          <th style="padding: 12px;">Hardware Edition</th>
          <th style="padding: 12px;">Official Price</th>
          <th style="padding: 12px;">Material & Weight</th>
          <th style="padding: 12px;">Delivery</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: 700;">NFC Smart PVC Card</td>
          <td style="padding: 12px; font-weight: 800; color: #059669;">₦30,000 <span style="font-size: 11px; color: #9ca3af; text-decoration: line-through;">₦35,000</span></td>
          <td style="padding: 12px;">5g Polymer PVC, UV Print</td>
          <td style="padding: 12px;">24–48h Lagos Express</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb; background: #faf5ff;">
          <td style="padding: 12px; font-weight: 700;">NFC Smart Metal Card</td>
          <td style="padding: 12px; font-weight: 800; color: #4f46e5;">₦50,000</td>
          <td style="padding: 12px;">24g Solid 304 Steel, Laser Engraved</td>
          <td style="padding: 12px;">24–48h Lagos Express</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 700;">Metal Debit Card + Custom Design</td>
          <td style="padding: 12px; font-weight: 800; color: #d97706;">₦80,000 – ₦100,000</td>
          <td style="padding: 12px;">28g Aerospace Alloy, EMV Transplant</td>
          <td style="padding: 12px;">VIP Lagos Courier / Nationwide DHL</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`;

export const FAQ_PRE_RENDER_HTML = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #111; max-width: 860px; margin: 0 auto; padding: 32px 16px;">
    <header style="text-align: center; margin-bottom: 36px;">
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 8px;">Frequently Asked Questions</h1>
      <p style="font-size: 16px; color: #4b5563;">Official hardware, pricing, and compatibility answers for CHIP NG.</p>
    </header>

    <div style="display: flex; flex-direction: column; gap: 20px; font-size: 14px; line-height: 1.6;">
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: #fff;">
        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">What is NFC and how does CHIP NG work?</h3>
        <p style="margin: 0; color: #4b5563;">NFC operates at 13.56 MHz. CHIP NG embeds genuine certified NTAG216 microchips. When touched to an iPhone or Android phone, the phone reads the contactless signal in sub-10ms and opens your profile with zero app needed.</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: #fff;">
        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">How much does each card tier cost in Nigeria?</h3>
        <p style="margin: 0; color: #4b5563;">NFC Smart PVC Card: ₦30,000; NFC Smart Metal Card: ₦50,000; Metal Debit Card + Custom Design: ₦80,000–₦100,000. Free lifetime cloud profile hosting is included with zero monthly subscriptions.</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: #fff;">
        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">Does the other person need an app to scan my card?</h3>
        <p style="margin: 0; color: #4b5563;">No app is required! Tapping the card opens the recipient web browser directly and prompts a 1-tap "Save Contact" button that downloads your verified vCard straight into their address book.</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: #fff;">
        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">How fast is delivery in Lagos and nationwide?</h3>
        <p style="margin: 0; color: #4b5563;">Lagos orders are crafted in our local workshop and delivered within 24 to 48 hours. Nationwide deliveries to Abuja, Port Harcourt, and all 36 states arrive in 2 to 4 business days via DHL and GIG Logistics.</p>
      </div>
    </div>
  </div>
</div>
`;

/**
 * Applies SSR transformation for crawlers and bots based on the requested URL.
 */
export function applySsrForBots(html: string, urlPath: string, userAgent?: string): string {
  let output = html;

  if (urlPath === '/buy-card' || urlPath === '/shop') {
    return BUY_CARD_PRE_RENDER_HTML ? output.replace(/<div id="root"><\/div>/i, BUY_CARD_PRE_RENDER_HTML) : output;
  }

  if (urlPath === '/' || urlPath === '') {
    // Inject Home Schema if not present
    if (!output.includes('https://chipng.com/#software')) {
      output = output.replace(
        '</head>',
        `  <script type="application/ld+json">\n${HOME_SCHEMA_JSON_LD}\n  </script>\n</head>`
      );
    }
    output = output.replace(/<div id="root"><\/div>/i, HOME_PRE_RENDER_HTML);
    return output;
  }

  if (urlPath === '/pricing') {
    output = output.replace(
      '</head>',
      `  <script type="application/ld+json">\n${PRICING_SCHEMA_JSON_LD}\n  </script>\n</head>`
    );
    output = output.replace(/<div id="root"><\/div>/i, PRICING_PRE_RENDER_HTML);
    return output;
  }

  if (urlPath === '/faq') {
    output = output.replace(
      '</head>',
      `  <script type="application/ld+json">\n${FAQ_SCHEMA_JSON_LD}\n  </script>\n</head>`
    );
    output = output.replace(/<div id="root"><\/div>/i, FAQ_PRE_RENDER_HTML);
    return output;
  }

  return output;
}
