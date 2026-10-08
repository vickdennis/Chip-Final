import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '../components/seo/JsonLd';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { AeoAnswerBox } from '../components/seo/AeoAnswerBox';

export const metadata: Metadata = {
  title: 'Buy Contactless NFC Smart Business Cards in Nigeria | CHIP NG',
  description:
    'Order official CHIP NG contactless NFC smart cards. Sub-10ms response, zero app needed. Smart PVC (₦30,000–₦35,000), Smart Metal (₦50,000), and Metal Debit Card + Custom Design (₦80,000–₦100,000). Express 24h Lagos delivery.',
  alternates: {
    canonical: 'https://chipng.com/buy-card'
  },
  openGraph: {
    title: 'Buy Contactless NFC Smart Business Cards in Nigeria | CHIP NG',
    description:
      'Official CHIP NG hardware shop. 1-tap contact exchange, sub-10ms response, zero app required. Smart PVC, Smart Metal, and Metal Debit Card options.',
    url: 'https://chipng.com/buy-card',
    type: 'website'
  }
};

const buyCardSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': 'https://chipng.com/buy-card#product',
      name: 'CHIP NG Contactless Smart NFC Business Card',
      image: [
        'https://chipng.com/chipng_3d_logo.jpg',
        'https://chipng.com/chipng_exact_tile.png'
      ],
      description:
        'Nigeria premier contactless smart business card and dynamic profile platform. Built with embedded NTAG216 chip, sub-10ms response, zero app needed. Available in Smart PVC (₦30,000 / ₦35,000), Smart Metal (₦50,000), and Metal Debit Card + Custom Design (₦80,000 - ₦100,000).',
      brand: {
        '@type': 'Brand',
        name: 'CHIP NG'
      },
      sku: 'CHIP-NFC-NG-01',
      mpn: 'NTAG216-NG',
      category: 'Smart Business Cards',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'NGN',
        lowPrice: '30000',
        highPrice: '100000',
        offerCount: '4',
        offers: [
          {
            '@type': 'Offer',
            name: 'CHIP NG NFC Smart PVC Card (Glacier White)',
            sku: 'CHIP-PVC-WHITE-30K',
            price: '30000',
            priceCurrency: 'NGN',
            priceValidUntil: '2027-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=pvc',
            seller: {
              '@type': 'Organization',
              name: 'CHIP NG Technologies Ltd'
            }
          },
          {
            '@type': 'Offer',
            name: 'CHIP NG NFC Smart PVC Card (Matte Obsidian Black)',
            sku: 'CHIP-PVC-BLACK-35K',
            price: '35000',
            priceCurrency: 'NGN',
            priceValidUntil: '2027-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=pvc',
            seller: {
              '@type': 'Organization',
              name: 'CHIP NG Technologies Ltd'
            }
          },
          {
            '@type': 'Offer',
            name: 'CHIP NG NFC Smart Metal Card',
            sku: 'CHIP-METAL-50K',
            price: '50000',
            priceCurrency: 'NGN',
            priceValidUntil: '2027-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=metal',
            seller: {
              '@type': 'Organization',
              name: 'CHIP NG Technologies Ltd'
            }
          },
          {
            '@type': 'Offer',
            name: 'CHIP NG Metal Debit Card + Custom Design',
            sku: 'CHIP-DEBIT-CUSTOM-100K',
            price: '80000',
            priceCurrency: 'NGN',
            priceValidUntil: '2027-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
            url: 'https://chipng.com/buy-card?tier=heavy_metal',
            seller: {
              '@type': 'Organization',
              name: 'CHIP NG Technologies Ltd'
            }
          }
        ]
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://chipng.com/buy-card#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much does each CHIP NG card tier cost in Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CHIP NG provides three transparent tiers: 1) NFC Smart Black/White PVC Card: ₦30,000 (standard ₦35,000); 2) NFC Smart Metal Card (24g solid 304 stainless steel): ₦50,000; 3) Metal Debit Card + Custom Design (aerospace alloy with EMV transplant compatibility and concierge proofing): ₦80,000 to ₦100,000.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does the recipient need to install an app to scan my card?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No application is required. Tapping your CHIP NG card against any modern smartphone instantly opens your digital profile in the recipient browser, with a direct button to save your vCard directly into their address book.'
          }
        },
        {
          '@type': 'Question',
          name: 'How fast is delivery in Lagos and other states in Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Lagos orders are crafted in our local workshop and dispatched within 24 to 48 hours via dedicated dispatch riders. Nationwide deliveries to Abuja, Port Harcourt, Ibadan, and all 36 states arrive in 2 to 4 business days via DHL and GIG Logistics.'
          }
        }
      ]
    }
  ]
};

export default function BuyCardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={buyCardSchema} id="schema-buy-card" />
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Hardware Shop', url: '/buy-card' }
        ]}
      />

      <header className="text-center my-10">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
          Official CHIP NG Hardware Shop
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-4">
          Contactless Smart NFC Business Cards in Nigeria
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Order authentic CHIP NG smart contactless hardware. Sub-10ms response, zero app needed, lifetime dynamic profile hosting.
        </p>
      </header>

      {/* AEO Fast Pricing Box */}
      <AeoAnswerBox
        question="How much do CHIP NG smart business cards cost in Nigeria?"
        directAnswer="CHIP NG offers 3 hardware tiers: 1) NFC Smart Black/White PVC Card at ₦30,000 (was ₦35,000); 2) NFC Smart Metal Card at ₦50,000; and 3) Metal Debit Card + Custom Design at ₦80,000 to ₦100,000. All tiers include lifetime digital profile hosting, zero monthly fees, dynamic vCard contact exchange, and a 12-month hardware guarantee."
        keyFacts={[
          'Tier 1: Smart PVC Card (5g polymer, UV print) — ₦30,000 / ₦35,000',
          'Tier 2: Smart Metal Card (24g solid 304 steel) — ₦50,000',
          'Tier 3: Metal Debit Card + Custom Design (28g alloy, EMV transplant) — ₦80,000–₦100,000',
          'Delivery: 24–48h express Lagos; 2–4 days nationwide via DHL/GIGL',
          'Payment: Paystack (Cards, Bank Transfer, USSD) or Cash on Delivery (Lagos)'
        ]}
        citationSource="CHIP NG Official Pricing Table 2026"
      />

      {/* Hardware Tiers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        {/* Tier 1 */}
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
              Starter • 5g PVC
            </span>
            <h2 className="text-2xl font-bold text-white mt-4 mb-1">NFC Smart PVC Card</h2>
            <p className="text-xs text-slate-400 mb-4">Available in Glacier White & Matte Obsidian</p>
            <div className="text-3xl font-extrabold text-white mb-2">
              ₦30,000 <span className="text-xs font-normal text-slate-400 line-through">₦35,000</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Ultra-light polymer PVC card with embedded NTAG216 high-speed chip and full-color UV protective coating.
            </p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li>✓ Sub-10ms Contactless Chip</li>
              <li>✓ Full-Color Edge-to-Edge UV Print</li>
              <li>✓ Dynamic QR Code Backup</li>
              <li>✓ Lifetime Profile Hosting (₦0/mo)</li>
              <li>✓ 12-Month Hardware Guarantee</li>
            </ul>
          </div>
          <a
            href="/buy-card?tier=pvc"
            className="mt-8 block text-center py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
          >
            Order Smart PVC (₦30,000)
          </a>
        </article>

        {/* Tier 2 */}
        <article className="rounded-2xl border border-indigo-500/50 bg-slate-900/90 p-6 flex flex-col justify-between relative shadow-xl shadow-indigo-950/40">
          <div className="absolute -top-3 right-6 bg-indigo-600 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-0.5 rounded-full">
            Recommended
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
              Executive • 24g Steel
            </span>
            <h2 className="text-2xl font-bold text-white mt-4 mb-1">NFC Smart Metal Card</h2>
            <p className="text-xs text-slate-400 mb-4">Brushed Space Gray & Matte Obsidian</p>
            <div className="text-3xl font-extrabold text-white mb-2">
              ₦50,000 <span className="text-xs font-normal text-slate-400">Fixed</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Milled from solid 304 stainless steel with fiber-laser precision engraving. 5x heavier than plastic with acoustic table clink.
            </p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li>✓ 24g Solid 304 Stainless Steel</li>
              <li>✓ Permanent Fiber-Laser Engraving</li>
              <li>✓ Radio-Frequency Ferrite Shielding</li>
              <li>✓ Unmistakable Metallic Weight</li>
              <li>✓ 24h Express Lagos Fabrication</li>
            </ul>
          </div>
          <a
            href="/buy-card?tier=metal"
            className="mt-8 block text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30"
          >
            Order Smart Metal (₦50,000)
          </a>
        </article>

        {/* Tier 3 */}
        <article className="rounded-2xl border border-amber-500/40 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              Bespoke Luxury • 28g Alloy
            </span>
            <h2 className="text-2xl font-bold text-white mt-4 mb-1">Metal Debit Card + Custom Design</h2>
            <p className="text-xs text-slate-400 mb-4">24K Mirror Gold & Matte Obsidian</p>
            <div className="text-3xl font-extrabold text-white mb-2">
              ₦80,000 – ₦100,000
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Functional bank debit card EMV chip transplant + custom aerospace metal card with 1-on-1 designer proofing.
            </p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li>✓ Functional Bank EMV Debit Transplant</li>
              <li>✓ Deep CNC Dual-Sided Laser Relief</li>
              <li>✓ 24K Gold Mirror or Obsidian Black</li>
              <li>✓ 1-on-1 Bespoke Designer Proofing</li>
              <li>✓ Lifetime Indestructible Warranty</li>
            </ul>
          </div>
          <a
            href="/buy-card?tier=heavy_metal"
            className="mt-8 block text-center py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition"
          >
            Order Metal Debit (₦80,000+)
          </a>
        </article>
      </section>

      {/* Technical Comparison Matrix */}
      <section className="my-16 bg-slate-950/70 rounded-2xl border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Hardware Tier Comparison Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-white">
                <th className="py-3 px-2">Specification</th>
                <th className="py-3 px-2">Smart PVC (₦30,000)</th>
                <th className="py-3 px-2">Smart Metal (₦50,000)</th>
                <th className="py-3 px-2">Metal Debit (₦80,000–₦100,000)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-2 font-medium text-white">Weight</td>
                <td className="py-3 px-2">5g Featherweight</td>
                <td className="py-3 px-2">24g Solid Steel</td>
                <td className="py-3 px-2 font-bold text-amber-300">28g Aerospace Alloy</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium text-white">Material</td>
                <td className="py-3 px-2">Polymer PVC</td>
                <td className="py-3 px-2">304 Stainless Steel</td>
                <td className="py-3 px-2">Aerospace Alloy / 24K PVD</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium text-white">Engraving / Print</td>
                <td className="py-3 px-2">Full-Color HD UV</td>
                <td className="py-3 px-2">Single-Sided Fiber Laser</td>
                <td className="py-3 px-2">Deep CNC Dual-Sided Relief</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium text-white">EMV Debit Transplant</td>
                <td className="py-3 px-2">No</td>
                <td className="py-3 px-2">Available (+₦15,000)</td>
                <td className="py-3 px-2 text-emerald-400 font-bold">Included & Supported</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium text-white">Hardware Warranty</td>
                <td className="py-3 px-2">12 Months</td>
                <td className="py-3 px-2">12 Months</td>
                <td className="py-3 px-2 font-bold text-amber-300">Lifetime Replacement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
