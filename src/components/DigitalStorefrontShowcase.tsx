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
  Unlock,
  Download,
  X,
  Check,
  ShieldAlert,
  Printer
} from "lucide-react";

// @ts-ignore
import { supabase } from "../supabaseClient";
import { ebooksData } from "../utils/ebooksData";

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

  // Modals & checkout state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Securing your payment session...");

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

  // Fetch logged in user to register the seller_id as the user themselves
  // This lets creators test-drive their bio shop and immediately see sales on their charts!
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          // Auto fill name/email if logged in
          setBuyerEmail(user.email || "");
          setBuyerName(user.user_metadata?.full_name || "");
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };
    fetchUser();
  }, []);

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
    }, 8000); // Transitions to next product every 8 seconds
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

  // Ebook auto-download handler
  const triggerEbookDownload = (bookId: string, title: string) => {
    const book = ebooksData.find(b => b.id === bookId);
    if (!book) return;

    setIsDownloading(true);
    setTimeout(() => {
      const blob = new Blob([book.content], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeTitle}_ebook.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsDownloading(false);
    }, 800);
  };

  // Simulated Paystack checkout submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail || !buyerName) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!selectedProduct) return;

    setCheckoutStep("processing");
    
    // Animate step messages
    const messages = [
      "Connecting to Paystack secure channel...",
      "Validating customer card credentials...",
      "Authorizing ₦" + selectedProduct.priceRaw.toLocaleString() + " transaction...",
      "Writing purchase record to secure database...",
      "Generating your premium digital access keys..."
    ];

    let currentMsgIdx = 0;
    const messageInterval = setInterval(() => {
      currentMsgIdx++;
      if (currentMsgIdx < messages.length) {
        setProcessingMessage(messages[currentMsgIdx]);
      }
    }, 900);

    // Dynamic ref
    const ref = "CHIP-" + Math.floor(100000000 + Math.random() * 900000000);
    setPaymentReference(ref);

    try {
      // Simulate network wait
      await new Promise(resolve => setTimeout(resolve, 4500));
      clearInterval(messageInterval);

      // Register purchase in Supabase
      // Check if user is logged in, else look for standard seller_id
      const sellerId = currentUser ? currentUser.id : "2e60a0a1-7c33-4d3a-9940-073f4417ec89"; // fallback default admin
      
      const { error: dbError } = await supabase.from('purchases').insert({
        seller_id: sellerId,
        buyer_email: buyerEmail,
        amount: selectedProduct.priceRaw,
        platform_fee: selectedProduct.priceRaw * 0.05,
        net_earnings: selectedProduct.priceRaw * 0.95,
        reference: ref,
        status: 'success',
        purchase_type: 'digital_product'
      });

      if (dbError) {
        console.warn("Database registration warning (still triggering download):", dbError);
      }

      setCheckoutStep("success");
      // Auto-trigger the book download immediately for maximum convenience
      triggerEbookDownload(selectedProduct.id, selectedProduct.title);
    } catch (err) {
      console.error("Checkout process error:", err);
      clearInterval(messageInterval);
      alert("There was an issue securely registering your checkout. Please try again.");
      setCheckoutStep("form");
    }
  };

  const activeEbook = ebooksData.find(b => b.id === products[activeIndex].id);

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
                            setSelectedProduct(p);
                            setShowReaderModal(true);
                          }}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-xl font-sans font-bold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Read Preview
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(p);
                            setCheckoutStep("form");
                            setShowCheckoutModal(true);
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

      {/* --- FLOATING PREMIUM CHECKOUT MODAL (PAYSTACK SIMULATOR) --- */}
      <AnimatePresence>
        {showCheckoutModal && selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark glass-morphism backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl z-10 text-left"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3 h-3" /> Secure Paystack Gateway
                  </span>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps */}
              <div className="p-6">
                
                {/* STEP 1: Billing details Form */}
                {checkoutStep === "form" && (
                  <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                    {/* Ebook Context Card */}
                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-3.5 mb-2">
                      <img 
                        src={selectedProduct.coverImage} 
                        alt={selectedProduct.title} 
                        className="w-14 aspect-[3/4] object-cover rounded-lg shadow-md shrink-0" 
                      />
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[#B600A8] uppercase tracking-wider block mb-0.5">
                          {selectedProduct.category}
                        </span>
                        <h4 className="font-sans font-black text-white text-sm uppercase leading-tight line-clamp-1">
                          {selectedProduct.title}
                        </h4>
                        <p className="font-mono text-[10px] text-neutral-400 font-medium">
                          By {selectedProduct.author}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="font-sans font-black text-sm text-white font-mono">{selectedProduct.price}</span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                            Instant Access
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-sans font-bold text-white text-sm uppercase tracking-tight mb-1">
                      Billing Information
                    </h3>

                    {/* Form Inputs */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="e.g. Aliko Dangote"
                        className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-[#B600A8] focus:ring-1 focus:ring-[#B600A8] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-150"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-[#B600A8] focus:ring-1 focus:ring-[#B600A8] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-150"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="+234 803 123 4567"
                        className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-[#B600A8] focus:ring-1 focus:ring-[#B600A8] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-150"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#B600A8] hover:bg-[#a10095] text-white rounded-xl font-sans font-black text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-900/30"
                    >
                      <CreditCard className="w-4 h-4" /> Secure Payment • {selectedProduct.price}
                    </button>

                    <p className="font-sans text-[10px] text-neutral-500 text-center leading-relaxed px-2 mt-1">
                      Your payment is processed through a bank-grade secured network. The guide downloads automatically in your browser after checkout.
                    </p>
                  </form>
                )}

                {/* STEP 2: Processing payment screen */}
                {checkoutStep === "processing" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-[#B600A8] border-t-transparent animate-spin" />
                    </div>
                    <h3 className="font-sans font-black text-white text-base uppercase tracking-tight mb-2">
                      Processing Transaction
                    </h3>
                    <p className="font-mono text-[10px] text-[#B600A8] uppercase tracking-widest animate-pulse font-bold">
                      {processingMessage}
                    </p>
                    <p className="font-sans text-xs text-neutral-400 mt-6 max-w-xs">
                      Please do not refresh the page or close this dialog. Establishing secure server pipeline...
                    </p>
                  </div>
                )}

                {/* STEP 3: Checkout Success */}
                {checkoutStep === "success" && (
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 shadow-inner animate-[bounce_1s_1]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h3 className="font-sans font-black text-white text-lg uppercase tracking-tight mb-1">
                      Payment Successful!
                    </h3>
                    <p className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-4">
                      Reference: {paymentReference}
                    </p>

                    <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-left mb-6">
                      <p className="font-sans text-xs text-neutral-300 leading-relaxed">
                        Thank you for your purchase, <strong className="text-white">{buyerName}</strong>! Your transaction was approved by Paystack and logged to our central ledger.
                      </p>
                      <p className="font-sans text-xs text-neutral-300 leading-relaxed mt-2">
                        Your guidebook <strong className="text-white">"{selectedProduct.title}"</strong> was successfully delivered to <strong className="text-white">{buyerEmail}</strong>.
                      </p>
                    </div>

                    {/* Download controller button */}
                    <button
                      onClick={() => triggerEbookDownload(selectedProduct.id, selectedProduct.title)}
                      disabled={isDownloading}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-sans font-black text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Downloading Ebook...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 animate-bounce" /> Download Guidebook Again
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="mt-4 text-xs font-mono text-neutral-400 hover:text-white transition-all cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IN-APP STUNNING PREVIEW READER DIALOG --- */}
      <AnimatePresence>
        {showReaderModal && selectedProduct && activeEbook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReaderModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Reader Card Body */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-3xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col text-left"
            >
              {/* Reader Header */}
              <div className="px-6 py-4 bg-neutral-950/70 border-b border-neutral-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#B600A8]" />
                  <div>
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest font-bold">CHIP DIGITAL READER (PREVIEW)</span>
                    <h3 className="font-sans font-black text-sm uppercase text-white leading-none mt-0.5">{selectedProduct.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowReaderModal(false);
                      setCheckoutStep("form");
                      setShowCheckoutModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#B600A8] hover:bg-[#a10095] text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3 h-3" /> Unlock Full Book
                  </button>
                  <button
                    onClick={() => setShowReaderModal(false)}
                    className="p-1 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reader Scrollable Viewport */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white relative">
                
                {/* Book Header in Reader */}
                <div className="text-center border-b border-neutral-200 pb-8 mb-8">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B600A8] font-bold">CHIP Premium Release</p>
                  <h1 className="font-sans font-black text-3xl sm:text-4xl text-neutral-900 uppercase tracking-tight mt-2 mb-1">
                    {selectedProduct.title}
                  </h1>
                  <p className="text-neutral-500 font-serif italic text-sm">By {selectedProduct.author}</p>
                </div>

                {/* Chapter Content Rendering */}
                <div className="font-serif text-neutral-800 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto flex flex-col gap-6">
                  <h2 className="font-sans font-bold text-neutral-900 text-xl border-b border-neutral-100 pb-2 uppercase tracking-wide">
                    Chapter 1: The Foundation Blueprint
                  </h2>
                  <p>
                    Every massive entrepreneurial and cultural empire starts with a clear foundational strategy. Many creators focus on the superficial aesthetics of their brand—the logo, the color palette, and social media banners—without solidifying the core value proposition.
                  </p>
                  <p>
                    Whether you are developing a global afrobeats hit record, building Aliko Dangote's backward integration industrial factories, using YBNL street-smart marketing, or structuring Otedola's massive legacy philanthropy portfolios, you must respect the golden rule: **Value must precede monetization**.
                  </p>
                  <p>
                    To capture attention in highly saturated emerging markets like Nigeria, your brand voice must be uniquely authentic. Do not copy global templates blindly. The key to global scalability lies in magnifying your local roots and providing instant, undeniable utility.
                  </p>
                  
                  {/* Glassmorphism masking with locked state */}
                  <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-20 flex flex-col justify-end items-center pb-12">
                    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-center flex flex-col items-center pointer-events-auto">
                      <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-[#B600A8] mb-3">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider mb-1">
                        Subsequent Chapters Locked
                      </h4>
                      <p className="font-sans text-[11px] text-neutral-400 mb-4 max-w-xs leading-relaxed">
                        Purchase "The {selectedProduct.title}" for {selectedProduct.price} to unlock all 5 premium, complete strategic chapters, checklists, and printable templates!
                      </p>
                      
                      <button
                        onClick={() => {
                          setShowReaderModal(false);
                          setCheckoutStep("form");
                          setShowCheckoutModal(true);
                        }}
                        className="w-full py-2.5 bg-[#B600A8] hover:bg-[#a10095] text-white rounded-xl font-sans font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Buy Book to Unlock • {selectedProduct.price}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
