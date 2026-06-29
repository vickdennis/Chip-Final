import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  ShoppingBag, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  CreditCard, 
  CheckCircle2, 
  Coins, 
  Zap,
  Lock,
  Download
} from "lucide-react";

// Import custom high-fidelity generated covers
// @ts-ignore
import afrobeatsCover from "../assets/images/afrobeats_playbook_cover_1782716732861.jpg";
// @ts-ignore
import industrializingCover from "../assets/images/industrializing_africa_cover_1782716749515.jpg";
// @ts-ignore
import streetSmartCover from "../assets/images/street_smart_marketing_cover_1782716765883.jpg";
// @ts-ignore
import legacyCover from "../assets/images/legacy_philanthropist_cover_1782716781493.jpg";

interface Product {
  id: string;
  title: string;
  author: string;
  price: string;
  priceRaw: number;
  description: string;
  salesGoal: number;
  revenueGoal: number;
  coverGradient: string;
  coverImage: string;
  accentColor: string;
  category: string;
  icon: React.ReactNode;
}

export const DigitalStorefrontShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [revenueCount, setRevenueCount] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // High-fidelity digital ebooks tailored to Nigeria's leading titans
  const products: Product[] = [
    {
      id: "1",
      title: "The Afrobeats Playbook",
      author: "Davido & Wizkid",
      price: "₦5,000",
      priceRaw: 5000,
      description: "A masterclass on songwriting, stage presence, and taking African soundscapes to global arena stages.",
      salesGoal: 14820,
      revenueGoal: 74100000,
      coverGradient: "from-amber-500 via-rose-500 to-red-600",
      coverImage: afrobeatsCover,
      accentColor: "#F43F5E",
      category: "MUSIC & BRANDING",
      icon: <Sparkles className="w-5 h-5 text-rose-400" />
    },
    {
      id: "2",
      title: "Industrializing Africa",
      author: "Aliko Dangote",
      price: "₦15,000",
      priceRaw: 15000,
      description: "Strategic frameworks for developing local manufacturing capabilities, refining crude, and building continental scale.",
      salesGoal: 8420,
      revenueGoal: 126300000,
      coverGradient: "from-cyan-500 via-blue-600 to-indigo-700",
      coverImage: industrializingCover,
      accentColor: "#3B82F6",
      category: "BUSINESS LEADERSHIP",
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />
    },
    {
      id: "3",
      title: "Street-Smart Marketing",
      author: "Olamide (YBNL)",
      price: "₦4,500",
      priceRaw: 4500,
      description: "Grassroots audience development strategies, mentorship blueprints, and building the biggest labels from the trenches.",
      salesGoal: 19250,
      revenueGoal: 86625000,
      coverGradient: "from-emerald-400 via-teal-500 to-cyan-600",
      coverImage: streetSmartCover,
      accentColor: "#10B981",
      category: "CREATIVE STRATEGY",
      icon: <Coins className="w-5 h-5 text-emerald-400" />
    },
    {
      id: "4",
      title: "The Legacy Philanthropist",
      author: "Femi Otedola",
      price: "₦12,500",
      priceRaw: 12500,
      description: "A modern guide to impactful philanthropy, strategic market investments, energy independence, and power infrastructure.",
      salesGoal: 6110,
      revenueGoal: 76375000,
      coverGradient: "from-purple-500 via-indigo-600 to-pink-600",
      coverImage: legacyCover,
      accentColor: "#8B5CF6",
      category: "WEALTH & PHILANTHROPY",
      icon: <BookOpen className="w-5 h-5 text-purple-400" />
    }
  ];

  const getCyclicDiff = (index: number, active: number, total: number) => {
    let diff = index - active;
    const half = total / 2;
    if (diff > half) {
      diff -= total;
    } else if (diff <= -half) {
      diff += total;
    }
    return diff;
  };

  // Continuous vertical loop auto-play
  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 6000); // Transitions to next product every 6 seconds
  };

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  // Rapid dynamic count-up effect whenever the activeIndex centers a new card
  useEffect(() => {
    const currentProduct = products[activeIndex];
    
    // Animate sales count-up
    let startSales = Math.floor(currentProduct.salesGoal * 0.82);
    const endSales = currentProduct.salesGoal;
    const salesStep = Math.ceil((endSales - startSales) / 15);

    // Animate revenue count-up
    let startRevenue = Math.floor(currentProduct.revenueGoal * 0.82);
    const endRevenue = currentProduct.revenueGoal;
    const revenueStep = Math.ceil((endRevenue - startRevenue) / 15);

    setSalesCount(startSales);
    setRevenueCount(startRevenue);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      startSales = Math.min(startSales + salesStep, endSales);
      startRevenue = Math.min(startRevenue + revenueStep, endRevenue);
      
      setSalesCount(startSales);
      setRevenueCount(startRevenue);

      if (frame >= 15) {
        setSalesCount(endSales);
        setRevenueCount(endRevenue);
        clearInterval(interval);
      }
    }, 35); // Super smooth 500ms transition

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    resetAutoPlay();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 relative z-30 select-none px-4 overflow-visible">
      
      {/* Visual Title / Context Header */}
      <div className="text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
          <ShoppingBag className="w-4 h-4 text-[#B600A8] animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs tracking-widest text-white/80 uppercase">CREATOR ECONOMY ENGINE</span>
        </div>
        <h2 className="hero-heading font-sans font-black uppercase text-3xl sm:text-5xl md:text-6xl tracking-tight text-white mb-3 text-center leading-tight">
          MONETIZE <span className="text-[#B600A8]">YOUR BRAND</span> INSTANTLY
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#D7E2EA]/60 max-w-2xl leading-relaxed text-center mb-2">
          Sell ebooks, audio guides, custom courses, and digital materials with standard-setting, lightning-fast digital delivery portals integrated into your custom CHIP bio.
        </p>
      </div>

      {/* Main Vertical Showcase Canvas - Fixed Height for Professional Slide Motion */}
      <div className="relative w-full h-[480px] sm:h-[450px] md:h-[420px] flex items-center justify-center overflow-visible my-12">
        
        {/* Dynamic Theme Glow Underlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.25, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`absolute w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full filter blur-[100px] bg-gradient-to-tr ${products[activeIndex].coverGradient}`}
            />
          </AnimatePresence>
        </div>

        {/* Carousel scaling and layout container */}
        <div className="relative z-10 w-full max-w-2xl h-full flex items-center justify-center scale-[0.82] min-[440px]:scale-[0.88] sm:scale-[0.95] md:scale-100 origin-center transition-all duration-300">
          
          {products.map((p, idx) => {
            const diff = getCyclicDiff(idx, activeIndex, products.length);
            const isActive = diff === 0;
            const isAbove = diff === -1;
            const isBelow = diff === 1;
            const isFar = Math.abs(diff) > 1;

            // Calculate precise offsets to align cards perfectly in absolute space
            let yTranslation = 0;
            let scaleValue = 1;
            let opacityValue = 1;
            let rotateXValue = 0;
            let zIndexValue = 10;

            if (isActive) {
              yTranslation = 0;
              scaleValue = 1;
              opacityValue = 1;
              rotateXValue = 0;
              zIndexValue = 30;
            } else if (isAbove) {
              yTranslation = -140;
              scaleValue = 0.88;
              opacityValue = 0.35;
              rotateXValue = 12;
              zIndexValue = 10;
            } else if (isBelow) {
              yTranslation = 140;
              scaleValue = 0.88;
              opacityValue = 0.35;
              rotateXValue = -12;
              zIndexValue = 10;
            } else {
              // Far card positioned completely out of frame or blended
              yTranslation = diff > 0 ? 280 : -280;
              scaleValue = 0.75;
              opacityValue = 0;
              rotateXValue = diff > 0 ? -24 : 24;
              zIndexValue = 0;
            }

            return (
              <motion.div
                key={p.id}
                style={{
                  perspective: 1200,
                  transformStyle: "preserve-3d"
                }}
                animate={{
                  y: yTranslation,
                  scale: scaleValue,
                  opacity: opacityValue,
                  rotateX: rotateXValue,
                  zIndex: zIndexValue
                }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 18,
                  mass: 0.9
                }}
                onClick={() => handleCardClick(idx)}
                className="absolute w-full max-w-2xl cursor-pointer select-none origin-center"
              >
                
                {/* Floating Metric Badges attached to the top corners of the active center card */}
                <AnimatePresence>
                  {isActive && (
                    <>
                      {/* Left Badge: Total Sales */}
                      <motion.div
                        initial={{ opacity: 0, y: 15, x: -10 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
                        className="absolute -top-4.5 left-4 sm:left-8 z-40 bg-neutral-900 border border-white/10 rounded-full px-3.5 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-green-400" />
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase text-white/50 tracking-wider">SALES:</span>
                        <span className="font-sans font-black text-xs sm:text-sm text-white font-mono">
                          {salesCount.toLocaleString()}
                        </span>
                      </motion.div>

                      {/* Right Badge: Total Revenue */}
                      <motion.div
                        initial={{ opacity: 0, y: 15, x: 10 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
                        className="absolute -top-4.5 right-4 sm:right-8 z-40 bg-neutral-900 border border-white/10 rounded-full px-3.5 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-1.5"
                      >
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase text-white/50 tracking-wider">REVENUE:</span>
                        <span className="font-sans font-black text-xs sm:text-sm text-yellow-400 font-mono">
                          ₦{revenueCount.toLocaleString()}
                        </span>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Card Container */}
                <div className={`w-full bg-neutral-950/90 backdrop-blur-xl border ${
                  isActive ? "border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.9)]" : "border-white/5 shadow-md"
                } rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row items-stretch gap-6 transition-all duration-300 relative overflow-hidden`}>
                  
                  {/* Sheen effect on active card */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none animate-pulse" />
                  )}

                  {/* LEFT: Ebook Cover Illustration */}
                  <div className="w-full md:w-2/5 aspect-[3/4] rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-white/5 shadow-inner relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full rounded-[15px] bg-neutral-900 p-5 flex flex-col justify-between text-left relative overflow-hidden">
                      
                      {/* High-fidelity generated cover image */}
                      <img 
                        src={p.coverImage} 
                        alt={p.title} 
                        className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-110"
                        referrerPolicy="no-referrer"
                      />

                      {/* Smooth dark overlay vignette to pop text typography and design metadata */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 z-10 pointer-events-none" />

                      {/* Geometric grid design behind ebook cover */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),transparent)] pointer-events-none z-10" />
                      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px] z-10" />

                      {/* Cover Header */}
                      <div className="flex items-center justify-between relative z-20">
                        <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-widest text-white/95 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                        <BookOpen className="w-4 h-4 text-white/95" />
                      </div>

                      {/* Cover Book Details */}
                      <div className="relative z-20 flex flex-col gap-1.5 mt-auto">
                        <h3 className="font-sans font-black uppercase text-base sm:text-lg text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {p.title}
                        </h3>
                        <p className="font-mono text-[9px] sm:text-[10px] text-white/90 font-semibold tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          BY {p.author}
                        </p>
                        <div className="w-10 h-1 bg-white/40 rounded-full mt-1" />
                      </div>

                      {/* Ebook Spine Line Accent */}
                      <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-black/30 border-r border-white/10 z-20" />
                    </div>
                  </div>

                  {/* RIGHT: Product details (Title, price, buy/preview) */}
                  <div className="flex-1 flex flex-col justify-between text-left pt-2">
                    <div>
                      {/* Categories / Meta */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-[#B600A8] uppercase tracking-widest font-black flex items-center gap-1">
                          {p.icon} {p.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-mono text-[#D7E2EA]/40 uppercase tracking-wider">
                          DIGITAL ASSET
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3 className="font-sans font-black text-xl sm:text-2xl text-white tracking-tight leading-tight mb-2 uppercase">
                        {p.title}
                      </h3>

                      {/* Author */}
                      <p className="font-mono text-xs text-[#D7E2EA]/50 font-medium mb-3">
                        Author: <span className="text-white font-bold">{p.author}</span>
                      </p>

                      {/* Product description */}
                      <p className="font-sans text-xs sm:text-sm text-[#D7E2EA]/60 leading-relaxed mb-4 line-clamp-2 md:line-clamp-none">
                        {p.description}
                      </p>
                    </div>

                    {/* Price and Buttons */}
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-mono text-[9px] text-[#D7E2EA]/40 uppercase tracking-widest block">PRICE:</span>
                        <span className="font-sans font-black text-2xl text-white tracking-tight font-mono">
                          {p.price}
                        </span>
                        <span className="text-xs text-green-400 font-mono font-bold">
                          • INSTANT DOWNLOAD
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Downloading digital preview of "${p.title}"...`);
                          }}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-xl font-sans font-bold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Redirecting to live payment for "${p.title}" at ${p.price}...`);
                          }}
                          className="flex-1 py-3 bg-[#B600A8] hover:bg-[#a10095] text-white rounded-xl font-sans font-black text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/30"
                        >
                          <Download className="w-3.5 h-3.5" /> Buy Book
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </motion.div>
            );
          })}

        </div>

      </div>

      {/* FOOTER TEXT: Massive Outline/Gradient Glimmer Text with Zoom/Fade reveal */}
      <div className="w-full flex flex-col items-center justify-center border-t border-white/5 pt-16 mt-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h3 
            className="font-sans font-black uppercase text-center text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none text-white select-none relative"
            style={{
              textShadow: "0 0 40px rgba(182, 0, 168, 0.15)"
            }}
          >
            SELL <span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-[#B600A8] via-[#FF5BF4] to-[#B600A8] animate-[pulse_3.5s_infinite]"
              style={{
                backgroundImage: "linear-gradient(90deg, #B600A8, #FF5BF4, #B600A8)",
                backgroundSize: "200% auto"
              }}
            >DIGITAL</span> PRODUCTS
          </h3>
          <p className="font-mono text-[9px] sm:text-xs tracking-[0.35em] text-[#B600A8] uppercase font-bold mt-4 flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[#B600A8] animate-ping" />
            INSTANT ACCESS • AUTOMATED PAYOUTS • GLOBAL REACH
          </p>
        </motion.div>
      </div>

    </div>
  );
};
