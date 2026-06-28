import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Eye, 
  Wifi, 
  ArrowUpRight, 
  Sparkles, 
  Users, 
  Briefcase, 
  DollarSign, 
  Award,
  MousePointerClick,
  Heart,
  Share2,
  Music,
  Instagram,
  Zap,
  Tv,
  Globe,
  ShieldCheck,
  UserPlus
} from "lucide-react";

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

interface ProfileData {
  id: string;
  name: string;
  handle: string;
  title: string;
  headline: string;
  followers: string;
  followersNumber: number;
  themeColor: string; // Tailwind gradient classes
  avatarBg: string;
  metrics: {
    views: number;
    viewsLabel: string;
    ctr: string;
    growth: string;
    taps: string;
    specialMetric: {
      label: string;
      value: string;
      icon: React.ReactNode;
    }
  };
  chartData: number[]; // Array out of 100
  timeline: string[];
  buttons: { label: string; desc: string }[];
  floatingWidget1: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    isMusic?: boolean;
  };
  floatingWidget2: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    isFollowers?: boolean;
  };
}

export const NigeriaAnalyticsShowcase = () => {
  const [activeProfileId, setActiveProfileId] = useState<string>("davido");
  const [tapActive, setTapActive] = useState(false);
  const [liveViewsOffset, setLiveViewsOffset] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // High-fidelity profile data for the 5 prominent Nigerian figures
  const profiles: ProfileData[] = [
    {
      id: "davido",
      name: "Davido",
      handle: "@davido",
      title: "Afrobeats Legend & DMW Boss",
      headline: "We rise by lifting others. Creating hits & paving ways globally.",
      followers: "28.7M",
      followersNumber: 28740210,
      themeColor: "from-amber-500 via-rose-500 to-red-600",
      avatarBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      metrics: {
        views: 1845920,
        viewsLabel: "1.84M",
        ctr: "24.8%",
        growth: "+45K/wk",
        taps: "124,000",
        specialMetric: {
          label: "Streams Generated",
          value: "950M+",
          icon: <Sparkles className="w-4 h-4 text-amber-400" />
        }
      },
      chartData: [25, 45, 35, 75, 55, 95, 85],
      timeline: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      buttons: [
        { label: "Stream \"Unavailable\"", desc: "DMW Global Hits Release" },
        { label: "Book DMW World Tour", desc: "Arena Ticket Reservation Portals" },
        { label: "Donate to Davido Foundation", desc: "Supporting Orphanages in Nigeria" }
      ],
      floatingWidget1: {
        title: "Now Playing",
        subtitle: "UNAVAILABLE - DAVIDO",
        icon: <Music className="w-5 h-5 animate-pulse" />,
        isMusic: true
      },
      floatingWidget2: {
        title: "@davido",
        subtitle: "Verified Creator",
        icon: <Instagram className="w-4.5 h-4.5" />,
        isFollowers: true
      }
    },
    {
      id: "wizkid",
      name: "Wizkid",
      handle: "@wizkidayo",
      title: "Grammy Winner & Starboy CEO",
      headline: "Spread love, make music. Pioneering Afrobeats to the universe.",
      followers: "19.4M",
      followersNumber: 19412890,
      themeColor: "from-indigo-500 via-purple-600 to-pink-500",
      avatarBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      metrics: {
        views: 2412800,
        viewsLabel: "2.41M",
        ctr: "28.2%",
        growth: "+58K/wk",
        taps: "186,000",
        specialMetric: {
          label: "Spotify Plays",
          value: "1.2B+",
          icon: <Award className="w-4 h-4 text-purple-400" />
        }
      },
      chartData: [40, 35, 65, 50, 80, 70, 98],
      timeline: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      buttons: [
        { label: "Stream \"Morayo\"", desc: "New Masterpiece Album Out Now" },
        { label: "Starboy Official Merch", desc: "Premium limited streetwear" },
        { label: "Apple Music Essentials", desc: "Official Starboy playlist hub" }
      ],
      floatingWidget1: {
        title: "Now Playing",
        subtitle: "ESSENCE - WIZKID Ft. TEMS",
        icon: <Music className="w-5 h-5" />,
        isMusic: true
      },
      floatingWidget2: {
        title: "@wizkidayo",
        subtitle: "Starboy verified",
        icon: <Instagram className="w-4.5 h-4.5" />,
        isFollowers: true
      }
    },
    {
      id: "olamide",
      name: "Olamide",
      handle: "@olamide",
      title: "Street-Pop King & YBNL Founder",
      headline: "Voice of the streets, mentoring the next generation of African giants.",
      followers: "12.3M",
      followersNumber: 12328100,
      themeColor: "from-emerald-400 via-teal-500 to-cyan-600",
      avatarBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      metrics: {
        views: 1215400,
        viewsLabel: "1.21M",
        ctr: "19.5%",
        growth: "+28K/wk",
        taps: "92,500",
        specialMetric: {
          label: "Talents Launched",
          value: "15+ Leaders",
          icon: <Users className="w-4 h-4 text-emerald-400" />
        }
      },
      chartData: [20, 50, 45, 85, 40, 90, 75],
      timeline: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      buttons: [
        { label: "YBNL Nation Releases", desc: "Asake, Fireboy & Olamide hits" },
        { label: "YBNL Empire Portal", desc: "Global distribution & labels" },
        { label: "Songwriter Mentorship", desc: "Creative street rhythm academy" }
      ],
      floatingWidget1: {
        title: "Now Playing",
        subtitle: "AMAPLANO - OLAMIDE Ft. ASAKE",
        icon: <Music className="w-5 h-5" />,
        isMusic: true
      },
      floatingWidget2: {
        title: "@olamide",
        subtitle: "YBNL Pioneer",
        icon: <Instagram className="w-4.5 h-4.5" />,
        isFollowers: true
      }
    },
    {
      id: "dangote",
      name: "Aliko Dangote",
      handle: "@aliko_dangote",
      title: "President, Dangote Group",
      headline: "Industrializing Africa. Building self-sufficiency and economic pride.",
      followers: "3.5M",
      followersNumber: 3520000,
      themeColor: "from-cyan-600 via-blue-700 to-indigo-800",
      avatarBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      metrics: {
        views: 852100,
        viewsLabel: "852K",
        ctr: "14.2%",
        growth: "+12K/wk",
        taps: "48,200",
        specialMetric: {
          label: "Industrial Sites",
          value: "32 Nations",
          icon: <Briefcase className="w-4 h-4 text-cyan-400" />
        }
      },
      chartData: [30, 40, 45, 50, 65, 60, 80],
      timeline: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      buttons: [
        { label: "Dangote Refinery Tours", desc: "World's largest single-train site" },
        { label: "Investor Portal Hub", desc: "Dangote Cement PLC financials" },
        { label: "Dangote Foundation Grants", desc: "Improving African health & education" }
      ],
      floatingWidget1: {
        title: "Live Stock Price",
        subtitle: "DANGCEM: ₦650.00 (+1.2%)",
        icon: <TrendingUp className="w-5 h-5 text-green-400" />,
        isMusic: false
      },
      floatingWidget2: {
        title: "Dangote Group",
        subtitle: "Industrial Network",
        icon: <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" />,
        isFollowers: false
      }
    },
    {
      id: "otedola",
      name: "Femi Otedola",
      handle: "@femiotedola",
      title: "Philanthropist & Energy Titan",
      headline: "Legacy, strategic philanthropy, and investing in sustainable growth.",
      followers: "2.2M",
      followersNumber: 2210400,
      themeColor: "from-slate-400 via-zinc-600 to-neutral-800",
      avatarBg: "bg-slate-400/10 border-slate-400/30 text-slate-300",
      metrics: {
        views: 524000,
        viewsLabel: "524K",
        ctr: "16.8%",
        growth: "+8K/wk",
        taps: "35,100",
        specialMetric: {
          label: "Philanthropy Grants",
          value: "₦12.5B+",
          icon: <DollarSign className="w-4 h-4 text-slate-300" />
        }
      },
      chartData: [15, 30, 45, 40, 70, 65, 88],
      timeline: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      buttons: [
        { label: "Geregu Power PLC Board", desc: "Clean power generation outputs" },
        { label: "Scholarship Fund", desc: "₦12.5B historic tertiary grants" },
        { label: "Strategic Acquisitions", desc: "FBN Holdings energy investment" }
      ],
      floatingWidget1: {
        title: "Grid Output",
        subtitle: "GEREGU: 435 MW ACTIVE",
        icon: <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />,
        isMusic: false
      },
      floatingWidget2: {
        title: "Otedola Grants",
        subtitle: "Impact Circle",
        icon: <Heart className="w-4.5 h-4.5 text-rose-400 fill-current" />,
        isFollowers: false
      }
    }
  ];

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Auto rotation scheduler that repeats transitions continuously
  const resetAutoRotation = () => {
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
    }
    autoRotateTimerRef.current = setInterval(() => {
      triggerTransitionToNext();
    }, 6000); // Cycles every 6 seconds repeatedly
  };

  const triggerTransitionToNext = () => {
    setTapActive(true);
    setTimeout(() => setTapActive(false), 1500);

    setActiveProfileId((prev) => {
      const currentIndex = profiles.findIndex(p => p.id === prev);
      const nextIndex = (currentIndex + 1) % profiles.length;
      return profiles[nextIndex].id;
    });
    setLiveViewsOffset(0);
  };

  useEffect(() => {
    resetAutoRotation();
    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
    };
  }, []);

  // Ticks the view count up slightly live to look realistic
  useEffect(() => {
    const viewsTimer = setInterval(() => {
      setLiveViewsOffset(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 2800);
    return () => clearInterval(viewsTimer);
  }, []);

  const handleManualProfileSelect = (id: string) => {
    if (id === activeProfileId) return;
    setTapActive(true);
    setTimeout(() => setTapActive(false), 1500);
    setActiveProfileId(id);
    setLiveViewsOffset(0);
    resetAutoRotation(); // Refreshes the interval so it doesn't skip immediately after selection
  };

  // SVG Bezier path constructor for morphing line graphs
  const generateSvgPath = (data: number[], width: number, height: number, closePath: boolean = false) => {
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / 100) * height;
      return { x, y };
    });

    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    if (closePath) {
      path += ` L ${width} ${height} L 0 ${height} Z`;
    }
    return path;
  };

  const chartWidth = 500;
  const chartHeight = 160;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 relative z-30 select-none px-4 overflow-hidden">
      
      {/* 1. Header Title & Ambient Decor */}
      <div className="text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
          <TrendingUp className="w-4 h-4 text-[#B600A8] animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs tracking-widest text-white/80 uppercase">CHIP REAL-TIME TELEMETRY</span>
        </div>
        <h2 className="hero-heading font-sans font-black uppercase text-3xl sm:text-5xl md:text-6xl tracking-tight text-white mb-4 text-center leading-tight">
          REALTIME <span className="text-[#B600A8]">ANALYTICS</span>
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#D7E2EA]/60 max-w-2xl leading-relaxed text-center">
          Tap through the live telemetry profiles below to observe our custom digital analytics engine monitoring real-time bio engagement metrics across Nigeria's leading icons.
        </p>
      </div>

      {/* 2. Horizontal Profile Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          return (
            <button
              key={p.id}
              onClick={() => handleManualProfileSelect(p.id)}
              className={`relative px-4 py-2 sm:px-6 sm:py-3 rounded-full font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                isActive 
                  ? "text-black font-black shadow-lg shadow-white/10 scale-105" 
                  : "bg-white/5 text-[#D7E2EA]/50 border border-white/5 hover:text-white hover:bg-white/10"
              }`}
            >
              {isActive && (
                <motion.span 
                  layoutId="activeTabIndicatorNigeria"
                  className="absolute inset-0 bg-white rounded-full z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${p.themeColor} animate-pulse`} />
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Stage: Left Mock Phone & Floating Cards | Right Analytics Telemetry Panel */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-4">
        
        {/* ================= LEFT SECTION: Animated Phone & Floating Widgets ================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[500px] sm:min-h-[580px] overflow-visible">
          
          {/* Background Radial Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProfileId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.25, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full filter blur-[80px] sm:blur-[120px] bg-gradient-to-tr ${activeProfile.themeColor}`}
              />
            </AnimatePresence>
          </div>

          {/* BACKGROUND RIPPLE TAP SYSTEM */}
          <AnimatePresence>
            {tapActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-10">
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    initial={{ width: 60, height: 60, opacity: 0.9, border: "2px solid rgba(255, 255, 255, 0.4)" }}
                    animate={{ 
                      width: [60, 420, 750], 
                      height: [60, 420, 750], 
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

          {/* FLOATING ITEM 1: Soundbar/Music Ticker */}
          <FloatingItem 
            delay={0.2} 
            duration={5.5} 
            yRange={[-10, 10]} 
            className="absolute left-[2%] sm:left-[6%] top-[10%] sm:top-[12%] z-30 pointer-events-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex items-center gap-3 bg-[#111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] max-w-[160px] sm:max-w-[190px]"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activeProfile.themeColor} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                {activeProfile.floatingWidget1.icon}
              </div>
              <div className="overflow-hidden text-left">
                <h4 className="font-sans font-bold text-[10px] sm:text-xs text-white truncate uppercase tracking-tight">
                  {activeProfile.floatingWidget1.title}
                </h4>
                {activeProfile.floatingWidget1.isMusic ? (
                  <p className="font-mono text-[8px] sm:text-[9px] text-green-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <span className="flex gap-0.5 items-end h-2 w-3">
                      <span className="w-0.5 h-1.5 bg-green-400 animate-[bounce_1s_infinite]" />
                      <span className="w-0.5 h-3 bg-green-400 animate-[bounce_0.7s_infinite_0.2s]" />
                      <span className="w-0.5 h-2 bg-green-400 animate-[bounce_0.8s_infinite_0.4s]" />
                    </span>
                    ENGAGEMENT ACTIVE
                  </p>
                ) : (
                  <p className="font-sans text-[8px] sm:text-[9px] text-[#D7E2EA]/60 truncate leading-none mt-1">
                    {activeProfile.floatingWidget1.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </FloatingItem>

          {/* FLOATING ITEM 2: Social/Followers Stat Badge */}
          <FloatingItem 
            delay={0.8} 
            duration={6.2} 
            yRange={[10, -10]} 
            className="absolute left-[1%] sm:left-[4%] bottom-[12%] sm:bottom-[16%] z-30 pointer-events-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: 4 }}
              className="flex flex-col gap-1.5 bg-[#111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-left min-w-[140px] sm:min-w-[160px]"
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activeProfile.themeColor} flex items-center justify-center text-white shrink-0`}>
                  {activeProfile.floatingWidget2.icon}
                </div>
                <div>
                  <span className="font-sans font-black text-[11px] sm:text-xs text-white">
                    {activeProfile.floatingWidget2.title}
                  </span>
                  <span className="text-[8px] text-[#D7E2EA]/50 block uppercase tracking-wider font-mono">
                    {activeProfile.floatingWidget2.subtitle}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/5 pt-1.5 mt-0.5 flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#D7E2EA]/60 uppercase">NETWORK</span>
                {activeProfile.floatingWidget2.isFollowers ? (
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-white tracking-tight">
                    {activeProfile.followers}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-[#B600A8] tracking-tight">
                    NFC CONNECTED
                  </span>
                )}
              </div>
            </motion.div>
          </FloatingItem>

          {/* FLOATING ITEM 3: Live Connect Button Widget */}
          <FloatingItem 
            delay={1.2} 
            duration={5.8} 
            yRange={[8, -8]} 
            className="absolute right-[2%] sm:right-[6%] bottom-[18%] sm:bottom-[22%] z-30 pointer-events-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: 4 }}
              onClick={triggerTransitionToNext}
              className="flex items-center gap-3 bg-[#111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-pointer max-w-[150px] sm:max-w-[180px] text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B600A8] to-purple-800 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-[10px] sm:text-xs text-white truncate uppercase tracking-tight">Save Profile</h4>
                <p className="font-sans text-[8px] text-white/50 leading-tight">Add physical contact to device</p>
              </div>
            </motion.div>
          </FloatingItem>

          {/* SMARTPHONE FRAME (CENTERED) */}
          <motion.div 
            animate={{
              y: [-6, 6, -6],
              rotate: [-0.5, 0.5, -0.5]
            }}
            transition={{
              y: { duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
              rotate: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
            className="relative z-20 w-[220px] sm:w-[260px] aspect-[9/18.5] bg-neutral-950 rounded-[38px] p-2.5 shadow-[0_45px_100px_rgba(0,0,0,0.95)] border-4 border-neutral-800 flex flex-col overflow-hidden"
          >
            {/* Gloss Screen overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30 rounded-[32px]" />

            {/* Smartphone speaker notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800/50 flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-blue-950 rounded-full" />
              </div>
              <div className="w-3.5 h-0.5 bg-neutral-900 rounded-full ml-1" />
            </div>

            {/* BIO LINK MOBILE SCREEN VIEWPORT */}
            <div className="relative flex-1 w-full h-full rounded-[28px] overflow-hidden flex flex-col justify-between pt-9 pb-3.5 px-3 sm:px-3.5 transition-all duration-700 select-none">
              
              {/* Dynamic screen backdrop gradient */}
              <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProfileId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 bg-[#0B0B0C] flex flex-col items-center justify-center">
                      <div className={`absolute w-24 h-24 rounded-full bg-gradient-to-tr ${activeProfile.themeColor} opacity-20 filter blur-xl animate-pulse`} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Screen Content */}
              <div className="relative z-10 flex flex-col justify-between h-full text-center">
                
                {/* 3a. Top Header: Avatar & Verified Badge */}
                <div className="flex flex-col items-center pt-1.5">
                  <div className="relative mb-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeProfileId}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 rounded-full p-[1.5px] shadow-xl flex items-center justify-center bg-gradient-to-tr ${activeProfile.themeColor}`}
                      >
                        <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-white font-sans font-black text-sm">
                          {activeProfile.name.charAt(0)}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5 border border-neutral-950 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProfileId}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -5, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h3 className="font-sans font-black uppercase text-xs text-white tracking-tight flex items-center gap-1 justify-center leading-none">
                        {activeProfile.name}
                      </h3>
                      <p className="font-mono text-[8px] uppercase tracking-wider text-[#D7E2EA]/50 mt-1">
                        {activeProfile.handle}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 3b. Center Section: Profile Buttons */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 pt-3 pb-2 w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProfileId}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        visible: { transition: { staggerChildren: 0.08 } }
                      }}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      {activeProfile.buttons.map((btn, idx) => (
                        <motion.div
                          key={idx}
                          variants={{
                            hidden: { opacity: 0, x: -10, scale: 0.95 },
                            visible: { opacity: 1, x: 0, scale: 1 }
                          }}
                          transition={{ type: "spring", stiffness: 120, damping: 14 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={triggerTransitionToNext}
                          className={`w-full py-1.5 px-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200 bg-white/5 border border-white/10 hover:bg-white/10`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden text-left">
                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-tr ${activeProfile.themeColor}`} />
                            <div className="overflow-hidden">
                              <span className="font-sans font-bold text-[9px] sm:text-[10px] tracking-tight uppercase block leading-none text-white truncate">
                                {btn.label}
                              </span>
                              <span className="text-[7px] text-[#D7E2EA]/40 uppercase tracking-wide block mt-0.5 leading-none truncate">
                                {btn.desc}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] text-[#D7E2EA]/30">→</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 3c. Bottom Bar: Contacts Link Button */}
                <div className="w-full flex justify-between items-center border-t border-white/5 pt-2 flex-wrap gap-1">
                  <div className="flex gap-1.5">
                    <Instagram className="w-3 h-3 text-[#D7E2EA]/50 hover:text-white transition-colors cursor-pointer" />
                    <Tv className="w-3 h-3 text-[#D7E2EA]/50 hover:text-white transition-colors cursor-pointer" />
                    <Globe className="w-3 h-3 text-[#D7E2EA]/50 hover:text-white transition-colors cursor-pointer" />
                  </div>
                  <button 
                    onClick={triggerTransitionToNext}
                    className="px-2 py-1 bg-white text-black hover:bg-neutral-200 rounded-full font-sans font-black text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all leading-none"
                  >
                    <Wifi className="w-2.5 h-2.5 animate-pulse" />
                    TAP LINK
                  </button>
                </div>

              </div>
            </div>
          </motion.div>

          {/* FLOATING SUCCESS TRANFER BANNER */}
          <AnimatePresence>
            {tapActive && (
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 180, damping: 15 }}
                className="absolute top-4 z-50 bg-black border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] px-4 py-2 rounded-full flex items-center gap-2"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${activeProfile.themeColor} flex items-center justify-center text-white shadow-md shadow-white/10`}>
                  <Zap className="w-3 h-3 fill-current" />
                </div>
                <div className="text-left">
                  <span className="font-sans font-black text-[10px] text-white uppercase tracking-tight block leading-none">
                    Synced {activeProfile.name}'s Live Feed
                  </span>
                  <span className="text-[7px] text-[#D7E2EA]/50 uppercase tracking-wider font-mono">
                    TELEMETRY CONNECTION SECURED (0.4ms)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ================= RIGHT SECTION: Dynamic Analytics Telemetry Panel ================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Main Glass Analytics Telemetry Board */}
          <motion.div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full relative rounded-3xl border border-white/10 bg-neutral-950/85 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] hover:border-white/20 transition-all duration-500"
          >
            {/* Neon Background lighting flare inside telemetry card */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className={`absolute -right-32 -top-32 w-72 h-72 rounded-full bg-gradient-to-br ${activeProfile.themeColor} filter blur-[100px] opacity-20 transition-all duration-1000`} />
              <div className="absolute -left-32 -bottom-32 w-72 h-72 rounded-full bg-indigo-500/10 filter blur-[100px]" />
            </div>

            {/* Inner dynamic tech metadata borders */}
            <div className="absolute top-4 left-6 text-[8px] font-mono text-white/10 tracking-[0.25em]">TELEMETRY MODULE: Active</div>
            <div className="absolute top-4 right-6 text-[8px] font-mono text-white/10 tracking-[0.25em]">SECURE CHIP-NFC LINK</div>

            {/* Header portion */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6 pt-4">
              
              {/* Profile details */}
              <div className="flex items-center gap-4 text-left">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeProfile.themeColor} p-[1.5px] shadow-lg relative shrink-0`}>
                  <div className="w-full h-full rounded-[14px] bg-[#0c0c0c] flex items-center justify-center font-sans font-black text-white text-lg sm:text-xl">
                    {activeProfile.name.charAt(0)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-neutral-950 flex items-center justify-center animate-pulse">
                    <span className="w-1 rounded-full bg-white" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black text-lg text-white leading-none">
                      {activeProfile.name}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-400 font-mono text-[9px] font-bold uppercase tracking-wide">
                      VERIFIED
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#D7E2EA]/50 mt-1">{activeProfile.handle}</span>
                  <span className="font-sans text-[11px] text-white/70 mt-1 uppercase tracking-wide font-medium">{activeProfile.title}</span>
                </div>
              </div>

              {/* Follower stats bubble */}
              <div className="flex flex-col bg-white/5 border border-white/5 rounded-2xl p-3 px-4 self-start text-left">
                <span className="font-mono text-[9px] text-[#D7E2EA]/40 uppercase tracking-widest leading-none block mb-1">AUDIENCE</span>
                <span className="font-sans font-black text-lg text-white leading-none tracking-tight">
                  {activeProfile.followers}
                </span>
                <span className="font-mono text-[10px] text-green-400 font-bold block mt-1 text-left">
                  {activeProfile.metrics.growth}
                </span>
              </div>

            </div>

            {/* Profile bio headline */}
            <p className="relative z-10 font-sans text-xs sm:text-sm text-white/60 leading-relaxed italic mb-6 max-w-xl text-left">
              "{activeProfile.headline}"
            </p>

            {/* HIGH-FIDELITY ANIMATED CHART FIELD */}
            <div className="relative z-10 bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 mb-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#D7E2EA]/60 font-bold">24H Live Link Engagement</span>
                </div>
                <div className="font-mono text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm">
                  PEAK RATE: {Math.max(...activeProfile.chartData)}%
                </div>
              </div>

              {/* Dynamic SVG chart viewport */}
              <div className="w-full h-40 relative">
                <svg 
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`chartGlow-${activeProfile.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B600A8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#B600A8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id={`gradientStroke-${activeProfile.id}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid guide lines */}
                  {[0, 25, 50, 75, 100].map((gridVal, idx) => {
                    const y = chartHeight - (gridVal / 100) * chartHeight;
                    return (
                      <line 
                        key={idx}
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.03)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Filled gradient area */}
                  <motion.path 
                    key={`area-${activeProfile.id}`}
                    initial={{ d: generateSvgPath(activeProfile.chartData.map(() => 0), chartWidth, chartHeight, true), opacity: 0 }}
                    animate={{ d: generateSvgPath(activeProfile.chartData, chartWidth, chartHeight, true), opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    fill={`url(#chartGlow-${activeProfile.id})`}
                  />

                  {/* Graph Stroke Line */}
                  <motion.path 
                    key={`line-${activeProfile.id}`}
                    initial={{ d: generateSvgPath(activeProfile.chartData.map(() => 0), chartWidth, chartHeight), pathLength: 0 }}
                    animate={{ d: generateSvgPath(activeProfile.chartData, chartWidth, chartHeight), pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    fill="none"
                    stroke={`url(#gradientStroke-${activeProfile.id})`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Pulsing peak node highlight dot */}
                  {(() => {
                    const peakIndex = activeProfile.chartData.indexOf(Math.max(...activeProfile.chartData));
                    const peakX = (peakIndex / (activeProfile.chartData.length - 1)) * chartWidth;
                    const peakY = chartHeight - (activeProfile.chartData[peakIndex] / 100) * chartHeight;
                    return (
                      <g className="pointer-events-none">
                        <circle 
                          cx={peakX}
                          cy={peakY}
                          r="10"
                          className="fill-[#B600A8]/30 animate-ping"
                        />
                        <circle 
                          cx={peakX}
                          cy={peakY}
                          r="5"
                          className="fill-white stroke-[#B600A8] stroke-2"
                        />
                      </g>
                    );
                  })()}
                </svg>

                {/* Grid timeline labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between font-mono text-[9px] text-white/30 pt-1 border-t border-white/5">
                  {activeProfile.timeline.map((day, idx) => (
                    <span key={idx}>{day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick stats bottom row */}
            <div className="grid grid-cols-3 gap-4 relative z-10 pt-4 border-t border-white/5 text-left">
              
              <div className="flex flex-col">
                <span className="font-mono text-[8px] sm:text-[9px] text-[#D7E2EA]/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-white/40" /> Profile Views
                </span>
                <span className="font-sans font-black text-sm sm:text-base text-white">
                  {(activeProfile.metrics.views + liveViewsOffset).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-[8px] sm:text-[9px] text-[#D7E2EA]/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3 text-white/40" /> Link CTR
                </span>
                <span className="font-sans font-black text-sm sm:text-base text-white">
                  {activeProfile.metrics.ctr}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-[8px] sm:text-[9px] text-[#D7E2EA]/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-white/40" /> NFC Taps
                </span>
                <span className="font-sans font-black text-sm sm:text-base text-white">
                  {activeProfile.metrics.taps}
                </span>
              </div>

            </div>

          </motion.div>

          {/* Sub Highlight Card: Special Metric Details */}
          <motion.div 
            key={`highlight-${activeProfile.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-white/10 bg-black/40 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#B600A8]/30 transition-colors text-left"
          >
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr ${activeProfile.themeColor} filter blur-3xl opacity-10`} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-[#B600A8] uppercase tracking-widest font-black">
                  FEATURED HIGHLIGHT
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#B600A8] transition-colors" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {activeProfile.metrics.specialMetric.icon}
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#D7E2EA]/40 block leading-none mb-1">
                    {activeProfile.metrics.specialMetric.label}
                  </span>
                  <span className="font-sans font-black text-xl text-white tracking-tight leading-none block">
                    {activeProfile.metrics.specialMetric.value}
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs text-white/50 leading-relaxed mb-4">
                Through customized NFC business cards and unified bio link pages, {activeProfile.name} is able to instantly direct prospective global collaborators, sponsors, and fans to their entire music, charity, and enterprise portfolios with a simple physical tap of a card.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full font-sans font-bold text-[10px] text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide">
                <Heart className="w-3 h-3 text-rose-500 fill-current" /> Like Profile
              </button>
              <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full font-sans font-bold text-[10px] text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide">
                <Share2 className="w-3.5 h-3.5" /> Share Bio
              </button>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
};
