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
      name: 'Amara Nwosu',
    },
    datePublished: '2026-02-14',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody:
      'I swapped out my box of paper business cards for the CHIPNG Matte Obsidian NFC Card. In our first tech conference in Lagos, I closed 8 enterprise contracts from executives who tapped my card and saved my vCard directly to their contacts.',
  },
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'David Adebayo',
    },
    datePublished: '2026-03-02',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody:
      'My CHIPNG link-in-bio page converts 4x higher than standard link hubs. Clients love that they can tap my physical card or click my bio to save my vCard and book a paid strategy session in under 15 seconds.',
  },
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Elena Rostova',
    },
    datePublished: '2026-03-19',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody:
      'Every executive meeting I attend starts with an NFC tap. The physical weight of the metal card immediately sparks conversation. They touch their phone to the card and my entire portfolio appears instantly.',
  },
];

export const buildChipngAggregateOffers = (baseUrl = 'https://www.chipng.com/buy-card') => ({
  '@type': 'AggregateOffer',
  priceCurrency: 'NGN',
  lowPrice: '30000',
  highPrice: '100000',
  offerCount: 4,
  offers: [
    {
      '@type': 'Offer',
      name: 'NFC Smart White PVC Card (Custom Print)',
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
      name: 'NFC Smart Black PVC Card (Custom UV Print)',
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
      name: 'NFC Smart Metal Card',
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
      name: 'Metal Debit Card + Custom Design',
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
  ],
});
