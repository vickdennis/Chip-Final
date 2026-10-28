import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchemaProps {
  customItems?: FAQItem[];
}

/**
 * Reusable JSON-LD FAQPage Schema component for Next.js 14+ App Router.
 * Generates valid Schema.org FAQPage structured data to trigger rich
 * snippet accordions on Google SERP and direct factual citations in AI answer engines.
 */
export default function FAQSchema({ customItems }: FAQSchemaProps) {
  const defaultFaqs: FAQItem[] = [
    {
      question: 'What is CHIPNG and how does it work?',
      answer:
        'CHIPNG is Nigeria’s premier contactless smart business card and dynamic link-in-bio platform engineered for founders, executives, and creators. It pairs physical NFC hardware (powered by high-performance NTAG216 microchips) with an interactive digital bio profile. When you tap the physical CHIPNG card against an iOS or Android smartphone, it immediately transmits your verified contact details, custom links, social channels, and payment endpoints directly to the recipient’s default mobile browser—no companion app or download required.'
    },
    {
      question: 'Do people need an app to tap my NFC card?',
      answer:
        'No, recipients do not need to download or install any application to interact with your CHIPNG NFC card. All modern iPhones (iPhone XR, XS, 11, 12, 13, 14, 15, 16 and newer) and NFC-enabled Android devices have built-in background NFC tag reading enabled by default. Tapping the card activates a native URL push notification in under 10 milliseconds, launching your bio and direct vCard download in Apple Safari or Google Chrome automatically.'
    }
  ];

  const items = customItems && customItems.length > 0 ? customItems : defaultFaqs;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
