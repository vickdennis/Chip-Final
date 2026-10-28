import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '../components/seo/JsonLd';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions & Hardware Guide | CHIP NG Nigeria',
  description:
    'Detailed technical and commercial FAQ for CHIP NG contactless smart cards and dynamic link-in-bio platform. Learn how NFC works, smartphone compatibility, and pricing.',
  alternates: {
    canonical: 'https://chipng.com/faq'
  },
  openGraph: {
    title: 'CHIP NG FAQ — Smart NFC Cards, Pricing & Compatibility in Nigeria',
    description:
      'Answers to every question about CHIP NG contactless smart business cards, sub-10ms response, zero app needed, and Lagos delivery.',
    url: 'https://chipng.com/faq',
    type: 'website'
  }
};

const FAQ_DATA = [
  {
    category: 'Hardware & Technology',
    questions: [
      {
        q: 'What is NFC and how does a CHIP NG card work?',
        a: 'NFC (Near Field Communication) is a short-range wireless radio frequency standard operating at 13.56 MHz. CHIP NG embeds genuine certified NXP NTAG216 microchips inside polymer PVC or solid stainless steel cards. When the card touches an iPhone or Android smartphone, an electromagnetic field powers the passive microchip, transmitting your digital profile URL in under 10 milliseconds.'
      },
      {
        q: 'Does the other person need an app to read my card?',
        a: 'No app is needed. Unlike older barcode systems or proprietary devices, CHIP NG works right out of the box with native smartphone browsers. The moment you tap the card, the recipient phone automatically opens your verified profile and prompts them to download your vCard contact directly into their phonebook.'
      },
      {
        q: 'Which smartphones are compatible with CHIP NG?',
        a: 'Virtually all modern smartphones are fully compatible. For Apple: all iPhones from iPhone 7, 8, X, XR, XS, 11, 12, 13, 14, 15, to iPhone 16 have built-in background NFC reading. For Android: almost 95% of Android devices from Samsung, Google Pixel, Xiaomi, OnePlus, and Tecno have NFC enabled by default.'
      }
    ]
  },
  {
    category: 'Pricing & Tiers',
    questions: [
      {
        q: 'How much does CHIP NG cost in Nigeria?',
        a: 'Official 2026 pricing: 1) NFC Smart Black/White PVC Card is ₦30,000 (standard ₦35,000); 2) NFC Smart Metal Card (24g solid 304 stainless steel) is ₦50,000; 3) Metal Debit Card + Custom Design (aerospace alloy with EMV chip transplant) is ₦80,000 to ₦100,000. All options include free lifetime profile hosting with zero monthly fees.'
      },
      {
        q: 'Is there a monthly or annual subscription fee?',
        a: 'No. Every CHIP NG card purchase includes permanent, lifetime dynamic cloud hosting for your profile at no monthly fee. You can update your links, social media, contact info, and portfolio as many times as you like without recurring charges.'
      }
    ]
  },
  {
    category: 'Metal Debit Card Conversion',
    questions: [
      {
        q: 'Can CHIP NG convert my Nigerian bank debit card into a metal card?',
        a: 'Yes. Our specialized Metal Debit Card + Custom Design service (₦80,000 - ₦100,000) securely transplants the operational EMV chip and magnetic stripe from your plastic bank card into a heavyweight 28g laser-engraved metal card. Your new card works at ATMs and POS payment terminals, while also functioning as an NFC smart business card.'
      },
      {
        q: 'Is the metal debit card conversion safe and secure?',
        a: 'Yes. CHIP NG does not store, copy, or retain any bank PINs, card numbers, or cryptographic keys. The physical microchip is transferred directly in our secure Lagos hardware lab and returned to you via insured delivery.'
      }
    ]
  },
  {
    category: 'Delivery & Warranty',
    questions: [
      {
        q: 'How fast is delivery across Lagos and nationwide in Nigeria?',
        a: 'Cards are fabricated in our Lekki Phase 1, Lagos workshop. Orders within Lagos are delivered within 24 to 48 hours via dedicated dispatch courier. Orders to Abuja, Port Harcourt, Ibadan, and all 36 Nigerian states are shipped via DHL and GIG Logistics in 2 to 4 business days.'
      },
      {
        q: 'What is the warranty on CHIP NG smart cards?',
        a: 'Smart PVC and Smart Metal cards come with a comprehensive 12-month hardware replacement warranty covering antenna and chip performance. The Custom Heavy Metal edition includes a Lifetime Indestructible Hardware & Engraving Warranty.'
      }
    ]
  }
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_DATA.flatMap((cat) =>
    cat.questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  )
};

export default function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={faqSchema} id="schema-faq-main" />
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'FAQ & Knowledge Base', url: '/faq' }
        ]}
      />

      <header className="text-center my-10">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
          Knowledge Base & Specifications
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about CHIP NG contactless hardware, smartphone compatibility, pricing, and Lagos delivery.
        </p>
      </header>

      <div className="space-y-12 my-12">
        {FAQ_DATA.map((cat, idx) => (
          <section key={idx} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              {cat.category}
            </h2>
            <div className="space-y-6">
              {cat.questions.map((q, qIdx) => (
                <article key={qIdx} className="border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {q.q}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {q.a}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
