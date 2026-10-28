import React from 'react';

export interface ProductSchemaProps {
  name?: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
  image?: string;
  sku?: string;
  description?: string;
}

/**
 * Reusable JSON-LD Product Schema component for Next.js 14+ App Router.
 * Injects structured schema markup for the CHIP NG Smart Metal Card
 * optimized for Google Shopping, Perplexity, and ChatGPT search citations.
 */
export default function ProductSchema({
  name = 'NFC Smart Metal Card',
  price = 50000,
  currency = 'NGN',
  inStock = true,
  image = 'https://chipng.com/assets/nfc-metal-card.jpg',
  sku = 'CHIPNG-MET-001',
  description = 'CHIP NG NFC Smart Metal Card engineered with laser-etched stainless steel and an embedded NTAG216 high-frequency microchip (888 bytes memory, sub-10ms transmission). Instant contactless contact and link-in-bio sharing with zero mobile app required.'
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: [image],
    description,
    sku,
    mpn: 'CHIP-NTAG216-MET',
    brand: {
      '@type': 'Brand',
      name: 'CHIP NG',
      url: 'https://chipng.com'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'CHIP NG Technologies Ltd',
      url: 'https://chipng.com'
    },
    model: 'Smart Metal Card (NTAG216)',
    material: 'Stainless Steel / Matte Ceramic Core',
    category: 'Contactless Smart Business Cards',
    offers: {
      '@type': 'Offer',
      url: 'https://chipng.com/nfc-metal-business-card',
      priceCurrency: currency,
      price: price.toString(),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'CHIP NG'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'NGN'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'NG'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd'
          }
        }
      }
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'NFC Microchip',
        value: 'NXP NTAG216'
      },
      {
        '@type': 'PropertyValue',
        name: 'Read Range / Latency',
        value: '< 10ms contactless response'
      },
      {
        '@type': 'PropertyValue',
        name: 'Software Requirement',
        value: 'Zero app required; works with native iOS and Android'
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
