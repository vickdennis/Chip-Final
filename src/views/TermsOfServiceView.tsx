import React from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode?: () => void;
}

export default function TermsOfServiceView({ onNavigate, isDarkMode, toggleDarkMode }: TermsOfServiceViewProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950">
      <MakroNavbar
        currentView="terms-of-service"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode || (() => {})}
      />

      <main className="flex-1 max-w-4xl mx-auto px-6 sm:px-8 py-16">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </button>

        <div className="bg-white dark:bg-[#12141B] rounded-3xl p-8 sm:p-12 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-8">
          <div className="space-y-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <FileText className="w-3.5 h-3.5 text-[#84A900] dark:text-[#D2F843]" />
              <span>Service Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-xs text-neutral-500 font-mono">
              Last Updated: September 2026 · Global Terms
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-neutral-700 dark:text-neutral-300">
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or utilizing CHIPNG software applications, hardware touchpoints, or API endpoints, you enter into a binding legal contract with CHIPNG Technologies Inc. If you disagree with any segment of these provisions, you must discontinue platform usage immediately.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">2. Product & Service Scope</h2>
            <p>
              CHIPNG provides digital identity solutions, contactless NFC hardware, machine-learning based cash forecasting, automated invoice generation, and associated creator tools. While we target 99.98% availability, scheduled maintenance and upstream bank webhook latencies may occasionally occur.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">3. User Conduct & Handle Ownership</h2>
            <p>
              Users must not register confusing, deceptive, or trademark-infringing handles (e.g., claiming `@apple` or `@google`). We reserve the right to reclaim or reassign any inactive or impersonating handle. You are responsible for preserving credentials and safeguarding physical cards.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">4. Physical Hardware Warranty</h2>
            <p>
              All premium NFC metal, wood, and polycarbonate cards are guaranteed against internal antenna chip failure for a period of twelve (12) months from fulfillment date. Replacement units will be dispatched upon verified physical inspection.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">5. Governing Law & Contact</h2>
            <p>
              These Terms shall be interpreted under commercial arbitral laws. Inquiries regarding enterprise licensing or legal enforcement should be directed to <a href="mailto:legal@chipng.com" className="underline font-semibold text-neutral-950 dark:text-white">legal@chipng.com</a>.
            </p>
          </div>
        </div>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
