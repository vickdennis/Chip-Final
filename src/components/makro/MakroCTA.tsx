import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const MakroCTA: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubmitted(true);
      setTimeout(() => {
        onGetStarted();
      }, 1200);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="relative rounded-3xl bg-neutral-950 text-white overflow-hidden p-8 sm:p-14 lg:p-20 shadow-2xl border border-neutral-800">
          
          {/* Subtle glow background */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#D2F843]/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
              <span className="text-xs font-semibold text-neutral-200">
                Start in 60 seconds
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Ready to elevate your financial and digital presence?
            </h2>

            <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
              Join over 25,000 founders, creators, and business leaders using CHIPNG to forecast cashflow, invoice instantly, and connect without friction.
            </p>

            {/* Quick Email Form */}
            <div className="pt-4 max-w-md mx-auto">
              {submitted ? (
                <div className="p-4 rounded-2xl bg-neutral-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center gap-3 text-sm font-semibold animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>Welcome aboard! Redirecting you now...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-5 py-3.5 rounded-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D2F843] transition-colors"
                  />
                  <button
                    type="submit"
                    className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D2F843] text-neutral-950 font-bold text-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer whitespace-nowrap shadow-md"
                  >
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-neutral-500">
              <span>Free tier available</span>
              <span>·</span>
              <span>No credit card required</span>
              <span>·</span>
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
