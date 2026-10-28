import React, { useState } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { Mail, Phone, MapPin, Clock, Check, ArrowRight, Sparkles, Loader2, Star, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SocialMediaIconBadge } from '../components/social/SocialMediaIconBadge';

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !message.trim()) return;

    setSubmitting(true);
    const meta = {
      email: email.trim(),
      topic,
      message: message.trim(),
      source: 'direct_inquiry',
      type: 'support_feedback',
      city: 'Lagos',
      created_at: new Date().toISOString()
    };

    // 1. Direct Supabase save
    try {
      await supabase.from('leads').insert([{
        name: fullName.trim(),
        email: email.trim(),
        whatsapp: email.trim(),
        company: topic,
        message: message.trim(),
        city: JSON.stringify(meta),
        post_slug: 'contact_inquiry',
        source: 'direct_inquiry',
        status: 'new'
      }]);
    } catch (e) {}

    // 2. Local & Server API save
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          whatsapp: email.trim(),
          company: topic,
          message: message.trim(),
          source: 'direct_inquiry',
          city: 'Lagos',
          status: 'new'
        })
      });
    } catch (e) {}

    // 2.5. Local storage cache for zero-latency Super Admin reflection
    try {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('chipng_inquiries_cache') || '[]');
        stored.unshift({
          id: 'inq_' + Date.now(),
          name: fullName.trim(),
          email: email.trim(),
          whatsapp: email.trim(),
          company: topic,
          message: message.trim(),
          city: 'Lagos',
          source: 'direct_inquiry',
          post_slug: 'contact_inquiry',
          status: 'new',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('chipng_inquiries_cache', JSON.stringify(stored.slice(0, 50)));
      }
    } catch (e) {}

    // 3. Broadcast real-time event to Super Admin Dashboard
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('chipng_inquiries_channel');
        bc.postMessage({ type: 'NEW_DIRECT_INQUIRY', name: fullName.trim(), email: email.trim(), topic });
        setTimeout(() => bc.close(), 100);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chipng_new_inquiry', { 
          detail: { name: fullName.trim(), email: email.trim(), topic, message: message.trim() } 
        }));
      }
    } catch (e) {}

    setSubmitting(false);
    setSubmitted(true);
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
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
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

                {/* Drop A Review Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>Review CHIP NG on Google</span>
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Share your experience with our NFC cards and link-in-bio platform.
                    </div>
                  </div>
                  <a
                    href="https://g.page/r/CZGM0zQdEiY7EAE/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Drop Review</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Verified Social Media Channels */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Official Channels</div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <SocialMediaIconBadge platform="WhatsApp" style="color-circle" size="sm" href="https://wa.me/2348100764154" title="WhatsApp Concierge" />
                    <SocialMediaIconBadge platform="Instagram" style="color-circle" size="sm" href="https://www.instagram.com/chipng_nfc" title="Instagram @chipng_nfc" />
                    <SocialMediaIconBadge platform="X (Twitter)" style="color-circle" size="sm" href="https://x.com/chipng_nfc" title="X @chipng_nfc" />
                    <SocialMediaIconBadge platform="LinkedIn" style="color-circle" size="sm" href="https://linkedin.com/company/chipng" title="LinkedIn CHIP NG" />
                    <SocialMediaIconBadge platform="TikTok" style="color-circle" size="sm" href="https://www.tiktok.com/@chipng_nfc" title="TikTok @chipng_nfc" />
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
