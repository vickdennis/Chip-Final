/**
 * Advanced Head Metadata & Schema.org JSON-LD Engine for CHIP NG
 * Serves rich semantic Schema.org JSON-LD and meta tags to web crawlers and AI search engines,
 * while preserving a pristine <div id="root"></div> for the client-side React Makro screens.
 */

import { BUY_CARD_SCHEMA_JSON_LD, BUY_CARD_META } from './buyCardSeo';

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
      '@id': 'https://www.chipng.com/#localbusiness',
      name: 'CHIP NG',
      alternateName: 'CHIP Nigeria',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      logo: 'https://www.chipng.com/chipng_exact_tile.png',
      url: 'https://www.chipng.com',
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
      },
      sameAs: [
        'https://www.tiktok.com/@chipng_nfc',
        'https://www.instagram.com/chipng_nfc',
        'https://x.com/chipng_nfc'
      ],
      description: 'CHIP NG provides contactless smart NFC business cards and dynamic link-in-bio profiles engineered in Lagos, Nigeria.'
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.chipng.com/#software',
      name: 'CHIP NG Dynamic Profile & Link-in-Bio Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (Web, iOS, Android)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN'
      },
      description: 'Dynamic contactless profile and link-in-bio engine with instant vCard phonebook sync, lead capture, and analytics.'
    }
  ]
});

export const PRICING_SCHEMA_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'PriceSpecification',
  name: 'CHIP NG Official NFC Hardware Pricing 2026',
  priceCurrency: 'NGN',
  description: 'Official 2026 hardware prices: NFC Smart Black/White PVC Card: ₦30,000 / ₦35,000; NFC Smart Metal Card: ₦50,000; Metal Debit Card + Custom Design: ₦80,000–₦100,000. Free lifetime cloud profile hosting.'
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
        text: 'NFC operates at 13.56 MHz. CHIP NG embeds genuine certified NTAG216 microchips. When touched to an iPhone or Android phone, the phone reads the contactless signal in sub-10ms and opens your profile with zero app needed.'
      }
    },
    {
      '@type': 'Question',
      name: 'How much does each card tier cost in Nigeria?',
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

// Pre-render HTML screens removed so that only the modern Makro UI displays
export const HOME_PRE_RENDER_HTML = '';
export const PRICING_PRE_RENDER_HTML = '';
export const FAQ_PRE_RENDER_HTML = '';

/**
 * Applies head SSR transformations for crawlers and bots while preserving clean <div id="root"></div>.
 */
export function applySsrForBots(html: string, urlPath: string): string {
  let output = html;

  if (urlPath === '/' || urlPath === '') {
    if (!output.includes('https://www.chipng.com/#localbusiness')) {
      output = output.replace(
        '</head>',
        `  <script type="application/ld+json">\n${HOME_SCHEMA_JSON_LD}\n  </script>\n</head>`
      );
    }
    return output;
  }

  if (urlPath === '/pricing') {
    output = output.replace(
      '</head>',
      `  <script type="application/ld+json">\n${PRICING_SCHEMA_JSON_LD}\n  </script>\n</head>`
    );
    return output;
  }

  if (urlPath === '/faq') {
    output = output.replace(
      '</head>',
      `  <script type="application/ld+json">\n${FAQ_SCHEMA_JSON_LD}\n  </script>\n</head>`
    );
    return output;
  }

  return output;
}
