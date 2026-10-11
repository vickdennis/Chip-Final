import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Users, Globe, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface MobileOnboardingProps {
  onComplete: () => void;
  onLogin: () => void;
}

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Your digital business card.',
    subtitle: 'The modern way to network',
    description: 'Share your contact details, social links, appointment bookings, and product catalog with one smart contactless profile.',
    icon: Smartphone,
    accent: '#D2F843',
    badge: 'Hardware + Cloud'
  },
  {
    id: 2,
    title: 'Turn every connection into an opportunity.',
    subtitle: '2-Way Contact Exchange',
    description: 'Capture verified WhatsApp contacts, inquiries, and customer leads directly on your phone with zero manual typing.',
    icon: Users,
    accent: '#3b82f6',
    badge: 'Automated CRM'
  },
  {
    id: 3,
    title: 'One profile. Everywhere.',
    subtitle: 'Universal Sharing',
    description: 'Share instantly via contactless NFC card tap, high-resolution QR code, dynamic bio link, or messaging apps. No app download needed for the recipient.',
    icon: Globe,
    accent: '#10b981',
    badge: 'Zero Friction'
  }
];

export const MobileOnboarding: React.FC<MobileOnboardingProps> = ({ onComplete, onLogin }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      localStorage.setItem('chipng_mobile_onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('chipng_mobile_onboarded', 'true');
    onComplete();
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <div className="fixed inset-0 z-40 bg-[#09090b] text-white flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-xs font-mono font-bold tracking-wider text-neutral-400">
          CHIP<span className="text-[#D2F843]">NG</span> MOBILE
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="my-auto py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center px-2"
          >
            {/* Visual Icon Badge */}
            <div 
              className="w-24 h-24 rounded-3xl p-0.5 mb-8 shadow-2xl relative"
              style={{ background: `linear-gradient(135deg, ${currentSlide.accent} 0%, rgba(255,255,255,0.05) 100%)` }}
            >
              <div className="w-full h-full bg-[#12141a] rounded-[22px] flex items-center justify-center">
                <IconComponent className="w-10 h-10" style={{ color: currentSlide.accent }} />
              </div>
              <div 
                className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-black shadow-sm"
                style={{ backgroundColor: currentSlide.accent }}
              >
                {currentSlide.badge}
              </div>
            </div>

            {/* Title & Description */}
            <span 
              className="text-xs font-mono font-semibold uppercase tracking-widest mb-2"
              style={{ color: currentSlide.accent }}
            >
              {currentSlide.subtitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              {currentSlide.title}
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed font-normal">
              {currentSlide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls & Dots */}
      <div className="space-y-6 pb-6">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-8 bg-[#D2F843]' : 'w-1.5 bg-neutral-800'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-[#D2F843] hover:bg-[#c3eb34] active:scale-[0.98] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D2F843]/15 cursor-pointer"
          >
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? (
              <>
                Get Started <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={() => {
              localStorage.setItem('chipng_mobile_onboarded', 'true');
              onLogin();
            }}
            className="w-full py-3 text-center text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
};
