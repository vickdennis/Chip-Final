import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '../components/seo/JsonLd';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { AeoAnswerBox } from '../components/seo/AeoAnswerBox';

export const metadata: Metadata = {
  title: 'NFC Business Card Price in Nigeria — 2026 Transparent Pricing | CHIP NG',
  description:
    'Compare official NFC smart business card prices in Nigeria. Smart PVC (₦30,000 / ₦35,000), Smart Metal (₦50,000), and Metal Debit Card + Custom Design (₦80,000–₦100,000). Zero monthly hosting fees.',
  alternates: {
    canonical: 'https://chipng.com/pricing'
  },
  openGraph: {
    title: 'NFC Business Card Price in Nigeria — Official 2026 Pricing | CHIP NG',
    description:
      'Transparent pricing breakdown for CHIP NG smart contactless business cards. PVC from ₦30,000, solid stainless steel from ₦50,000. Free lifetime digital profile hosting.',
    url: 'https://chipng.com/pricing',
    type: 'website'
  }
};

const pricingSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': 'https://chipng.com/pricing#product-pricing',
      name: 'CHIP NG Smart Business Card Range',
      description:
        'Official 2026 price lineup for CHIP NG contactless smart cards in Nigeria. Three hardware tiers with zero monthly subscription fees.',
      brand: {
        '@type': 'Brand',
        name: 'CHIP NG'
      },
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
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://chipng.com/pricing#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are there monthly subscription fees for using CHIP NG?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. When you purchase any physical CHIP NG card (starting from ₦30,000), you receive lifetime dynamic cloud profile hosting at zero monthly subscription cost. You can update your links, social media, contact info, and portfolio unlimited times for free.'
          }
        },
        {
          '@type': 'Question',
          name: 'What payment methods are accepted for CHIP NG in Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CHIP NG accepts all major Nigerian payment methods via Paystack: Debit/Credit cards (Mastercard, Visa, Verve), Direct Bank Transfer, USSD, and Apple Pay for international clients. Same-day cash on delivery is also available for select Lagos courier drop-offs.'
          }
        }
      ]
    }
  ]
};

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={pricingSchema} id="schema-pricing" />
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pricing Guide', url: '/pricing' }
        ]}
      />

      <header className="text-center my-10">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
          2026 Transparent Hardware Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-4">
          NFC Smart Business Card Price in Nigeria
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          One-time hardware investment. Lifetime dynamic digital profile hosting with ₦0 monthly subscription fees.
        </p>
      </header>

      <AeoAnswerBox
        question="How much does a smart NFC card cost in Lagos and Nigeria?"
        directAnswer="In Nigeria, authentic CHIP NG contactless smart cards cost ₦30,000 for the Smart PVC Card (regular ₦35,000), ₦50,000 for the 304 Stainless Steel Smart Metal Card, and ₦80,000 to ₦100,000 for the Metal Debit Card + Custom Design edition. All cards include sub-10ms response, free lifetime digital profile hosting, and nationwide dispatch."
        keyFacts={[
          'Smart PVC Card: ₦30,000 (Black or White, UV Coated)',
          'NFC Smart Metal Card: ₦50,000 (Solid 304 Steel, 24g)',
          'Metal Debit Card + Custom Design: ₦80,000 – ₦100,000 (EMV Transplant, 28g)',
          'Hosting fee: ₦0 / Month (Free Lifetime Cloud Sync)',
          'Lagos Delivery: 24–48 Hours (Direct Dispatch Rider)'
        ]}
      />

      {/* Pricing Comparison Table */}
      <section className="my-12 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300 border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-slate-900 text-white border-b border-white/10">
            <tr>
              <th className="py-4 px-4 font-bold">Hardware Edition</th>
              <th className="py-4 px-4 font-bold">Price (NGN)</th>
              <th className="py-4 px-4 font-bold">Build & Weight</th>
              <th className="py-4 px-4 font-bold">Best For</th>
              <th className="py-4 px-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-slate-950/60">
            <tr>
              <td className="py-4 px-4 font-semibold text-white">
                NFC Smart PVC Card
                <span className="block text-xs text-slate-400 font-normal">Black or White Polymer</span>
              </td>
              <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-base">
                ₦30,000
                <span className="block text-xs text-slate-500 line-through">₦35,000</span>
              </td>
              <td className="py-4 px-4 text-xs">5g Durable Polymer, UV Print</td>
              <td className="py-4 px-4 text-xs">High-volume sales teams, startups, creators</td>
              <td className="py-4 px-4">
                <a
                  href="/buy-card?tier=pvc"
                  className="inline-block px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                >
                  Order
                </a>
              </td>
            </tr>
            <tr className="bg-indigo-950/20">
              <td className="py-4 px-4 font-semibold text-white">
                NFC Smart Metal Card
                <span className="block text-xs text-indigo-400 font-normal">Solid 304 Stainless Steel</span>
              </td>
              <td className="py-4 px-4 font-mono font-bold text-white text-base">₦50,000</td>
              <td className="py-4 px-4 text-xs">24g Solid Steel, Laser Engraved</td>
              <td className="py-4 px-4 text-xs">Founders, executives, luxury realtors</td>
              <td className="py-4 px-4">
                <a
                  href="/buy-card?tier=metal"
                  className="inline-block px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                >
                  Order
                </a>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-semibold text-white">
                Metal Debit Card + Custom Design
                <span className="block text-xs text-amber-400 font-normal">Functional EMV Transplant</span>
              </td>
              <td className="py-4 px-4 font-mono font-bold text-amber-300 text-base">₦80,000 – ₦100,000</td>
              <td className="py-4 px-4 text-xs">28g Aerospace Alloy, 24K Gold / Black</td>
              <td className="py-4 px-4 text-xs">C-Suite leaders, bespoke luxury collectors</td>
              <td className="py-4 px-4">
                <a
                  href="/buy-card?tier=heavy_metal"
                  className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
                >
                  Order
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
