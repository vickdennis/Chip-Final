import React, { useState } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { Mail, Phone, MapPin, Clock, Check, ArrowRight, Sparkles } from 'lucide-react';

interface MakroContactViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export const MakroContactView: React.FC<MakroContactViewProps> = ({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Product Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && fullName.trim() && message.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between">
      <MakroNavbar
        currentView={'contact' as ViewState}
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Direct Inquiries & Support
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Let's build something remarkable.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Have questions about enterprise deployments, bulk custom NFC card production, or API integrations? We're here.
            </p>
          </div>
        </section>

        {/* Contact Form & Info Grid */}
        <section className="py-12 pb-24">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Direct Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Reach our advisory team
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Our core product leads and technical engineers respond directly. We maintain an average first-response latency of under 45 minutes during market hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-900 dark:text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Us</div>
                    <a href="mailto:support@chipng.com" className="text-sm font-bold text-neutral-950 dark:text-white hover:underline">
                      support@chipng.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-900 dark:text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Direct Hotline</div>
                    <div className="text-sm font-bold text-neutral-950 dark:text-white font-mono">
                      +234 (0) 810 076 4154
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-900 dark:text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Operating Hours</div>
                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Monday – Friday, 08:00 – 19:00 GMT+1
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7 bg-white dark:bg-[#12141B] rounded-3xl p-8 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-950 dark:text-white">
                    Inquiry Transmitted Successfully
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                    Thank you, {fullName}. A technical advisor has received your request and will reach out to {email} shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Vance"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Inquiry Topic
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    >
                      <option value="Product Inquiry">Product Inquiry & Features</option>
                      <option value="Enterprise Hardware">Custom Enterprise NFC Cards</option>
                      <option value="Link in Bio Customization">Link-in-Bio Custom Domains & Branding</option>
                      <option value="Partnership">Partnership & Distribution</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your team and what you're looking to achieve..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full group flex items-center justify-center gap-3 py-3.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    <span>Dispatch Inquiry</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
};
