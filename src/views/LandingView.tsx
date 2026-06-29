import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { PaystackButton } from 'react-paystack';
import { LinkMeMotionGraphics } from '../components/LinkMeMotionGraphics';
import { NigeriaAnalyticsShowcase } from '../components/NigeriaAnalyticsShowcase';
import { DigitalStorefrontShowcase } from '../components/DigitalStorefrontShowcase';
import { 
  ShoppingCart, 
  X, 
  Phone, 
  ShoppingBag, 
  ChevronRight, 
  ArrowUpRight, 
  Star, 
  MapPin, 
  Layers, 
  Cpu, 
  CreditCard 
} from 'lucide-react';

// Exact motionsites.ai GIF URLs for the Marquee Section
const MARQUEE_GIFS = [
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
  "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
  "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
  "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
  "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
  "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
  "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
  "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
  "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif"
];

// Reusable ContactButton Component (now Signup Button)
const ContactButton = ({ onClick }: { onClick?: () => void }) => (
  <button 
    onClick={onClick}
    style={{
      background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
      boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1',
      outline: '2px solid white',
      outlineOffset: '-3px'
    }}
    className="rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-[11px] sm:text-[12px] md:text-sm font-semibold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
  >
    Signup
  </button>
);

// Reusable LiveProjectButton Component
const LiveProjectButton = ({ onClick, label = "Live Project" }: { onClick?: () => void, label?: string }) => (
  <button 
    onClick={onClick}
    className="rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] bg-transparent hover:bg-[#D7E2EA]/10 transition-colors px-8 py-3 sm:px-10 sm:py-3.5 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest cursor-pointer"
  >
    {label}
  </button>
);

// Reusable FadeIn Component using framer-motion behavior specified in instructions
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: string;
  key?: any;
}

const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = '', as = 'div' }: FadeInProps) => {
  const Tag = (motion as any)[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
};

// Reusable Magnet Component
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

const Magnet = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className = ""
}: MagnetProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0px, 0px, 0px)");
  const [transition, setTransition] = useState(inactiveTransition);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < padding) {
        setTransition(activeTransition);
        const x = distanceX / strength;
        const y = distanceY / strength;
        setTransform(`translate3d(${x}px, ${y}px, 0px)`);
      } else {
        setTransition(inactiveTransition);
        setTransform("translate3d(0px, 0px, 0px)");
      }
    };

    const handleMouseLeave = () => {
      setTransition(inactiveTransition);
      setTransform("translate3d(0px, 0px, 0px)");
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [padding, strength, activeTransition, inactiveTransition]);

  return (
    <div 
      ref={ref} 
      style={{ transform, transition, willChange: 'transform' }} 
      className={className}
    >
      {children}
    </div>
  );
};

// Reusable Character Scroll Reveal Text Animation Component
const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"]
  });

  const characters = text.split("");

  return (
    <p ref={containerRef} className={`${className} flex flex-wrap justify-center`}>
      {characters.map((char, index) => {
        const start = index / characters.length;
        const end = (index + 1) / characters.length;
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);

        return (
          <span key={index} className="relative inline-block">
            <span className="opacity-0">{char === " " ? "\u00A0" : char}</span>
            <motion.span style={{ opacity }} className="absolute inset-0">
              {char === " " ? "\u00A0" : char}
            </motion.span>
          </span>
        );
      })}
    </p>
  );
};

// Scroll-driven Marquee Section Component
const MarqueeSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setScrollOffset(offset);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const row1Offset = scrollOffset - 200;
  const row2Offset = -(scrollOffset - 200);

  const row1Images = MARQUEE_GIFS.slice(0, 11);
  const row2Images = MARQUEE_GIFS.slice(11);

  const tripledRow1 = [...row1Images, ...row1Images, ...row1Images];
  const tripledRow2 = [...row2Images, ...row2Images, ...row2Images];

  return (
    <div ref={sectionRef} className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden relative z-10 select-none">
      {/* Row 1: moves RIGHT on scroll */}
      <div className="mb-3">
        <div 
          className="flex gap-3"
          style={{ 
            transform: `translateX(${row1Offset}px)`, 
            willChange: 'transform',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {tripledRow1.map((url, i) => (
            <div key={`r1-${i}`} className="relative group overflow-hidden rounded-2xl">
              <img 
                src={url}
                alt="3D NFC template representational render"
                loading="lazy"
                className="w-[420px] h-[270px] object-cover shrink-0 grayscale hover:grayscale-0 transition-all duration-500"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/420x270/222/white?text=CHIP+NG+Portfolio+${(i % 11) + 1}`;
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="font-mono text-[10px] tracking-widest text-white uppercase">PREMIUM PROFILE TEMPLATE</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: moves LEFT on scroll */}
      <div>
        <div 
          className="flex gap-3"
          style={{ 
            transform: `translateX(${row2Offset}px)`, 
            willChange: 'transform',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {tripledRow2.map((url, i) => (
            <div key={`r2-${i}`} className="relative group overflow-hidden rounded-2xl">
              <img 
                src={url}
                alt="NFC interactive digital view model"
                loading="lazy"
                className="w-[420px] h-[270px] object-cover shrink-0 grayscale hover:grayscale-0 transition-all duration-500"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/420x270/222/white?text=NFC+Showcase+${(i % 10) + 1}`;
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="font-mono text-[10px] tracking-widest text-white uppercase">NFC CHIP INTERFACE</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// BrandSlideshow component displaying names and logo brands scrolling nonstop
const BrandSlideshow = () => {
  const images = [
    { url: "/IMG_0502.jpeg", title: "ZENITHEDGE CONSULTING", desc: "Bespoke corporate consulting, custom operations, and strategy assets." },
    { url: "/IMG_0503.jpeg", title: "THE BLOOM AFFAIR", desc: "Bespoke floral design, luxury events, and customized experiences." },
    { url: "/IMG_0504.jpeg", title: "VC10 GROUP", desc: "Vanguard asset group, custom investment, and portfolio planning." },
    { url: "/IMG_0505.jpeg", title: "LUXE TRENDS", desc: "High-end luxury fashion curators, trends, and lifestyle styles." },
    { url: "/IMG_0506.jpeg", title: "NOIR PRESTIGE", desc: "Elite luxury concierge, premium member access, and brand styling." },
    { url: "/IMG_0507.jpeg", title: "FIVE PAPER", desc: "Creative corporate stationery, bespoke papercraft, and brand systems." },
    { url: "/IMG_0508.jpeg", title: "NOVATION LEGAL PRACTICE", desc: "Innovative legal consulting, dispute resolution, and practice advisory." },
    { url: "/IMG_0509.jpeg", title: "BUY LEKKI NOW NOW REALTY", desc: "Premium Lekki real estate advisors, luxury properties, and smart acquisition." },
    { url: "/IMG_0510.jpeg", title: "ZENTHURA", desc: "Symmetric brand design, wellness aesthetics, and corporate marks." },
    { url: "/IMG_0511.jpeg", title: "THOMAS BOYD WHYTE", desc: "Bespoke advisory partners, executive development, and strategic growth." },
    { url: "/IMG_0512.jpeg", title: "RINOVATO", desc: "Modern organic layouts, premium property renovations, and designs." },
    { url: "/IMG_0513.jpeg", title: "EMC LEGAL LIMITED", desc: "Corporate legal compliance, commercial law, and dispute resolution." },
    { url: "/IMG_0514.jpeg", title: "THOMAS BOYD WHYTE", desc: "Premium executive consultancy, global networking, and brand assets." }
  ];

  // Duplicate images three times to guarantee an absolutely seamless screen-spanning loop
  const doubleImages = [...images, ...images, ...images];

  return (
    <div className="w-screen relative left-1/2 right-1/2 -translate-x-1/2 overflow-hidden py-12 bg-black/40 border-y border-white/5 backdrop-blur-md">
      <style>{`
        @keyframes marquee-scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: marquee-scroll-left 40s linear infinite;
        }
      `}</style>

      {/* Dark premium edge overlay shading for perfect theatrical fading */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent z-10 pointer-events-none" />

      {/* Scrolling Content Track */}
      <div className="w-full overflow-hidden">
        <div className="animate-marquee-infinite gap-6 px-4">
          {doubleImages.map((img, idx) => (
            <div 
              key={idx}
              className="w-[260px] sm:w-[310px] shrink-0 bg-gradient-to-b from-[#141417] to-[#0A0A0B] border border-white/10 rounded-[24px] p-5 flex flex-col gap-5 shadow-2xl hover:border-[#B600A8]/60 hover:shadow-[0_0_25px_rgba(182,0,168,0.2)] transition-all duration-300 group relative overflow-hidden"
            >
              {/* Internal neon ambient light glow on card hover */}
              <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(182,0,168,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl" />

              {/* Brand Typography Details (ABOVE the logo) */}
              <div className="flex flex-col gap-1 relative z-10 flex-grow">
                <span className="font-mono text-[9px] text-[#B600A8] uppercase tracking-[0.2em] font-bold">
                  PROJECT ASSET
                </span>
                <h4 className="font-sans font-black text-sm sm:text-base text-white uppercase tracking-tight group-hover:text-[#B600A8] transition-colors duration-300">
                  {img.title}
                </h4>
                <p className="font-sans text-[11px] sm:text-xs text-white/50 leading-relaxed mt-0.5">
                  {img.desc}
                </p>
              </div>

              {/* Bold high-contrast Logo Container (BELOW the name) */}
              <div className="h-[150px] sm:h-[185px] w-full bg-black/70 rounded-2xl flex items-center justify-center p-5 border border-white/5 relative overflow-hidden group-hover:bg-black/90 transition-colors duration-300">
                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain filter brightness-110 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function LandingView({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');

  // Refs for scrolling navigation
  const aboutRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(4);
    if (data) setProducts(data);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const projectData = [
    {
      number: "01",
      category: "CLIENT WORK",
      name: "Nextlevel Studio",
      img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
      img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
      img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85",
    },
    {
      number: "02",
      category: "PERSONAL PROJECT",
      name: "Aura Brand Identity",
      img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
      img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
      img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85",
    },
    {
      number: "03",
      category: "CLIENT WORK",
      name: "Solaris Digital",
      img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
      img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
      img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85",
    }
  ];

  return (
    <div className="bg-[#0C0C0C] min-h-screen text-[#D7E2EA] font-sans overflow-x-clip relative">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen lg:h-screen flex flex-col justify-between overflow-hidden relative z-20 px-6 md:px-10 pb-10">
        
        {/* Navbar */}
        <FadeIn y={-20} delay={0} className="w-full flex justify-between items-center pt-6 md:pt-8">
          <span className="font-sans font-black tracking-tighter text-lg md:text-2xl text-white uppercase">
            CHIP NG
          </span>
          <div className="flex gap-6 sm:gap-10 items-center justify-end">
            <button 
              onClick={() => scrollToSection(aboutRef)}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#D7E2EA] hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              Why Us
            </button>
            <button 
              onClick={() => scrollToSection(shopRef)}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#D7E2EA] hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              Price
            </button>
            <button 
              onClick={() => scrollToSection(projectsRef)}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#D7E2EA] hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              Projects
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-white bg-white/10 px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer border border-white/20"
            >
              Login
            </button>
          </div>
        </FadeIn>

        {/* Hero Heading Section */}
        <div className="w-full flex-1 flex flex-col justify-center relative mt-6 md:mt-0 py-8 lg:py-0">
          
          {/* Centered Dynamic LinkMe Motion Graphics System */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <FadeIn y={30} delay={0.4} duration={0.9} className="w-full">
              <LinkMeMotionGraphics />
            </FadeIn>
          </div>

          {/* Massively Scaled Title (Z-0, background watermarked banner behind the active screen simulator) */}
          <div className="overflow-hidden w-full select-none z-0 mt-6 sm:mt-4 md:-mt-5 opacity-25 lg:opacity-30">
            <FadeIn y={40} delay={0.15}>
              <h1 className="hero-heading font-sans font-black uppercase tracking-tight leading-none text-center text-[11vw] sm:text-[12vw] md:text-[13vw] lg:text-[14vw] xl:text-[15vw] w-full block">
                Welcome to chipng
              </h1>
            </FadeIn>
          </div>

        </div>

        {/* Bottom Bar Section */}
        <div className="w-full flex justify-between items-end gap-4 relative z-20 pb-4 sm:pb-6 md:pb-10">
          
          <FadeIn y={20} delay={0.35} className="flex-1 max-w-[160px] sm:max-w-[220px] md:max-w-[260px]">
            <p className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug text-left text-[11px] sm:text-xs md:text-sm lg:text-base">
              a 3d business card known for creating unforgettable connections
            </p>
          </FadeIn>

          <FadeIn y={20} delay={0.5}>
            <ContactButton onClick={() => onNavigate('login')} />
          </FadeIn>

        </div>

      </section>

      {/* 3. ABOUT SECTION */}
      <section ref={aboutRef} className="min-h-screen flex flex-col justify-center items-center relative py-20 px-5 sm:px-8 md:px-10 overflow-hidden bg-[#0C0C0C]">
        
        {/* Absolute 3D Corner Decor Items */}
        {/* Top-Left Moon */}
        <div className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] z-0 select-none pointer-events-none">
          <FadeIn x={-80} y={0} delay={0.1} duration={0.9}>
            <img 
              src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png" 
              alt="Decorative 3D moon icon" 
              className="w-[120px] sm:w-[160px] md:w-[210px] h-auto opacity-75 animate-bounce [animation-duration:8s]"
            />
          </FadeIn>
        </div>

        {/* Bottom-Left 3D Object */}
        <div className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] z-0 select-none pointer-events-none">
          <FadeIn x={-80} y={0} delay={0.25} duration={0.9}>
            <img 
              src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png" 
              alt="Decorative 3D design node object" 
              className="w-[100px] sm:w-[140px] md:w-[180px] h-auto opacity-60 animate-pulse [animation-duration:5s]"
            />
          </FadeIn>
        </div>

        {/* Top-Right Lego */}
        <div className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] z-0 select-none pointer-events-none">
          <FadeIn x={80} y={0} delay={0.15} duration={0.9}>
            <img 
              src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png" 
              alt="Decorative 3D lego brick icon" 
              className="w-[120px] sm:w-[160px] md:w-[210px] h-auto opacity-75 animate-bounce [animation-duration:6s]"
            />
          </FadeIn>
        </div>

        {/* Bottom-Right 3D Group */}
        <div className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] z-0 select-none pointer-events-none">
          <FadeIn x={80} y={0} delay={0.3} duration={0.9}>
            <img 
              src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png" 
              alt="Decorative 3D grid layout elements" 
              className="w-[130px] sm:w-[170px] md:w-[220px] h-auto opacity-60 animate-pulse [animation-duration:7s]"
            />
          </FadeIn>
        </div>

        {/* Center Text Block Container */}
        <div className="max-w-4xl w-full mx-auto flex flex-col justify-center items-center gap-10 sm:gap-14 md:gap-16 relative z-10 text-center">
          
          <FadeIn y={40} delay={0}>
            <h2 className="hero-heading font-sans font-black uppercase text-center text-4xl sm:text-6xl md:text-8xl lg:text-[140px] xl:text-[160px] tracking-tight leading-none">
              Why you need us
            </h2>
          </FadeIn>

          <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24 w-full">
            <AnimatedText 
              text="Your first impression is everything. A Link in Bio serves as your 24/7 digital hub, aggregating all your portfolios, services, socials, and contact touchpoints into one seamless, high-converting destination. Paired with a tactile NFC business card, you can instantly share this entire interactive experience directly to anyone's phone with a simple physical tap. No paper waste, no friction—just unforgettable, high-impact connections."
              className="text-[#D7E2EA] font-medium text-center leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl"
            />

            <FadeIn y={20} delay={0.1}>
              <ContactButton onClick={() => onNavigate('login')} />
            </FadeIn>
          </div>

        </div>

      </section>

      {/* 4. SERVICES SECTION */}
      <section className="bg-white text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 relative z-30">
        
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="font-sans font-black uppercase text-center text-4xl sm:text-6xl md:text-8xl lg:text-[140px] xl:text-[160px] tracking-tight leading-none mb-16 sm:mb-20 md:mb-28">
            Services
          </h2>

          {/* List of 5 Service Items */}
          <div className="flex flex-col border-t border-[#0C0C0C]/15">
            {[
              {
                num: "01",
                name: "Smart NFC Cards",
                desc: "Premium physical contactless business cards. Stand out instantly with custom metal, classic matte, or wood cards embedded with smart NFC chips."
              },
              {
                num: "02",
                name: "Link-in-Bio Profiles",
                desc: "Beautiful, fully responsive 3D-enhanced landing pages designed to hold all your portfolio links, socials, payment info, and products in one location."
              },
              {
                num: "03",
                name: "Real-time Analytics",
                desc: "Gain deep insight into your networking performance. Track direct link clicks, dynamic profile views, device types, and visitor locations instantly."
              },
              {
                num: "04",
                name: "Brand Customization",
                desc: "Fully customize your digital profile. Tailor layout shapes, fine typography, custom buttons, high-fidelity color presets, and rich animations."
              },
              {
                num: "05",
                name: "Integrated Commerce",
                desc: "Seamless Paystack integrations. Accept donations, sell premium digital files, receive bookings, and process payments directly from your bio link page."
              }
            ].map((service, idx) => (
              <FadeIn 
                key={service.num} 
                y={20} 
                delay={idx * 0.1}
                className="flex flex-col md:flex-row items-start md:items-center justify-between py-8 sm:py-10 md:py-12 border-b border-[#0C0C0C]/15 gap-4 md:gap-10"
              >
                {/* Left Number */}
                <div className="font-sans font-black text-5xl sm:text-7xl md:text-8xl lg:text-[140px] text-[#0C0C0C] leading-none shrink-0">
                  {service.num}
                </div>

                {/* Right Stack */}
                <div className="flex-grow flex flex-col justify-center text-left">
                  <h3 className="font-sans font-medium uppercase text-lg sm:text-xl md:text-2xl lg:text-[2.1rem] tracking-tight text-[#0C0C0C] mb-2">
                    {service.name}
                  </h3>
                  <p className="font-sans font-light leading-relaxed text-xs sm:text-sm md:text-base lg:text-[1.25rem] max-w-2xl text-[#0C0C0C]/60">
                    {service.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

      </section>

      {/* REALTIME ANALYTICS SHOWCASE SECTION */}
      <section className="bg-neutral-950 text-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 py-24 sm:py-32 relative z-30 border-t border-white/5">
        <NigeriaAnalyticsShowcase />
      </section>

      {/* DIGITAL PRODUCT STOREFRONT SHOWCASE SECTION */}
      <section className="bg-black text-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 py-24 sm:py-32 relative z-30 border-t border-white/5">
        <DigitalStorefrontShowcase />
      </section>

      {/* BRANDING SHOP & NFC CARDS SECTION (Price Navbar anchor) */}
      <section ref={shopRef} className="bg-neutral-950 text-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 py-24 sm:py-32 relative z-30 border-t border-white/5">
        
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
              <ShoppingBag className="w-4 h-4 text-[#B600A8]" />
              <span className="font-mono text-xs tracking-widest text-white/80 uppercase">CHIP NG STORE</span>
            </div>
            <h2 className="hero-heading font-sans font-black uppercase text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight mb-4">
              NFC Business Cards
            </h2>
            <p className="font-sans text-sm sm:text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
              Unlock the next level of networking. Purchase physical smart cards loaded with beautiful 3D digital profiles. Simply tap to share your world.
            </p>
          </div>

          {/* Shop items from Supabase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {products.length > 0 ? (
              products.map((p, idx) => (
                <FadeIn 
                  key={p.id} 
                  y={30} 
                  delay={idx * 0.15}
                  className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-[#B600A8] transition-all group p-4"
                >
                  <div className="aspect-square bg-white/5 rounded-xl relative overflow-hidden mb-4 border border-white/5">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/20">
                        <CreditCard className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[#D7E2EA] font-mono text-[10px] tracking-wider px-2 py-1 rounded-md border border-white/10">
                      INSTANT SETUP
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-sans font-bold text-base text-white group-hover:text-[#B600A8] transition-colors mb-1">{p.name}</h3>
                    <p className="text-xs text-white/50 mb-4 flex-grow line-clamp-2">{p.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <span className="font-mono font-bold text-lg text-white">₦{Number(p.price).toLocaleString()}</span>
                      <button 
                        onClick={() => {
                          setCart(prev => {
                            const alreadyInCart = prev.some(item => item.id === p.id);
                            if (alreadyInCart) {
                              alert(`${p.name} is already in your cart!`);
                              return prev;
                            }
                            return [...prev, p];
                          });
                        }} 
                        className="bg-white hover:bg-white/90 text-black px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))
            ) : (
              // Beautiful Placeholder Products
              [
                { id: "1", name: "CHIP Classic Card", desc: "Matte black smart card with clean printed NFC tech.", price: 7500 },
                { id: "2", name: "CHIP Pro Premium", desc: "Premium textured composite hybrid card with gold embossed detailing.", price: 12000 },
                { id: "4", name: "CHIP Micro Sticker", desc: "Mini adhesive smart tag that attaches directly behind any phone casing.", price: 4000 }
              ].map((p, idx) => (
                <FadeIn 
                  key={p.id} 
                  y={30} 
                  delay={idx * 0.1}
                  className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-[#B600A8] transition-all group p-4"
                >
                  <div className="aspect-square bg-white/5 rounded-xl relative overflow-hidden mb-4 border border-white/5 flex items-center justify-center">
                    <CreditCard className="w-12 h-12 text-[#B600A8] stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[#D7E2EA] font-mono text-[10px] tracking-wider px-2 py-1 rounded-md border border-white/10">
                      NFC ENABLED
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-sans font-bold text-base text-white group-hover:text-[#B600A8] transition-colors mb-1">{p.name}</h3>
                    <p className="text-xs text-white/50 mb-4 flex-grow line-clamp-2">{p.desc}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <span className="font-mono font-bold text-base text-white">₦{p.price.toLocaleString()}</span>
                      <button 
                        onClick={() => {
                          setCart(prev => {
                            const alreadyInCart = prev.some(item => item.id === p.id);
                            if (alreadyInCart) {
                              alert(`${p.name} is already in your cart!`);
                              return prev;
                            }
                            return [...prev, p];
                          });
                        }} 
                        className="bg-white hover:bg-[#B600A8] hover:text-white text-black px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))
            )}
          </div>

          {/* Pricing tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <FadeIn y={30} delay={0.1} className="border border-white/10 bg-black/40 p-8 rounded-3xl flex flex-col hover:border-white/20 transition-all">
              <h3 className="font-mono text-[12px] font-bold text-white/50 uppercase tracking-widest mb-4">BASIC DIGITAL HUB</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-sans text-[48px] font-black text-white leading-none">Free</span>
              </div>
              <p className="text-sm text-white/60 mb-8">Establish your professional digital home on CHIP NG instantly.</p>
              <ul className="flex flex-col gap-4 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white"></div></div>
                  Unlimited social bio links
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white"></div></div>
                  Custom chipng.com/username bio path
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white"></div></div>
                  Basic profile hit analytics
                </li>
              </ul>
              <button onClick={() => onNavigate('login')} className="w-full py-3 bg-white/5 text-white hover:bg-white hover:text-black transition-all font-mono text-[12px] font-bold rounded-full cursor-pointer">
                Get Free Account
              </button>
            </FadeIn>

            {/* Pro Tier */}
            <FadeIn y={30} delay={0.2} className="border-2 border-[#B600A8] bg-black p-8 rounded-3xl flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(182,0,168,0.15)]">
              <div className="absolute top-0 right-0 bg-[#B600A8] text-white font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-xl">POPULAR</div>
              <h3 className="font-mono text-[12px] font-bold text-[#B600A8] uppercase tracking-widest mb-4">PRO MEMBERSHIP</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-sans text-[48px] font-black text-white leading-none">₦5,000</span>
                <span className="text-xs text-white/50">/ month</span>
              </div>
              <p className="text-sm text-white/70 mb-8">Unlock exclusive verified checkmark, custom 3D themes, and digital store.</p>
              <ul className="flex flex-col gap-4 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#B600A8]/10 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-[#B600A8]"></div></div>
                  Everything in Basic
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#B600A8]/10 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-[#B600A8]"></div></div>
                  Gold Verified Profile Badge
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#B600A8]/10 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-[#B600A8]"></div></div>
                  Sell digital items & services on your card
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#B600A8]/10 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-[#B600A8]"></div></div>
                  Deep real-time geographic hits analysis
                </li>
              </ul>
              <button onClick={() => onNavigate('login')} className="w-full py-3 bg-[#B600A8] text-white hover:bg-[#a10095] transition-all font-mono text-[12px] font-bold rounded-full cursor-pointer">
                Go Pro Now
              </button>
            </FadeIn>
          </div>
        </div>

      </section>

      {/* 5. PROJECTS SECTION */}
      <section ref={projectsRef} className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 py-24 relative z-40">
        
        <div className="max-w-5xl mx-auto w-full mb-16">
          <h2 className="hero-heading font-sans font-black uppercase text-center text-4xl sm:text-6xl md:text-8xl lg:text-[140px] xl:text-[160px] tracking-tight leading-none">
            Project
          </h2>
        </div>

        {/* Interactive Bold Brand Slideshow */}
        <div className="w-full relative">
          <BrandSlideshow />
        </div>

      </section>

      {/* Bottom Footer Section */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-8 py-10 w-full mt-auto bg-black border-t border-white/5 relative z-50">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <span className="font-sans text-[20px] font-black text-white block mb-1 tracking-tight">CHIP NG</span>
          <p className="text-[14px] text-white/50 mb-3">© 2026 CHIP NG. Elevating African Professionals.</p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-white/50">
            <a href="tel:08100764154" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-[14px] font-medium font-mono">08100764154</span>
            </a>
            <a href="https://tiktok.com/@chipng_app" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
              <span className="text-[14px] font-medium font-mono">@chipng_app</span>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="text-[14px] text-white/50 hover:text-white font-medium transition-colors">Privacy Policy</a>
          <a href="#" className="text-[14px] text-white/50 hover:text-white font-medium transition-colors">Terms of Service</a>
          <a href="#" className="text-[14px] text-white/50 hover:text-white font-medium transition-colors">Security</a>
          <a href="#" className="text-[14px] text-white/50 hover:text-white font-medium transition-colors">Help Center</a>
        </div>
      </footer>

      {/* Cart Float Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center justify-center cursor-pointer border border-neutral-800"
          >
            <ShoppingCart className="w-6 h-6 text-black" />
            <span className="absolute -top-2 -right-2 bg-[#B600A8] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
              {cart.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Paystack Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#111] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden relative text-left"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#B600A8]"/> Checkout
                </h3>
                <button onClick={() => setIsCheckoutModalOpen(false)} className="text-white/50 hover:text-white cursor-pointer transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{item.name}</span>
                        <span className="text-xs text-white/50">₦{Number(item.price).toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => setCart(cart.filter((_, i) => i !== idx))} 
                        className="text-red-400 hover:text-red-300 text-xs font-mono cursor-pointer font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center py-2 border-t border-b border-white/10">
                  <span className="font-bold text-white uppercase text-sm">Total</span>
                  <span className="font-bold text-[#B600A8] font-mono text-lg">
                    ₦{cart.reduce((sum, item) => sum + Number(item.price), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    placeholder="Your Full Name" 
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#B600A8] transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder="Your Phone Number" 
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#B600A8] transition-colors"
                  />
                </div>
                
                <PaystackButton
                  reference={`SHOP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                  email='guest@chipng.com'
                  amount={Math.round(cart.reduce((sum, item) => sum + Number(item.price), 0) * 100)}
                  publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                  text="Pay Now"
                  onSuccess={async (response: any) => {
                    try {
                      for (const item of cart) {
                        await supabase.from('purchases').insert({
                          product_id: item.id,
                          seller_id: item.profile_id || null,
                          buyer_email: checkoutName || 'Guest',
                          amount: item.price,
                          platform_fee: item.price * 0.05,
                          net_earnings: item.price * 0.95,
                          reference: response.reference + '-' + Math.random().toString(36).substring(2, 7),
                          status: 'success'
                        });
                      }
                      alert('Payment complete! Opening WhatsApp to send order information...');
                      
                      const message = `*New Order from ${checkoutName || 'Guest'} (${checkoutPhone || 'No phone'})*\n\n*Items:*\n` + 
                                      cart.map(item => `- ${item.name} (₦${Number(item.price).toLocaleString()})`).join('\n') + 
                                      `\n\n*Total:* ₦${cart.reduce((sum, item) => sum + Number(item.price), 0).toLocaleString()}\n` +
                                      `*Reference:* ${response.reference}`;
                      
                      const waUrl = `https://wa.me/2348100764154?text=${encodeURIComponent(message)}`;
                      window.open(waUrl, '_blank');
                      
                      setCart([]);
                      setIsCheckoutModalOpen(false);
                      setCheckoutName('');
                      setCheckoutPhone('');
                    } catch(err) {
                      console.error(err);
                      alert('Error processing purchase.');
                    }
                  }}
                  onClose={() => {}}
                  className="w-full bg-[#B600A8] hover:bg-[#a10095] text-white transition-colors font-mono text-[14px] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
                  disabled={!checkoutName || !checkoutPhone || cart.length === 0}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
