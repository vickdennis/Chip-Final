import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const MakroFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is CHIPNG and how does it work?',
      answer:
        'CHIPNG combines high-precision AI financial forecasting and invoicing with premium NFC smart touchpoints and a modern link-in-bio platform. It allows founders, creators, and professionals to anticipate cashflow, collect instant payments, and exchange verified digital business credentials with a single tap.',
    },
    {
      question: 'Do people need an app to read my NFC card or digital profile?',
      answer:
        'No app or download is required. When an NFC-enabled smartphone (iOS or Android) taps your card, the browser opens your dynamic profile instantly. Profiles are optimized for ultra-fast load speeds under 200 milliseconds.',
    },
    {
      question: 'How does the AI Cash Forecasting predict my runway?',
      answer:
        'Our algorithms analyze your historical income timing, recurring retainers, typical client payment delays, and baseline operating expenses. It computes confidence ranges so you know your exact safe buffer weeks ahead of time.',
    },
    {
      question: 'Can I reconfigure my links and card information after purchase?',
      answer:
        'Yes. Your physical NFC card is permanently linked to your dynamic cloud handle. You can update your links, social media handles, banking details, invoices, and bio anytime from your dashboard with instantaneous reflection.',
    },
    {
      question: 'What payment methods can my clients use to pay invoices?',
      answer:
        'Clients can pay using credit and debit cards, Apple Pay, Google Pay, and direct bank transfers (supported across US, UK, and Africa via Paystack and Stripe). Settlements are fast and secure.',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Everything you need to know.
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#12141B] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-800 dark:text-white">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
