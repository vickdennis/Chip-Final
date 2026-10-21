import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Flame, Clock } from 'lucide-react';

interface OrderItem {
  name: string;
  location: string;
  item: string;
  price: string;
  timeAgo: string;
}

const RECENT_ORDERS: OrderItem[] = [
  { name: 'Babatunde O.', location: 'Victoria Island, Lagos', item: 'Black PVC Card (Custom UV Print)', price: '₦35,000', timeAgo: '2 mins ago' },
  { name: 'Dr. Chidi E.', location: 'Lekki Phase 1, Lagos', item: 'White PVC Card (Custom Print)', price: '₦30,000', timeAgo: '5 mins ago' },
  { name: 'Amina B.', location: 'Maitama, Abuja', item: 'Black PVC Card (Custom UV Print)', price: '₦35,000', timeAgo: '8 mins ago' },
  { name: 'Oluwaseun A.', location: 'GRA, Port Harcourt', item: 'White PVC Card (Custom Print)', price: '₦30,000', timeAgo: '14 mins ago' },
  { name: 'Tolulope M.', location: 'Ikeja GRA, Lagos', item: 'Black PVC Card (Custom UV Print)', price: '₦35,000', timeAgo: '19 mins ago' },
  { name: 'Ibrahim K.', location: 'Central Business District, Abuja', item: 'Black PVC Card (Custom UV Print)', price: '₦35,000', timeAgo: '27 mins ago' },
  { name: 'Kelechi N.', location: 'Asaba, Delta', item: 'White PVC Card (Custom Print)', price: '₦30,000', timeAgo: '33 mins ago' },
  { name: 'Folake D.', location: 'Bodija, Ibadan', item: 'Black PVC Card (Custom UV Print)', price: '₦35,000', timeAgo: '41 mins ago' },
];

interface SocialProofToastProps {
  remainingStock?: number;
  discountSecondsLeft?: number;
  hasDiscount?: boolean;
  onOrderClick?: () => void;
}

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  remainingStock = 6,
  discountSecondsLeft,
  hasDiscount = false,
  onOrderClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first toast quickly after 2.5s
    const firstTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    // Rotate every 9 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % RECENT_ORDERS.length);
        setIsVisible(true);
      }, 800);
    }, 8500);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  const currentOrder = RECENT_ORDERS[currentIndex];

  // Format countdown seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Live Order Social Proof Toast (Bottom Left Desktop / Bottom-Center Mobile) */}
      <AnimatePresence>
        {isVisible && currentOrder && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={() => {
              if (onOrderClick) {
                onOrderClick();
              } else {
                const el = document.getElementById('shop') || document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-50 max-w-[360px] bg-[#0c0d12]/95 backdrop-blur-xl border border-white/15 hover:border-[#76BB08]/60 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center gap-3.5 select-none cursor-pointer group transition-colors"
          >
            {/* Visual Icon with Live Pulsing Green Glow */}
            <div className="relative w-11 h-11 rounded-xl bg-[#76BB08]/15 border border-[#76BB08]/40 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-[#76BB08]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#76BB08] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#76BB08]" />
            </div>

            <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-bold text-white truncate">
                  {currentOrder.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold shrink-0">
                  {currentOrder.timeAgo}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 truncate">
                Purchased <strong className="text-white font-semibold">{currentOrder.item}</strong>
              </p>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                <span className="truncate">📍 {currentOrder.location}</span>
                <span className="font-mono text-[#76BB08] font-bold shrink-0">{currentOrder.price}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scarcity / Reservation Urgency Bar (Sticky Top Banner when coupon is locked) */}
      {hasDiscount && discountSecondsLeft !== undefined && discountSecondsLeft > 0 && (
        <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#700947] via-[#B600A8] to-[#4F0761] text-white py-2 px-4 shadow-lg flex items-center justify-between text-xs sm:text-sm font-medium border-b border-white/20">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Flame className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
            <span>
              <strong>VIP 10% Reservation Locked:</strong> Limited blanks left for Batch #18.
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full font-mono text-xs border border-white/20">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Offer expires in:</span>
            <span className="font-bold text-amber-300">{formatTime(discountSecondsLeft)}</span>
          </div>
        </div>
      )}
    </>
  );
};
