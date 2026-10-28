import React, { useEffect } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { CorporateBundleSection } from '../components/makro/CorporateBundleSection';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ShieldCheck, ArrowLeft, Building2, Sparkles, CheckCircle2 } from 'lucide-react';

interface CorporateBundleViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export const CorporateBundleView: React.FC<CorporateBundleViewProps> = ({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}) => {
  useEffect(() => {
    // Scroll to top on page mount
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Corporate Fleet Bundle (10 PVC + 1 Free CEO Metal) | CHIP NG';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#16a34a] selection:text-neutral-950">
      {/* Global Makro Navigation Top Bar */}
      <MakroNavbar
        currentView="landing"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1 pt-4">
        {/* Breadcrumb & Navigation Anchor Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] font-bold">
                <Building2 className="w-3.5 h-3.5" /> B2B Corporate Offer
              </span>
              <span className="hidden sm:inline text-neutral-400">•</span>
              <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400">
                10 PVC + 1 Free CEO Metal (₦300,000)
              </span>
            </div>
          </div>
        </div>

        {/* Corporate Bundle Interactive Section */}
        <CorporateBundleSection
          onNavigate={onNavigate}
          isStandalonePage={true}
        />
      </main>

      {/* Makro Footer */}
      <MakroFooter
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default CorporateBundleView;
