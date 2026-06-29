import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import chipngCoverImage from "../assets/images/chipng_dark_logo_1782735665295.jpg";
import { 
  Smartphone, 
  Wifi, 
  Sparkles, 
  Compass, 
  Music, 
  Instagram, 
  Twitter,
  Youtube,
  Globe, 
  UserPlus, 
  Tv, 
  QrCode,
  ShieldCheck,
  BadgeCheck,
  Zap,
  DollarSign
} from "lucide-react";

type ThemeId = "gold" | "cyber" | "glass";

interface FloatingItemProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yRange?: [number, number];
  className?: string;
}

const FloatingItem = ({ children, delay = 0, duration = 6, yRange = [-8, 8], className = "" }: FloatingItemProps) => {
  return (
    <motion.div
      animate={{
        y: yRange,
        rotate: [-1.5, 1.5, -1.5],
      }}
      transition={{
        y: {
          duration: duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay,
        },
        rotate: {
          duration: duration + 1,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay,
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LinkMeMotionGraphics = () => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("gold");
  const [tapActive, setTapActive] = useState(false);
  const [followersCount, setFollowersCount] = useState(12840);
  
  // Dynamic theme changing loop
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTheme((prev) => {
        if (prev === "gold") return "cyber";
        if (prev === "cyber") return "glass";
        return "gold";
      });
    }, 6000); // Transitions every 6 seconds
    
    return () => clearInterval(timer);
  }, []);

  // Soft followers ticker simulation
  useEffect(() => {
    const folTimer = setInterval(() => {
      setFollowersCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3200);
    return () => clearInterval(folTimer);
  }, []);

  const triggerTapAnimation = () => {
    setTapActive(true);
    setTimeout(() => setTapActive(false), 1200);
  };

  return (
    <div className="relative w-full min-h-[360px] min-[370px]:min-h-[420px] min-[420px]:min-h-[480px] sm:min-h-[650px] md:min-h-[720px] flex flex-col justify-center items-center py-4 sm:py-6 select-none overflow-hidden">
      
      {/* Background radial soft light halo matching the active theme */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className={`absolute w-[250px] sm:w-[500px] md:w-[650px] h-[250px] sm:h-[500px] md:h-[650px] rounded-full filter blur-[80px] sm:blur-[140px] ${
              activeTheme === "gold" 
                ? "bg-gradient-to-tr from-amber-600/30 to-yellow-500/10" 
                : activeTheme === "cyber"
                ? "bg-gradient-to-tr from-fuchsia-600/30 to-violet-500/10"
                : "bg-gradient-to-tr from-cyan-500/20 to-rose-400/20"
            }`}
          />
        </AnimatePresence>
      </div>

      {/* Main interactive viewport container with responsive scaling */}
      <div className="relative w-full max-w-4xl h-[320px] min-[370px]:h-[380px] min-[420px]:h-[440px] sm:h-[560px] md:h-[620px] flex items-center justify-center scale-[0.58] min-[370px]:scale-[0.66] min-[420px]:scale-[0.76] sm:scale-[0.9] md:scale-100 origin-center transition-all duration-300">

        {/* ================= BACKGROUND RIPPLE TAP SYSTEM ================= */}
        <AnimatePresence>
          {tapActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-10">
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  initial={{ width: 60, height: 60, opacity: 0.9, border: "2px solid rgba(255, 255, 255, 0.4)" }}
                  animate={{ 
                    width: [60, 480, 850], 
                    height: [60, 480, 850], 
                    opacity: [0.8, 0.3, 0],
                    border: ring === 1 
                      ? "4px solid rgba(212, 163, 89, 0.6)" 
                      : ring === 2 
                      ? "3px solid rgba(182, 0, 168, 0.5)" 
                      : "2px dashed rgba(255, 255, 255, 0.3)"
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    ease: "easeOut",
                    delay: (ring - 1) * 0.15
                  }}
                  className="absolute rounded-full"
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* ================= FLOATING ITEM LEFT 1: SPOTIFY / MUSIC PLAYER ================= */}
        <FloatingItem 
          delay={0.2} 
          duration={5.5} 
          yRange={[-12, 12]} 
          className="absolute left-[3%] sm:left-[8%] md:left-[12%] top-[12%] sm:top-[16%] z-30 pointer-events-auto"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="flex items-center gap-3 bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] max-w-[170px] sm:max-w-[210px]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-sans font-bold text-xs sm:text-sm text-white truncate uppercase tracking-tight">Now Playing</h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-green-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span className="flex gap-0.5 items-end h-2 w-3">
                  <span className="w-0.5 h-1.5 bg-green-400 animate-[bounce_1s_infinite]" />
                  <span className="w-0.5 h-3 bg-green-400 animate-[bounce_0.7s_infinite_0.2s]" />
                  <span className="w-0.5 h-2 bg-green-400 animate-[bounce_0.8s_infinite_0.4s]" />
                </span>
                CHIP TRACKS
              </p>
            </div>
          </motion.div>
        </FloatingItem>

        {/* ================= FLOATING ITEM LEFT 2: INSTAGRAM/SOCIAL BADGE ================= */}
        <FloatingItem 
          delay={0.8} 
          duration={6.5} 
          yRange={[12, -12]} 
          className="absolute left-[2%] sm:left-[6%] md:left-[10%] bottom-[16%] sm:bottom-[20%] z-30 pointer-events-auto"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: 5 }}
            className="flex flex-col gap-1.5 bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-600 to-yellow-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Instagram className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-sans font-black text-xs sm:text-sm text-white">@chipng</span>
                <span className="text-[9px] sm:text-[10px] text-[#D7E2EA]/50 block uppercase tracking-wider font-mono">Verified Partner</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-1.5 mt-0.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#D7E2EA]/60 uppercase">Followers</span>
              <motion.span 
                key={followersCount}
                initial={{ scale: 1.2, color: "#f43f5e" }}
                animate={{ scale: 1, color: "#fff" }}
                transition={{ duration: 0.4 }}
                className="font-mono text-xs sm:text-sm font-bold text-white tracking-tight"
              >
                {followersCount.toLocaleString()}
              </motion.span>
            </div>
          </motion.div>
        </FloatingItem>



        {/* ================= FLOATING ITEM RIGHT 2: SAVE CONTACT / TAP NOTIFICATION ================= */}
        <FloatingItem 
          delay={1.1} 
          duration={5.8} 
          yRange={[8, -8]} 
          className="absolute right-[3%] sm:right-[8%] md:right-[11%] bottom-[12%] sm:bottom-[16%] z-30 pointer-events-auto"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: 5 }}
            onClick={triggerTapAnimation}
            className="flex items-center gap-3 bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-pointer max-w-[170px] sm:max-w-[210px]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B600A8] to-purple-800 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs sm:text-sm text-white truncate uppercase tracking-tight">Save Contact</h4>
              <p className="font-sans text-[9px] sm:text-[10px] text-white/50 leading-tight">Add CHIP NG directly to your phone contacts</p>
            </div>
          </motion.div>
        </FloatingItem>


        {/* ================= SMARTPHONE FRAME (CENTER) ================= */}
        <motion.div 
          animate={{
            y: [-6, 6, -6],
            rotate: [-0.5, 0.5, -0.5]
          }}
          transition={{
            y: { duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            rotate: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
          }}
          className="relative z-20 w-[240px] sm:w-[280px] md:w-[310px] aspect-[9/18.5] bg-neutral-950 rounded-[44px] p-2.5 sm:p-3.5 shadow-[0_45px_100px_rgba(0,0,0,0.95)] border-4 border-neutral-800 flex flex-col overflow-hidden"
        >
          {/* Inner Gloss Screen Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30 rounded-[38px]" />

          {/* Smartphone Speaker notch / Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800/50 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-950 rounded-full" />
            </div>
            <div className="w-4 h-1 bg-neutral-900 rounded-full ml-1.5" />
          </div>

          {/* SIMULATED BIO LINK PHONE SCREEN VIEWPORT */}
          <div className="relative flex-1 w-full h-full rounded-[34px] overflow-hidden flex flex-col justify-between pb-4 transition-all duration-700 select-none bg-neutral-950">
            
            {/* 1. Cover Image Section at the top (exact public profile style) */}
            <div className="relative w-full aspect-[4/3] bg-neutral-950 overflow-hidden shrink-0">
              <img 
                src={chipngCoverImage} 
                alt="CHIP NG" 
                className="w-full h-full object-contain p-2.5 opacity-95"
                referrerPolicy="no-referrer"
              />
              {/* Smooth dark overlay vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent z-10" />

              {/* Verified badge and Profile Title Overlay */}
              <div className="absolute bottom-2.5 left-0 right-0 px-3 z-20 text-center flex flex-col items-center">
                <h3 className="font-sans font-black uppercase text-xs sm:text-sm text-white tracking-tight flex items-center gap-1 justify-center leading-none">
                  CHIP NG
                  <BadgeCheck className="w-4 h-4 text-white fill-[#0095f6]" />
                </h3>
                <p className="font-sans text-[8px] text-white/75 font-semibold mt-1 leading-none">
                  Instant NFC Brand Links
                </p>
                <p className="font-mono text-[7.5px] uppercase tracking-wider text-[#D7E2EA]/40 mt-1 leading-none">
                  @chipng
                </p>
              </div>
            </div>

            {/* Dynamic Background matching selected Theme */}
            <div className="absolute inset-x-0 bottom-0 top-[33%] z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTheme}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  {activeTheme === "gold" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C] via-[#121214] to-[#0A0A0A] flex flex-col items-center justify-center">
                      {/* Gold dust elements */}
                      <div className="absolute w-24 h-24 rounded-full bg-yellow-500/5 top-1/4 filter blur-xl animate-pulse" />
                      <div className="absolute w-20 h-20 rounded-full bg-amber-600/5 bottom-1/3 filter blur-xl" />
                    </div>
                  )}
                  {activeTheme === "cyber" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0F051D] via-[#090214] to-[#020005] flex flex-col">
                      {/* Grid background mesh overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(182,0,168,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(182,0,168,0.04)_1px,transparent_1px)] bg-[size:16px_16px]" />
                      <div className="absolute w-28 h-28 rounded-full bg-fuchsia-500/10 top-1/3 left-1/4 filter blur-2xl" />
                    </div>
                  )}
                  {activeTheme === "glass" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-rose-950">
                      {/* Moving organic smooth gradients */}
                      <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 top-[10%] -left-10 filter blur-2xl animate-pulse [animation-duration:8s]" />
                      <div className="absolute w-36 h-36 rounded-full bg-rose-500/15 bottom-[20%] -right-10 filter blur-2xl animate-pulse [animation-duration:10s]" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Screen Content Overlay */}
            <div className="relative z-10 flex-1 flex flex-col justify-between h-full px-3 sm:px-4">
              
              {/* Horizontal Social Media Icons Row */}
              <div className="flex justify-center items-center gap-3.5 pt-3 pb-1 shrink-0 z-20">
                <a href="#" className="p-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="p-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="p-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="p-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300">
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
              
              {/* Middle Section: Dynamic Action Link Buttons */}
              <div className="flex-1 flex flex-col justify-center gap-2 pt-2.5 pb-2 w-full px-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTheme}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="flex flex-col gap-2 w-full"
                  >
                    {[
                      { 
                        title: "Exclusive NFC Store", 
                        icon: <Sparkles className="w-3.5 h-3.5" />,
                        desc: "Get your brushed gold card"
                      },
                      { 
                        title: "Book Personal Setup", 
                        icon: <Compass className="w-3.5 h-3.5" />,
                        desc: "1-on-1 brand consultancy"
                      },
                      { 
                        title: "Make Direct Payment", 
                        icon: <DollarSign className="w-3.5 h-3.5" />,
                        desc: "Instant Paystack checkout"
                      }
                    ].map((btn, idx) => {
                      // Stylings according to active themes
                      let btnClass = "";
                      if (activeTheme === "gold") {
                        btnClass = "bg-[#151518]/90 border border-yellow-500/20 text-white hover:border-yellow-500/80 hover:bg-[#1a1a1f] shadow-lg shadow-yellow-500/5";
                      } else if (activeTheme === "cyber") {
                        btnClass = "bg-[#1a082e]/80 border border-fuchsia-500/30 text-white hover:border-fuchsia-400 hover:bg-[#250d3f] shadow-lg shadow-fuchsia-500/10";
                      } else {
                        btnClass = "bg-white/10 backdrop-blur-md border border-white/25 text-white hover:bg-white/15 hover:border-white/40 shadow-md";
                      }

                      return (
                        <motion.div
                          key={idx}
                          variants={{
                            hidden: { opacity: 0, x: -15, scale: 0.95 },
                            visible: { opacity: 1, x: 0, scale: 1 }
                          }}
                          transition={{ type: "spring", stiffness: 120, damping: 14 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={triggerTapAnimation}
                          className={`w-full py-2 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors duration-200 ${btnClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={
                              activeTheme === "gold" ? "text-yellow-400" :
                              activeTheme === "cyber" ? "text-fuchsia-400" : "text-sky-300"
                            }>
                              {btn.icon}
                            </span>
                            <div className="text-left">
                              <span className="font-sans font-black text-[11px] sm:text-xs tracking-tight uppercase block leading-none text-white">
                                {btn.title}
                              </span>
                              <span className="text-[8px] opacity-40 uppercase tracking-wide block mt-0.5 leading-none">
                                {btn.desc}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] opacity-30 font-bold">→</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Portion: Quick Connections Bar */}
              <div className="w-full flex justify-between items-center border-t border-white/5 pt-2.5">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#D7E2EA]/60 hover:text-white transition-colors cursor-pointer">
                    <Instagram className="w-3 h-3" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#D7E2EA]/60 hover:text-white transition-colors cursor-pointer">
                    <Tv className="w-3 h-3" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#D7E2EA]/60 hover:text-white transition-colors cursor-pointer">
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
                
                {/* Contact tap button on screen */}
                <button 
                  onClick={triggerTapAnimation}
                  className={`px-3 py-1 rounded-full font-sans font-black text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all duration-300 ${
                    activeTheme === "gold"
                      ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-md shadow-yellow-500/20"
                      : activeTheme === "cyber"
                      ? "bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-md shadow-fuchsia-500/20"
                      : "bg-white text-black hover:bg-neutral-200 shadow-sm"
                  }`}
                >
                  <Wifi className="w-2.5 h-2.5 animate-pulse" />
                  TAP TO MATCH
                </button>
              </div>

            </div>
          </div>
        </motion.div>

        {/* ================= FLOATING NOTIFICATION BANNER TOP ================= */}
        <AnimatePresence>
          {tapActive && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 180, damping: 15 }}
              className="absolute top-4 sm:top-8 z-50 bg-black/95 border border-yellow-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.8)] px-5 py-2.5 rounded-full flex items-center gap-2.5 max-w-[90%]"
            >
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-md shadow-yellow-400/20">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <span className="font-sans font-black text-xs text-white uppercase tracking-tight block">
                  NFC Contact Transferred!
                </span>
                <span className="text-[9px] text-[#D7E2EA]/60 uppercase tracking-wider font-mono">
                  TAP CONNECTIVITY ACTIVE (2.4ms)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Manual theme selector bar (Mimicking live dashboard customizer on link.me) */}
      <div className="relative z-30 flex items-center gap-2 bg-[#111] border border-white/10 p-1.5 rounded-full mt-4 max-w-sm shadow-xl">
        {[
          { id: "gold", label: "Matte Gold", color: "bg-yellow-500" },
          { id: "cyber", label: "Cyber Punk", color: "bg-fuchsia-500" },
          { id: "glass", label: "Glass Wave", color: "bg-cyan-500" }
        ].map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => {
                setActiveTheme(theme.id as ThemeId);
                triggerTapAnimation();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                isActive 
                  ? "bg-white/10 text-white font-bold" 
                  : "text-[#D7E2EA]/50 hover:text-white"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${theme.color} shrink-0`} />
              <span className="font-sans text-[11px] uppercase tracking-wider">{theme.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
