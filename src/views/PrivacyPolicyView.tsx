import React from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode?: () => void;
}

export default function PrivacyPolicyView({ onNavigate, isDarkMode, toggleDarkMode }: PrivacyPolicyViewProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950">
      <MakroNavbar
        currentView="privacy-policy"
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
              <ShieldCheck className="w-3.5 h-3.5 text-[#84A900] dark:text-[#D2F843]" />
              <span>Legal Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs text-neutral-500 font-mono">
              Effective Date: September 2026 · Version 3.4
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-neutral-700 dark:text-neutral-300">
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">1. Introduction</h2>
            <p>
              Welcome to CHIPNG Technologies Inc. ("CHIPNG", "we", "our", or "us"). We design intelligent financial forecasting, instant invoicing, and NFC contactless identity hardware for independent professionals and creators worldwide. We hold our users' sovereign privacy to institutional standards.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">2. Information We Process</h2>
            <p>
              We process data necessary to provide predictive runway models and contactless profile exchanges:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Contact & Profile Identifiers:</strong> Name, work email, verified handle, custom links, and optional vCard attributes you elect to display.</li>
              <li><strong>Financial Telemetry:</strong> Invoiced amounts, settlement status, and recurring revenue schedules. Payment card processing is handled via PCI-DSS Level 1 compliant partners (Stripe, Paystack). We never store raw card numbers.</li>
              <li><strong>Hardware & NFC Telemetry:</strong> Anonymized interaction counters (e.g., tap frequency, browser agent) to calculate conversion analytics without capturing individual visitors' private device data.</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">3. Zero Selling of Data</h2>
            <p>
              CHIPNG does not sell, rent, or monetize your contact book, prospect inquiries, or financial forecasts to third-party ad brokers. Your data is isolated and encrypted using AES-256 at rest and TLS 1.3 in transit.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">4. Your Rights & Deletion</h2>
            <p>
              You have the right to export all profile and ledger records in standard JSON/CSV format, or permanently delete your account and all associated physical card bindings at any time directly through the user settings.
            </p>

            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">5. Direct Inquiries</h2>
            <p>
              For privacy compliance or data protection questions, please contact our legal counsel at <a href="mailto:privacy@chipng.com" className="underline font-semibold text-neutral-950 dark:text-white">privacy@chipng.com</a>.
            </p>
          </div>
        </div>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
