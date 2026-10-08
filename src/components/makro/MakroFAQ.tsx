import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const MakroFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is CHIPNG and how does it work?',
      answer:
        'CHIPNG is the premier contactless smart business card and dynamic link-in-bio platform. When you tap your physical NFC card against any modern smartphone, your verified digital profile, vCard, social links, portfolio, and booking calendar open instantaneously in their browser. No app or setup is needed for the other person.',
    },
    {
      question: 'Do people need an app to tap my NFC card or view my profile?',
      answer:
        'No app is required at all. Both iPhone (iOS 13+) and Android devices have native NFC hardware enabled by default. Tapping the card opens your profile automatically in Safari or Chrome in under 200 milliseconds.',
    },
    {
      question: 'Can I update my links and contact info after receiving my card?',
      answer:
        'Yes, absolutely. Your physical card is permanently linked to your dynamic cloud handle (e.g. chipng.com/@yourname). You can edit phone numbers, emails, social handles, portfolio projects, and pricing anytime from your dashboard, and your card updates instantly without re-ordering.',
    },
    {
      question: 'How fast is delivery across Nigeria and internationally?',
      answer:
        'We manufacture and laser-engrave all cards in our Lagos workshop. Orders within Lagos arrive in 24 to 48 hours. Other Nigerian states arrive within 2 to 4 business days via verified courier dispatch. International shipments are delivered in 5 to 7 days via DHL Express.',
    },
    {
      question: 'Can I use CHIPNG purely as a digital Link-in-Bio without a physical card?',
      answer:
        'Yes! You can create your free digital link-in-bio page immediately to share in your Instagram, X, TikTok, and LinkedIn bios. If you later decide you want a contactless metal or PVC card for physical events, you can order one with a single click.',
    },
    {
      question: 'Can our company or startup order custom branded cards for our team?',
      answer:
        'Yes. We offer enterprise team packs with your custom company logo, employee names, and corporate branding laser-etched onto premium matte black metal, titanium, or PVC cards. You also get a centralized admin dashboard to manage employee profiles.',
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
            Everything you need to know about NFC & Link-in-Bio.
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
