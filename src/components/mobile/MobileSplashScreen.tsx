import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import chipngExactTile from '../../assets/images/chipng_exact_tile.png';

interface MobileSplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({ 
  onFinish, 
  durationMs = 1800 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 400); // Give time for exit animation
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-white select-none px-6"
        >
          {/* Ambient glow backdrop */}
          <div className="absolute w-72 h-72 rounded-full bg-[#D2F843]/10 blur-[100px] pointer-events-none" />

          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-neutral-900 border border-white/10 p-4 shadow-2xl flex items-center justify-center relative overflow-hidden mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-tr from-[#D2F843]/20 via-transparent to-transparent opacity-60 pointer-events-none"
              />
              <img
                src={chipngExactTile}
                alt="CHIP NG Logo"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5 font-sans">
                CHIP<span className="text-[#D2F843]">NG</span>
              </h1>
              <p className="mt-2 text-xs font-medium text-neutral-400 tracking-wide uppercase font-mono">
                One tap. Endless opportunities.
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom pulse indicator */}
          <div className="absolute bottom-12 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D2F843] animate-pulse" />
            <span className="text-[11px] font-mono text-neutral-500 font-medium">NFC Cloud Engine Active</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
