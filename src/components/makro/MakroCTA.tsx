import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const MakroCTA: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [handle, setHandle] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        onGetStarted();
      }, 1000);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="relative rounded-3xl bg-neutral-950 text-white overflow-hidden p-8 sm:p-14 lg:p-20 shadow-2xl border border-neutral-800">
          
          {/* Subtle glow background */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#D2F843]/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-lime-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
              <span className="text-xs font-semibold text-neutral-200">
                Setup your bio link in 60 seconds
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Never print paper business cards again.
            </h2>

            <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
              Join 25,000+ Nigerian and global founders, creators, and executives who make unforgettable impressions with CHIPNG smart cards and dynamic bio links.
            </p>

            {/* Quick Handle Claim Form */}
            <div className="pt-4 max-w-md mx-auto">
              {submitted ? (
                <div className="p-4 rounded-2xl bg-neutral-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center gap-3 text-sm font-semibold animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>Handle reserved! Directing to setup...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center px-4 py-3.5 rounded-full bg-neutral-900 border border-neutral-800 focus-within:border-[#D2F843] transition-colors">
                    <span className="text-neutral-500 text-sm font-mono mr-1">chipng.com/@</span>
                    <input
                      type="text"
                      required
                      placeholder="yourname"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none w-full font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-full bg-[#D2F843] text-neutral-950 font-bold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
                  >
                    <span>Claim handle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D2F843]" />
                <span>Zero monthly subscription required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D2F843]" />
                <span>iOS & Android native NFC support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D2F843]" />
                <span>Dispatches from Lagos workshop</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
