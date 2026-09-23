import React from 'react';
import { ViewState } from '../../App';
import { ArrowUp } from 'lucide-react';

interface MakroFooterProps {
  onNavigate: (view: ViewState) => void;
}

export const MakroFooter: React.FC<MakroFooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#07080B] text-neutral-600 dark:text-neutral-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 lg:py-20">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-neutral-100 dark:border-neutral-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4 pr-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center gap-1 px-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span>
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
                CHIPNG
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
              The definitive AI finance and digital identity platform for solopreneurs, creators, and modern teams. Designed for clarity, speed, and precision.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                All systems operational · 99.98%
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  AI Forecasting
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Digital Card Customizer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Instant Invoicing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Lead Capture Funnel
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('company' as ViewState)} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  About CHIPNG
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('company' as ViewState)} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Leadership & Team
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('updates' as ViewState)} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Updates & Releases
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact' as ViewState)} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Careers (We're Hiring!)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('blog-directory')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Engineering Blog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact' as ViewState)} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Support & Contact
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-of-service')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} CHIPNG Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
