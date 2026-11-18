/**
 * SEO Engine for CHIP NG Buy Card / Checkout Route (/buy-card & /shop)
 * Generates rich <head> metadata, OpenGraph product tags, and Schema.org JSON-LD.
 * Clean <div id="root"></div> is preserved for the React application.
 */

import {
  CHIPNG_PRODUCT_IMAGES,
  CHIPNG_PRODUCT_AGGREGATE_RATING,
  CHIPNG_PRODUCT_REVIEWS,
  buildChipngAggregateOffers,
} from './productSchemaData';

export const BUY_CARD_META = {
  title: 'Buy Contactless NFC Smart Business Cards in Nigeria | CHIP NG',
  description: 'Order official CHIP NG contactless NFC smart business cards. Sub-10ms response, zero app needed. NFC Smart Black/White PVC (₦30,000 / ₦35,000), NFC Smart Metal Card (₦50,000), Metal Debit Card + Custom Design (₦80,000–₦100,000). 24h Lagos & nationwide delivery.',
  canonical: 'https://www.chipng.com/buy-card',
  image: 'https://www.chipng.com/chipng_3d_logo.jpg'
};

export const BUY_CARD_SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": "https://www.chipng.com/buy-card#product",
      "name": "CHIP NG Contactless Smart NFC Business Card",
      "image": CHIPNG_PRODUCT_IMAGES,
      "description": "Nigeria's premier contactless smart business card and dynamic profile platform. Built with embedded NTAG216 chip, sub-10ms response, and zero app needed. Available in NFC Smart Black/White PVC Card (₦30,000 / ₦35,000), NFC Smart Metal Card (₦50,000), and Metal Debit Card + Custom Design (₦80,000 - ₦100,000).",
      "brand": {
        "@type": "Brand",
        "name": "CHIP NG"
      },
      "sku": "CHIP-NFC-NG-01",
      "mpn": "NTAG216-NG",
      "category": "Smart Business Cards",
      "aggregateRating": CHIPNG_PRODUCT_AGGREGATE_RATING,
      "review": CHIPNG_PRODUCT_REVIEWS,
      "offers": buildChipngAggregateOffers("https://www.chipng.com/buy-card")
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.chipng.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Buy Smart NFC Card",
          "item": "https://www.chipng.com/buy-card"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does the person receiving my card need an app?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No app is required! When you tap your CHIP card against an iPhone or Android phone, their browser opens your profile instantly in 0.2 seconds. From there, they can click 'Save Contact' to directly download your vCard into their phone contacts."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between Smart PVC and Metal cards?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Smart PVC card (₦30,000) is a lightweight 5g polymer daily driver with full-color UV printing. The NFC Smart Metal card (₦50,000) is made from 24g solid 304 stainless steel with fiber-laser etching, offering 5x heavier metallic hand-feel and distinct acoustic clink. The Custom Heavy Metal edition (₦100,000) features ultra-dense 28g aerospace alloy with deep CNC dual-sided fiber engraving, 24K gold mirror finish, and lifetime warranty."
          }
        },
        {
          "@type": "Question",
          "name": "How fast is delivery in Lagos and nationwide in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cards are crafted in our Lagos workshop. Lagos orders are dispatched within 24–48 hours via direct courier. Nationwide orders to Abuja, Port Harcourt, Ibadan, and all 36 Nigerian states are delivered in 2–4 business days via DHL and GIG Logistics."
          }
        }
      ]
    }
  ]
});

export const BUY_CARD_PRE_RENDER_HTML = '';

/**
 * Transforms an HTML document string to inject full SEO metadata, Schema.org JSON-LD,
 * and OpenGraph tags, while preserving a pristine <div id="root"></div> for React.
 */
export function applyBuyCardSeo(html: string): string {
  let output = html;

  // 1. Replace Title
  output = output.replace(/<title>.*?<\/title>/i, `<title>${BUY_CARD_META.title}</title>`);
  output = output.replace(/<meta\s+name=["']title["'][^>]*\/?>/gi, `<meta name="title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta\s+property=["']og:title["'][^>]*\/?>/gi, `<meta property="og:title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta\s+name=["']twitter:title["'][^>]*\/?>/gi, `<meta name="twitter:title" content="${BUY_CARD_META.title}" />`);

  // 2. Replace Description
  output = output.replace(/<meta\s+name=["']description["'][^>]*\/?>/gi, `<meta name="description" content="${BUY_CARD_META.description}" />`);
  output = output.replace(/<meta\s+property=["']og:description["'][^>]*\/?>/gi, `<meta property="og:description" content="${BUY_CARD_META.description}" />`);
  output = output.replace(/<meta\s+name=["']twitter:description["'][^>]*\/?>/gi, `<meta name="twitter:description" content="${BUY_CARD_META.description}" />`);

  // 3. Canonical URL
  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, `<link rel="canonical" href="${BUY_CARD_META.canonical}" />`);
  } else {
    output = output.replace('</head>', `  <link rel="canonical" href="${BUY_CARD_META.canonical}" />\n</head>`);
  }

  // 4. OpenGraph Product & Pricing meta tags
  const ogProductTags = `
    <!-- E-Commerce Product OpenGraph & Price Signals -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${BUY_CARD_META.canonical}" />
    <meta property="product:price:amount" content="30000" />
    <meta property="product:price:currency" content="NGN" />
    <meta property="product:availability" content="in stock" />
    <meta property="product:condition" content="new" />
    <!-- Structured Data (E-Commerce Product & FAQ Schema) -->
    <script type="application/ld+json">
${BUY_CARD_SCHEMA_JSON_LD}
    </script>
  `;

  output = output.replace('</head>', `${ogProductTags}\n</head>`);

  return output;
}
