import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Flame, Clock } from 'lucide-react';

interface OrderItem {
  name: string;
  location: string;
  item: string;
  timeAgo: string;
}

const RECENT_ORDERS: OrderItem[] = [
  { name: 'Babatunde O.', location: 'Victoria Island, Lagos', item: 'Smart Metal (28g Gunmetal)', timeAgo: '3 mins ago' },
  { name: 'Amina B.', location: 'Maitama, Abuja', item: '24K Matte Gold Edition', timeAgo: '7 mins ago' },
  { name: 'Dr. Chidi E.', location: 'Lekki Phase 1, Lagos', item: 'Smart Metal + Laser Engraving', timeAgo: '12 mins ago' },
  { name: 'Oluwaseun A.', location: 'GRA, Port Harcourt', item: 'Smart Plastic (Matte Black)', timeAgo: '18 mins ago' },
  { name: 'Tolulope M.', location: 'Ikeja GRA, Lagos', item: 'Metal Debit Convert Edition', timeAgo: '24 mins ago' },
  { name: 'Ibrahim K.', location: 'Central Business District, Abuja', item: 'Executive Smart Metal Bundle', timeAgo: '31 mins ago' },
];

interface SocialProofToastProps {
  remainingStock?: number;
  discountSecondsLeft?: number;
  hasDiscount?: boolean;
}

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  remainingStock = 6,
  discountSecondsLeft,
  hasDiscount = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first toast after 4s
    const firstTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    // Rotate every 11 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % RECENT_ORDERS.length);
        setIsVisible(true);
      }, 1000);
    }, 12000);

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
      {/* Live Order Social Proof Toast (Bottom Left Desktop / Top Notification Mobile) */}
      <AnimatePresence>
        {isVisible && currentOrder && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 max-w-[340px] bg-[#12141A]/95 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl flex items-center gap-3 select-none pointer-events-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B600A8]/30 to-purple-800/20 border border-[#B600A8]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#B600A8]" />
            </div>

            <div className="flex flex-col text-left overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {currentOrder.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] text-white/50">{currentOrder.timeAgo}</span>
              </div>
              <p className="text-[11px] text-white/70 truncate">
                Purchased <span className="text-[#E0A3F8] font-medium">{currentOrder.item}</span>
              </p>
              <span className="text-[9px] font-mono text-white/40 truncate">
                📍 {currentOrder.location}
              </span>
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
