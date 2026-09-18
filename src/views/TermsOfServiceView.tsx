import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ViewState } from '../App';

interface TermsOfServiceViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
}

export default function TermsOfServiceView({ onNavigate, isDarkMode }: TermsOfServiceViewProps) {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'} font-sans`}>
      <header className="px-6 py-6 border-b border-black/10 dark:border-white/10 flex items-center gap-4 sticky top-0 bg-gray-50/80 dark:bg-black/80 backdrop-blur-md z-50">
        <button 
          onClick={() => onNavigate('landing')}
          className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans font-bold text-xl tracking-tight">Terms of Service</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-black/60 dark:text-white/60 mb-8">Last updated: September 2026</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing and using CHIPNG ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">CHIPNG provides NFC business cards, digital storefronts, and related networking solutions. We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Intellectual Property</h2>
          <p className="mb-4">The Service and its original content, features, and functionality are and will remain the exclusive property of CHIPNG and its licensors. The Service is protected by copyright, trademark, and other laws.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Purchases and Payments</h2>
          <p className="mb-4">If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, and your billing address.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">In no event shall CHIPNG, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Information</h2>
          <p className="mb-4">If you have any questions about these Terms, please contact us at support@chipng.com.</p>
        </div>
      </main>
    </div>
  );
}
