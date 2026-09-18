import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ViewState } from '../App';

interface PrivacyPolicyViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
}

export default function PrivacyPolicyView({ onNavigate, isDarkMode }: PrivacyPolicyViewProps) {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'} font-sans`}>
      <header className="px-6 py-6 border-b border-black/10 dark:border-white/10 flex items-center gap-4 sticky top-0 bg-gray-50/80 dark:bg-black/80 backdrop-blur-md z-50">
        <button 
          onClick={() => onNavigate('landing')}
          className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans font-bold text-xl tracking-tight">Privacy Policy</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-black/60 dark:text-white/60 mb-8">Last updated: September 2026</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">Welcome to CHIPNG. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. The Data We Collect About You</h2>
          <p className="mb-4">Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes payment card details (processed securely via our third-party payment providers).</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-4">If you have any questions about this privacy policy or our privacy practices, please contact us at support@chipng.com.</p>
        </div>
      </main>
    </div>
  );
}
