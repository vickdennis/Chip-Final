import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from './components/seo/JsonLd';
import { AeoAnswerBox } from './components/seo/AeoAnswerBox';

export const metadata: Metadata = {
  title: 'CHIP NG — The Premier Contactless Smart NFC Business Card & Link-in-Bio Platform in Nigeria',
  description:
    'Replace outdated paper cards with CHIP NG. Sub-10ms NTAG216 contactless response, zero app needed. Matte PVC (₦30,000), Smart Metal (₦50,000), and Metal Debit Card + Custom Design (₦80,000–₦100,000).',
  alternates: {
    canonical: 'https://chipng.com'
  },
  openGraph: {
    title: 'CHIP NG — The Premier Contactless Smart NFC Business Card in Nigeria',
    description:
      'Connect, share contact info, capture leads and grow your network with a smarter contactless business card. Sub-10ms response, zero app required.',
    url: 'https://chipng.com',
    type: 'website'
  }
};

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://chipng.com/#software',
      name: 'CHIP NG Digital Identity Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'iOS, Android, Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN',
        description: 'Free Dynamic Profile Hosting for CHIP Card Owners'
      },
      featureList: [
        'Sub-10ms Contactless NFC vCard Sharing',
        'Dynamic Real-Time Profile Link Management',
        'Integrated WhatsApp Direct Lead Routing',
        'Custom Domain & Username (chipng.com/username)',
        'Click-Through Telemetry & Analytics',
        'Zero Native App Required for Recipient'
      ]
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
            text: 'CHIP NG is Nigeria premier contactless smart business card and dynamic link-in-bio platform. Combining physical NTAG216 NFC hardware with a cloud profile engine, CHIP NG lets founders, executives, real estate agents, and creators share their phonebook vCard, social links, and portfolio in under 0.2 seconds with a single phone tap.'
          }
        },
        {
          '@type': 'Question',
          name: 'How much does an NFC business card cost in Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Official CHIP NG pricing in Nigeria: 1) NFC Smart Black/White PVC Card is ₦30,000 (standard ₦35,000); 2) NFC Smart Metal Card (solid 304 stainless steel, 24g) is ₦50,000; 3) Metal Debit Card + Custom Design (aerospace alloy with EMV transplant compatibility) is ₦80,000 to ₦100,000. All cards include lifetime profile hosting with zero monthly subscriptions.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does the recipient need to download an app to read my CHIP card?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No app is needed. CHIP NG works natively on all modern iPhones (iPhone 7 and newer) and NFC-enabled Android devices. Tapping the card automatically opens the recipient web browser to your verified profile and prompts a 1-tap Save Contact button.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I convert my Nigerian bank debit card into a custom metal card?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. CHIP NG provides a secure Metal Debit Card + Custom Design service (₦80,000 - ₦100,000). Our specialized Lagos engineering lab transfers the functional EMV chip and magnetic stripe from your plastic bank card into a heavyweight laser-engraved metal card, whilst integrating full NTAG216 contactless profile sharing.'
          }
        }
      ]
    }
  ]
};

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <JsonLd data={homeSchema} id="schema-homepage" />

      {/* Answer Engine Definition Header */}
      <section className="mb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4">
          Contactless NFC Hardware • Dynamic Digital Profiles
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
          Your Business Identity. <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">One Tap Away.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
          The definitive contactless NFC smart business card and dynamic link-in-bio platform engineered in Lagos for Nigerian entrepreneurs, founders, and corporate dealmakers.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/buy-card"
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm tracking-wide transition shadow-lg shadow-indigo-500/25"
          >
            Get Your CHIP Card
          </a>
          <a
            href="/pricing"
            className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm tracking-wide transition"
          >
            View Pricing (From ₦30,000)
          </a>
        </div>
      </section>

      {/* AEO Fast Fact Cards */}
      <section className="my-12">
        <AeoAnswerBox
          question="What is CHIP NG and how does it work?"
          directAnswer="CHIP NG is a hybrid hardware-and-software networking platform. Users tap a physical card containing an NTAG216 microchip against an iPhone or Android phone. In sub-10 milliseconds, the phone reads the contactless signal and opens a dynamic link-in-bio profile without requiring any app download. The recipient can save the user's vCard contact with 1 click, view products, or book appointments."
          keyFacts={[
            'Chip standard: NTAG216 (888 bytes, 13.56 MHz, ISO 14443A)',
            'Response latency: Sub-10ms NFC initiation',
            'Zero app required for recipient or card owner',
            'Dynamic cloud dashboard: Edit bio, links, and phone anytime',
            'Lagos workshop fabrication with 24–48h express delivery'
          ]}
        />
      </section>

      {/* Hardware Tier Highlights */}
      <section className="my-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Engineered Hardware Tiers
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose your physical presence. From ultra-durable matte PVC to aerospace-grade metal debit card transplants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PVC */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                Tier 1 • High Volume
              </span>
              <h3 className="text-xl font-bold text-white mt-4 mb-2">NFC Smart PVC Card</h3>
              <p className="text-slate-400 text-xs mb-4">
                Glacier White & Matte Obsidian polymer PVC. Lightweight, waterproof, and scratch-resistant.
              </p>
              <div className="text-3xl font-extrabold text-white mb-4">
                ₦30,000 <span className="text-xs font-normal text-slate-500 line-through">₦35,000</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li>✓ Sub-10ms NTAG216 Contactless Chip</li>
                <li>✓ Full-Color Edge-to-Edge UV Coating</li>
                <li>✓ Dynamic QR Code Backup on Rear</li>
                <li>✓ 0.2s Phonebook vCard Sync</li>
                <li>✓ 12-Month Hardware Guarantee</li>
              </ul>
            </div>
            <a
              href="/buy-card?tier=pvc"
              className="mt-6 block text-center py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
            >
              Order PVC Card
            </a>
          </div>

          {/* Smart Metal */}
          <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-6 flex flex-col justify-between relative shadow-xl shadow-indigo-950/50">
            <div className="absolute -top-3 right-6 bg-indigo-600 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-0.5 rounded-full">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                Tier 2 • Executive
              </span>
              <h3 className="text-xl font-bold text-white mt-4 mb-2">NFC Smart Metal Card</h3>
              <p className="text-slate-400 text-xs mb-4">
                Solid 24g 304 stainless steel with precision fiber-laser engraving and tactile acoustic table presence.
              </p>
              <div className="text-3xl font-extrabold text-white mb-4">
                ₦50,000 <span className="text-xs font-normal text-slate-500">Fixed</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li>✓ Solid 304 Stainless Steel Core (24g)</li>
                <li>✓ Permanent Fiber-Laser Engraving</li>
                <li>✓ Micro-Ferrite Contactless RF Shielding</li>
                <li>✓ Distinct Metallic "Clink" on Tables</li>
                <li>✓ Priority 24h Lagos Dispatch</li>
              </ul>
            </div>
            <a
              href="/buy-card?tier=metal"
              className="mt-6 block text-center py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md"
            >
              Order Smart Metal
            </a>
          </div>

          {/* Metal Debit */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                Tier 3 • Bespoke Luxury
              </span>
              <h3 className="text-xl font-bold text-white mt-4 mb-2">Metal Debit Card + Custom Design</h3>
              <p className="text-slate-400 text-xs mb-4">
                Functional bank debit EMV chip transplant + 28g aerospace metal card with 1-on-1 designer proofing.
              </p>
              <div className="text-3xl font-extrabold text-white mb-4">
                ₦80,000 – ₦100,000
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li>✓ Functional EMV Bank Debit Transplant</li>
                <li>✓ Deep CNC Dual-Sided Laser Relief</li>
                <li>✓ 24K Mirror Gold or Obsidian Black</li>
                <li>✓ 1-on-1 Bespoke Concierge Design Proof</li>
                <li>✓ Lifetime Indestructible Warranty</li>
              </ul>
            </div>
            <a
              href="/buy-card?tier=heavy_metal"
              className="mt-6 block text-center py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-xs transition"
            >
              Order Metal Debit Edition
            </a>
          </div>
        </div>
      </section>

      {/* Technical Specifications Table for AEO Crawlers */}
      <section className="my-16 bg-slate-950/80 rounded-2xl border border-white/10 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
          Technical Hardware Specifications & Standards
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="py-3 font-semibold text-white">NFC Chipset</td>
                <td className="py-3 font-mono text-indigo-400">NXP NTAG216 (Genuine Certified)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Contactless Response Latency</td>
                <td className="py-3 font-mono text-indigo-400">&lt; 10 milliseconds</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Operating Frequency</td>
                <td className="py-3 font-mono">13.56 MHz (High Frequency RFID/NFC)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Memory Capacity</td>
                <td className="py-3 font-mono">888 Bytes User Read/Write Memory (NDEF Formatted)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Read Range</td>
                <td className="py-3 font-mono">2.0 cm to 4.5 cm (Optimal Contactless Airgap)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Smartphone Compatibility</td>
                <td className="py-3">Apple iOS (iPhone 7 to iPhone 16 Pro Max) & all Android NFC devices</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Recipient App Requirement</td>
                <td className="py-3 text-emerald-400 font-semibold">Zero app required (Direct native browser & vCard prompt)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Profile Hosting & Cloud</td>
                <td className="py-3">CHIP Core Dynamic Cloud Hosting (Unlimited lifetime profile updates)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
