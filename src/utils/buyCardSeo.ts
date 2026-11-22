/**
 * SEO Engine for CHIPNG Buy Card / Checkout Route (/buy-card & /shop)
 * Generates rich <head> metadata, OpenGraph product tags, and Schema.org JSON-LD
 * including Product (with aggregateRating, review, and offerCount), BreadcrumbList,
 * and the complete 12-question FAQPage schema synced with BUY_CARD_FAQS.
 */

import {
  CHIPNG_PRODUCT_IMAGES,
  CHIPNG_PRODUCT_AGGREGATE_RATING,
  CHIPNG_PRODUCT_REVIEWS,
  buildChipngAggregateOffers,
} from './productSchemaData.js';
import { BUY_CARD_FAQS } from '../data/buyCardCatalog.js';

export const BUY_CARD_META = {
  title: 'CHIPNG NFC Business Cards | Custom Smart Business Cards in Nigeria',
  description:
    'Order custom CHIPNG NFC smart business cards in Nigeria. Works on every iPhone & Android in 1 second—no app needed. White PVC ₦30,000, Matte Black Raised UV PVC ₦35,000, Laser-Engraved Metal from ₦50,000. 24–48h Lagos delivery, nationwide DHL/GIG & 12-month free chip replacement warranty.',
  canonical: 'https://www.chipng.com/buy-card',
  image: 'https://www.chipng.com/chipng_3d_logo.jpg',
};

export const BUY_CARD_SCHEMA_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': 'https://www.chipng.com/buy-card#product',
      name: 'CHIPNG Custom NFC Smart Business Card',
      image: CHIPNG_PRODUCT_IMAGES,
      description:
        'Custom NFC smart business cards crafted in Lagos, Nigeria by CHIPNG. Works on every iPhone & Android in 1 second with built-in QR backup—no app needed. Standard White PVC (₦30,000), Premium Matte Black Raised UV PVC (₦35,000), Scratch-Proof Laser-Engraved Metal (₦50,000–₦100,000), and Corporate Team Pack (₦300,000). Includes WhatsApp softcopy proof approval, 24–48h Lagos delivery, nationwide DHL/GIG shipping, and 12-month free NFC chip replacement guarantee.',
      brand: {
        '@type': 'Brand',
        name: 'CHIPNG',
      },
      sku: 'CHIP-NFC-NG-01',
      mpn: 'NTAG216-NG',
      category: 'Smart Business Cards',
      aggregateRating: CHIPNG_PRODUCT_AGGREGATE_RATING,
      review: CHIPNG_PRODUCT_REVIEWS,
      offers: buildChipngAggregateOffers('https://www.chipng.com/buy-card'),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.chipng.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Buy NFC Business Card',
          item: 'https://www.chipng.com/buy-card',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: BUY_CARD_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
});

export const BUY_CARD_PRE_RENDER_HTML = '';

/**
 * Transforms an HTML document string to inject full SEO metadata, Schema.org JSON-LD,
 * and OpenGraph tags, while preserving a pristine <div id="root"></div> for React.
 */
export function applyBuyCardSeo(html: string): string {
  let output = html;

  output = output.replace(/<title>.*?<\/title>/i, `<title>${BUY_CARD_META.title}</title>`);
  output = output.replace(/<meta\s+name=["']title["'][^>]*\/?>/gi, `<meta name="title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta\s+property=["']og:title["'][^>]*\/?>/gi, `<meta property="og:title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta\s+name=["']twitter:title["'][^>]*\/?>/gi, `<meta name="twitter:title" content="${BUY_CARD_META.title}" />`);

  output = output.replace(/<meta\s+name=["']description["'][^>]*\/?>/gi, `<meta name="description" content="${BUY_CARD_META.description}" />`);
  output = output.replace(/<meta\s+property=["']og:description["'][^>]*\/?>/gi, `<meta property="og:description" content="${BUY_CARD_META.description}" />`);
  output = output.replace(/<meta\s+name=["']twitter:description["'][^>]*\/?>/gi, `<meta name="twitter:description" content="${BUY_CARD_META.description}" />`);

  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, `<link rel="canonical" href="${BUY_CARD_META.canonical}" />`);
  } else {
    output = output.replace('</head>', `  <link rel="canonical" href="${BUY_CARD_META.canonical}" />\n</head>`);
  }

  const ogProductTags = `
    <!-- E-Commerce Product OpenGraph & Price Signals -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${BUY_CARD_META.canonical}" />
    <meta property="product:price:amount" content="30000" />
    <meta property="product:price:currency" content="NGN" />
    <meta property="product:availability" content="in stock" />
    <meta property="product:condition" content="new" />
    <!-- Structured Data (E-Commerce Product, Breadcrumb & 12-Question FAQ Schema) -->
    <script type="application/ld+json">
${BUY_CARD_SCHEMA_JSON_LD}
    </script>
  `;

  output = output.replace('</head>', `${ogProductTags}\n</head>`);
  return output;
}
