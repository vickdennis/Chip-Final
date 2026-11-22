export const CHIPNG_PRODUCT_IMAGES = [
  'https://www.chipng.com/chipng_3d_logo.jpg',
  'https://www.chipng.com/chipng_exact_tile.png',
];

export const CHIPNG_PRODUCT_AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: 4.9,
  reviewCount: 47,
  bestRating: 5,
  worstRating: 1,
};

export const CHIPNG_PRODUCT_REVIEWS = [
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Tony Zola',
    },
    datePublished: '2026-09-01',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody:
      'Excellent work on the metal card. The finishing is clean, the card feels strong and premium, and the overall quality is impressive. It looks much more luxurious than a regular plastic ATM card. The customization and attention to detail are also top-notch. Highly recommended for anyone looking for a durable and stylish metal card.',
  },
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Samirah Ade-Adebiyi',
    },
    datePublished: '2026-08-07',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody:
      'Our team ordered custom branded CHIPNG NFC cards and received clean softcopy design proofs on WhatsApp to approve before printing. The layout, QR placement, and card finish came out crisp for our leadership team.',
  },
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Star Capital Lagos',
    },
    datePublished: '2026-08-22',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody:
      'Fast Lagos dispatch with live courier tracking right to our office door. The card taps cleanly on both iPhone and Android in one second without asking clients to download any app.',
  },
];

export const buildChipngAggregateOffers = (baseUrl = 'https://www.chipng.com/buy-card') => ({
  '@type': 'AggregateOffer',
  priceCurrency: 'NGN',
  lowPrice: '30000',
  highPrice: '300000',
  offerCount: 5,
  offers: [
    {
      '@type': 'Offer',
      name: 'Standard White PVC NFC Card (Custom Full-Color Print)',
      sku: 'CHIP-PVC-WHITE-30K',
      price: '30000',
      priceCurrency: 'NGN',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: baseUrl,
      seller: {
        '@type': 'Organization',
        name: 'CHIP NG Technologies Ltd',
      },
    },
    {
      '@type': 'Offer',
      name: 'Premium Matte Black PVC Card (Raised Anti-Scratch UV Print)',
      sku: 'CHIP-PVC-BLACK-35K',
      price: '35000',
      priceCurrency: 'NGN',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: baseUrl,
      seller: {
        '@type': 'Organization',
        name: 'CHIP NG Technologies Ltd',
      },
    },
    {
      '@type': 'Offer',
      name: 'Executive Metal NFC Card (Scratch-Proof Laser Engraved)',
      sku: 'CHIP-METAL-50K',
      price: '50000',
      priceCurrency: 'NGN',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: baseUrl,
      seller: {
        '@type': 'Organization',
        name: 'CHIP NG Technologies Ltd',
      },
    },
    {
      '@type': 'Offer',
      name: 'Custom Metal Card (Bespoke Design & Flagship NFC)',
      sku: 'CHIP-DEBIT-CUSTOM-100K',
      price: '80000',
      priceCurrency: 'NGN',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: baseUrl,
      seller: {
        '@type': 'Organization',
        name: 'CHIP NG Technologies Ltd',
      },
    },
    {
      '@type': 'Offer',
      name: 'Corporate Team Pack (10 PVC + 1 CEO Metal Card)',
      sku: 'CHIP-CORP-PACK-300K',
      price: '300000',
      priceCurrency: 'NGN',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: baseUrl,
      seller: {
        '@type': 'Organization',
        name: 'CHIP NG Technologies Ltd',
      },
    },
  ],
});
