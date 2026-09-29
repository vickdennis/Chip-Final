import React from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface RefundPolicyViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function RefundPolicyView({
  onNavigate,
  isDarkMode = false,
  toggleDarkMode = () => {},
}: RefundPolicyViewProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950 font-sans">
      <MakroNavbar
        currentView="landing"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] text-xs font-mono font-bold">
              CUSTOMER ASSURANCE
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Refund & Warranty Policy
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Last updated: September 2026. Every CHIP NG smart card includes our 12-Month Hardware Guarantee and digital satisfaction commitment.
            </p>
          </div>

          <div className="bg-white dark:bg-[#12141B] p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                12-Month Hardware Warranty
              </h2>
              <p>
                Every CHIP NG physical card is guaranteed against antenna failure, internal microchip defects, and premature demagnetization for a full 12 months from the date of delivery. If your card ceases to trigger NFC scans on compatible phones under normal usage, we will replace your card free of charge.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#6b8500] dark:text-[#D2F843]" />
                Digital Proof & Customization Approval
              </h2>
              <p>
                Prior to laser engraving metal cards or printing custom PVC cards, our design team shares a high-resolution 3D digital proof via WhatsApp or email. You must approve the layout, spelling, and logo placement before fabrication commences. Once approved and physically engraved, custom cards cannot be returned for typography errors that were present in the approved proof.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Damaged in Transit or Fabrication Errors
              </h2>
              <p>
                If your card arrives physically damaged, scratched, or with manufacturing defects, notify our support team within 48 hours of delivery at support@chipng.com or via WhatsApp (+234 810 076 4154) with a photo of the card. A priority replacement will be dispatched at zero additional cost to you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                Digital Services & Themes
              </h2>
              <p>
                All digital bio profiles on CHIP NG include a free lifetime tier. Digital theme and pro feature upgrades are processed securely via Paystack. If you experience technical difficulties with any digital add-on, our engineering team will resolve it or process a refund within 5 business days.
              </p>
            </section>
          </div>

        </div>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
