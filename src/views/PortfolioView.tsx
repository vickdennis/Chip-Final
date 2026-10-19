import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../App';
import { 
  ArrowUpRight, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  Menu, 
  X, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Twitter, 
  Send, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Code2, 
  Sparkles, 
  Layers, 
  Terminal, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  ArrowUp,
  Briefcase,
  Home,
  Camera,
  Upload,
  Loader2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from '../components/Toast';
import { supabase } from '../supabaseClient';

interface PortfolioProject {
  id: number;
  title: string;
  slug: string;
  category?: string;
  tagline?: string;
  description: string;
  technologies: string;
  live_url: string;
  github_url?: string;
  image_url: string;
  featured?: number;
  sort_order?: number;
}

interface PortfolioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  read_time?: string;
  date?: string;
  url: string;
}

interface PortfolioProfile {
  name: string;
  handle: string;
  title: string;
  subtitle: string;
  bio: string;
  years_experience: string;
  location: string;
  avatar_url: string;
  hero_image_url: string;
  about_image_url: string;
  skills_frontend: string;
  skills_styles: string;
  skills_backend: string;
  skills_devops: string;
  social_github: string;
  social_linkedin: string;
  social_twitter: string;
  social_whatsapp: string;
  social_instagram: string;
  social_telegram: string;
  social_email: string;
  featured_article_title: string;
  featured_article_desc: string;
  featured_article_tag: string;
  featured_article_url: string;
}

const DEFAULT_PROFILE: PortfolioProfile = {
  name: 'Victor Okoye',
  handle: 'victor.okoye',
  title: 'Full-stack Developer',
  subtitle: 'My goal is to write maintainable, clean and understandable code to process development was enjoyable.',
  bio: "Hello! I'm Victor, I'm a full-stack developer & hardware-software architect based in Lagos, Nigeria. More than 6 years experience building high-throughput web applications, contactless NFC devices, and high-conversion e-commerce engines.",
  years_experience: '6+ years',
  location: 'Lagos, Nigeria',
  avatar_url: '/chipng_exact_tile.png',
  hero_image_url: '/chipng_3d_logo.jpg',
  about_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
  skills_frontend: 'TypeScript / React / Next.js / Tailwind CSS / Vue / React Native / Redux Toolkit / Framer Motion / Puppeteer',
  skills_styles: 'Tailwind CSS / SCSS / PostCSS / CSS Modules / Headless UI',
  skills_backend: 'Node.js / Express / TypeScript / PostgreSQL / SQLite / Supabase / Redis / Kafka / REST & GraphQL / Flutterwave API',
  skills_devops: 'Docker / Linux / Vercel / Google Cloud Run / CI/CD / Git / Nginx / Cloudflare',
  social_github: 'https://github.com/vickdennis',
  social_linkedin: 'https://linkedin.com/company/chipng',
  social_twitter: 'https://x.com/chipng_nfc',
  social_whatsapp: 'https://wa.me/2348100764154',
  social_instagram: 'https://instagram.com/chipng_nfc',
  social_telegram: 'https://t.me/chipng',
  social_email: 'hello@chipng.com',
  featured_article_title: 'The simplest example is kafka + golang',
  featured_article_desc: 'This article presents a simple way to implement a micro-service architecture using Kafka, Golang and Docker for real-time telemetry processing.',
  featured_article_tag: 'Architecture & Distributed Systems',
  featured_article_url: 'https://chipng.com/blog/hardware-engineering-sub-10ms-nfc',
};

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 1,
    title: 'CHIP NG',
    slug: 'chipng',
    category: 'Hardware & Identity',
    tagline: 'Premier Contactless Smart NFC Cards & Dynamic Link-in-Bio Platform',
    description: 'The premier contactless smart business card and dynamic link-in-bio platform in Nigeria. Features sub-10ms NTAG216 response, zero app needed, frictionless Flutterwave checkout, dynamic vCard contact exchange, analytics telemetry, and automated nationwide logistics.',
    technologies: 'Next.js, TypeScript, NFC NTAG216, Tailwind CSS, Flutterwave, Supabase, SQLite, Node.js',
    live_url: 'https://chipng.com',
    github_url: 'https://github.com/vickdennis/Chip-Final',
    image_url: 'https://www.chipng.com/chipng_3d_logo.jpg',
    featured: 1,
    sort_order: 1,
  },
  {
    id: 2,
    title: 'Alvora Store',
    slug: 'alvora-store',
    category: 'Luxury E-Commerce',
    tagline: 'Luxury Apparel, Designer Handbags & Premium Lifestyle Essentials',
    description: 'Premier luxury lifestyle brand offering bespoke apparel, elegant designer handbags, and curated accessories in Nigeria. Architected with modern Next.js App Router, real-time shopping bag state, nationwide courier logistics integration, Cloudflare edge acceleration, and mobile-optimized luxury UI.',
    technologies: 'Next.js, React, TypeScript, Tailwind CSS, Cart Engine, Cloudflare, Paytech',
    live_url: 'https://alvora.com.ng',
    github_url: 'https://github.com/vickdennis',
    image_url: 'https://alvora.com.ng/IMG_2394.jpeg',
    featured: 1,
    sort_order: 2,
  },
  {
    id: 3,
    title: 'Kana Master',
    slug: 'kana-master',
    category: 'Mobile Application',
    tagline: 'Japanese Katakana & Hiragana Kinesthetic Learning App',
    description: 'Kana Master is an iOS & Android application designed for learning Katakana and Hiragana. It includes various tests and practical exercises that help in learning and memorizing Japanese characters. The app also offers audio training for correct pronunciation and demonstrates how to properly draw each character.',
    technologies: 'TypeScript, React Native, Redux Toolkit, i18n, iOS, Android',
    live_url: 'https://chipng.com',
    github_url: 'https://github.com/vickdennis',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    featured: 1,
    sort_order: 3,
  },
  {
    id: 4,
    title: 'Anime Sentry',
    slug: 'anime-sentry',
    category: 'Microservices & Bots',
    tagline: 'Automated Release Telemetry & Notification Engine',
    description: 'High-performance microservice engine tracking episode releases worldwide. Built with automated cron web workers, Telegram Bot API webhook relays, and Redis caching for instant notification dispatch.',
    technologies: 'Golang, GORM, PostgreSQL, i18n, goquery, gocron, Docker',
    live_url: 'https://chipng.com',
    github_url: 'https://github.com/vickdennis',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    featured: 1,
    sort_order: 4,
  },
];

const DEFAULT_ARTICLES: PortfolioArticle[] = [
  {
    id: 1,
    title: 'The simplest example is kafka + golang',
    slug: 'simplest-example-kafka-golang',
    excerpt: 'This article presents a simple way to implement a micro-service architecture using Kafka, Golang and Docker with sub-5ms event dispatch.',
    read_time: '4 min read',
    date: '2026',
    url: 'https://chipng.com/blog/hardware-engineering-sub-10ms-nfc',
  },
  {
    id: 2,
    title: 'Hardware Engineering: Sub-10ms NFC Response Times',
    slug: 'hardware-engineering-sub-10ms-nfc',
    excerpt: 'How we tuned antenna resonance and coil coupling to achieve instant contact exchange without companion apps across iOS and Android.',
    read_time: '5 min read',
    date: '2026',
    url: 'https://chipng.com/blog/hardware-engineering-sub-10ms-nfc',
  },
  {
    id: 3,
    title: 'Predictive AI Cash Runway Forecasting for Startups',
    slug: 'predictive-ai-cash-runway-forecasting',
    excerpt: 'Architecting multi-scenario financial simulations with Monte Carlo models in high-growth African technology companies.',
    read_time: '6 min read',
    date: '2026',
    url: 'https://chipng.com/blog/predictive-ai-cash-runway-forecasting',
  },
];

const WORK_EXPERIENCE = [
  {
    period: '2024 - Present',
    duration: 'Current',
    company: 'CHIP NG Technologies Ltd',
    role: 'Founder & Lead Architect',
    stack: 'Next.js, TypeScript & NFC Hardware',
    description: 'Directing core hardware firmware engineering and full-stack cloud profile platform. Scaled contactless cards nationwide across Nigeria.'
  },
  {
    period: '2023 - 2024',
    duration: '1 year 2 months',
    company: 'Alvora Store',
    role: 'Principal Full-Stack Engineer',
    stack: 'Next.js, TypeScript & Paytech',
    description: 'Designed luxury e-commerce infrastructure, nationwide delivery logistics pipeline, and high-conversion checkout flows.'
  },
  {
    period: '2021 - 2023',
    duration: '2 years',
    company: 'Fintech & Cloud Systems',
    role: 'Senior Fullstack Engineer',
    stack: 'React, Node.js & Distributed Systems',
    description: 'Built distributed APIs, payment gateway webhooks, automated transaction settlements, and microservices.'
  },
  {
    period: '2019 - 2021',
    duration: '2 years',
    company: 'Web Systems Lab',
    role: 'Software Developer',
    stack: 'JavaScript & Python',
    description: 'Engineered web scrapers, REST APIs, client portals, and responsive interactive web applications.'
  },
];

export interface PortfolioViewProps {
  onNavigate?: (view: ViewState) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<PortfolioProfile>(DEFAULT_PROFILE);
  const [projects, setProjects] = useState<PortfolioProject[]>(DEFAULT_PROJECTS);
  const [articles, setArticles] = useState<PortfolioArticle[]>(DEFAULT_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [articlePage, setArticlePage] = useState(1);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);

  useEffect(() => {
    // 1. Check local storage cache for instant hydration
    try {
      const cached = localStorage.getItem('chipng_portfolio_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setProfile((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {}

    // 2. Try Supabase cloud database
    try {
      supabase
        .from('portfolio_profile')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
        .then(
          ({ data: spProfile }) => {
            if (spProfile) {
              setProfile((prev) => ({ ...prev, ...spProfile }));
              try {
                localStorage.setItem('chipng_portfolio_profile', JSON.stringify(spProfile));
              } catch (e) {}
            }
          },
          () => {}
        );

      supabase
        .from('portfolio_projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .then(
          ({ data: spProjects }) => {
            if (spProjects && spProjects.length > 0) {
              setProjects(spProjects);
            }
          },
          () => {}
        );
    } catch (e) {}

    // 3. Fetch live portfolio data from server
    fetch('/api/portfolio')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
        if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
        }
      })
      .catch((err) => {
        console.warn('Could not load portfolio from server, using built-in high-fidelity seeds:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredSlides = [
    {
      title: profile.featured_article_title || 'The simplest example is kafka + golang',
      desc: profile.featured_article_desc || 'This article presents a simple way to implement a micro-service architecture using Kafka, Golang and Docker.',
      url: profile.featured_article_url || 'https://chipng.com/blog/hardware-engineering-sub-10ms-nfc',
      tag: profile.featured_article_tag || 'kafka + golang',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Hardware Engineering: Sub-10ms NFC Response Times',
      desc: 'How we tuned antenna resonance and coil coupling to achieve instant contact exchange without companion apps across iOS and Android.',
      url: 'https://chipng.com/blog/hardware-engineering-sub-10ms-nfc',
      tag: 'NFC + Embedded Systems',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Alvora Store: Luxury E-Commerce Architecture',
      desc: 'Building high-performance e-commerce experiences with real-time shopping cart states, edge caching, and mobile responsiveness.',
      url: 'https://alvora.com.ng',
      tag: 'Next.js + E-Commerce',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0E0F12] text-white font-sans selection:bg-white selection:text-black">
      <Helmet>
        <title>Victor Okoye — Full-stack Developer & Hardware-Software Architect</title>
        <meta name="description" content="Portfolio of Victor Okoye. Full-stack Developer and founder of CHIP NG (contactless smart cards) and Alvora Store. 6+ years experience in Next.js, TypeScript, Go, distributed microservices, and NFC systems." />
        <link rel="canonical" href="https://www.chipng.com/portfolio" />
        <meta property="og:title" content="Victor Okoye — Full-stack Developer Portfolio" />
        <meta property="og:description" content="Explore projects built by Victor Okoye including CHIP NG, Alvora Store, and distributed systems." />
        <meta property="og:url" content="https://www.chipng.com/portfolio" />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Standalone Top Banner / Breadcrumb */}
      <div className="border-b border-white/5 bg-[#090A0D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('landing');
                } else {
                  window.location.href = '/';
                }
              }}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-mono cursor-pointer border border-white/5"
              title="Return to CHIP NG Home"
            >
              <Home className="w-3.5 h-3.5 text-[#76BB08] group-hover:scale-110 transition-transform" />
              <span>chipng.com</span>
            </button>
            <span className="text-white/20 font-mono">/</span>
            <span className="font-mono text-xs text-white/90 font-medium">portfolio</span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-5 text-xs font-mono text-white/60">
              <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors cursor-pointer">About</button>
              <button onClick={() => scrollToSection('work')} className="hover:text-white transition-colors cursor-pointer">Work</button>
              <button onClick={() => scrollToSection('projects')} className="hover:text-white transition-colors cursor-pointer">Projects</button>
              <button onClick={() => scrollToSection('articles')} className="hover:text-white transition-colors cursor-pointer">Articles</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors cursor-pointer">Contact</button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 bg-[#090A0D] px-6 py-4 flex flex-col gap-3 font-mono text-xs"
            >
              <button onClick={() => scrollToSection('about')} className="text-left py-1 text-white/70 hover:text-white">About me</button>
              <button onClick={() => scrollToSection('work')} className="text-left py-1 text-white/70 hover:text-white">Work experience</button>
              <button onClick={() => scrollToSection('projects')} className="text-left py-1 text-white/70 hover:text-white">Projects</button>
              <button onClick={() => scrollToSection('articles')} className="text-left py-1 text-white/70 hover:text-white">Articles</button>
              <button onClick={() => scrollToSection('contact')} className="text-left py-1 text-white/70 hover:text-white">Contact</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Responsive Layout Grid matching the 3 mockups in IMG_3212 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* COLUMN 1: Hero, Socials, Featured Card, About Me, Skills (Mockup Panel 1) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Handle & Header */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs sm:text-sm text-white/80 tracking-wide font-medium">
                {profile.handle || 'victor.okoye'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-mono text-emerald-400">Available for builds</span>
              </div>
            </div>

            {/* Title & Bio */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.1]">
                Full-stack<br />
                <span className="text-white/90">Developer</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-4 leading-relaxed font-normal">
                {profile.subtitle || 'My goal is to write maintainable, clean and understandable code to process development was enjoyable.'}
              </p>
            </div>

            {/* Projects CTA Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollToSection('projects')}
                className="group flex-1 flex items-center justify-between px-6 py-3.5 rounded-full bg-white text-black font-semibold text-xs tracking-wide hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
              >
                <span>Projects</span>
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </div>
              </button>
            </div>

            {/* Social Pills Grid (Exact visual match to image) */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {profile.social_github && (
                <a
                  href={profile.social_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Github</span>
                </a>
              )}
              {profile.social_linkedin && (
                <a
                  href={profile.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5 shrink-0 text-[#0077B5]" />
                  <span className="truncate">Linkedin</span>
                </a>
              )}
              {profile.social_twitter && (
                <a
                  href={profile.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Twitter className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Twitter / X</span>
                </a>
              )}
              {profile.social_instagram && (
                <a
                  href={profile.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Instagram className="w-3.5 h-3.5 shrink-0 text-pink-400" />
                  <span className="truncate">Instagram</span>
                </a>
              )}
              {profile.social_whatsapp && (
                <a
                  href={profile.social_whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">WhatsApp</span>
                </a>
              )}
              {profile.social_telegram && (
                <a
                  href={profile.social_telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                  <span className="truncate">Telegram</span>
                </a>
              )}
            </div>

            {/* Featured Article Card with Artwork (Exact style match to image) */}
            <div className="rounded-3xl border border-white/10 bg-[#14161D] overflow-hidden flex flex-col">
              <div className="relative h-44 overflow-hidden bg-gradient-to-tr from-sky-950 via-indigo-900 to-purple-950">
                <img
                  src={featuredSlides[featuredSlideIndex].image}
                  alt={featuredSlides[featuredSlideIndex].title}
                  className="w-full h-full object-cover opacity-80 mix-blend-overlay hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10">
                    {featuredSlides[featuredSlideIndex].tag}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {featuredSlides[featuredSlideIndex].title}
                  </h3>
                  <p className="text-xs text-white/50 mt-2 line-clamp-3 leading-relaxed">
                    {featuredSlides[featuredSlideIndex].desc}
                  </p>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-between">
                  <a
                    href={featuredSlides[featuredSlideIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    <span>Read more</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* Slider controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFeaturedSlideIndex((prev) => (prev > 0 ? prev - 1 : featuredSlides.length - 1))}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFeaturedSlideIndex((prev) => (prev < featuredSlides.length - 1 ? prev + 1 : 0))}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 -mt-4">
              {featuredSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedSlideIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    featuredSlideIndex === i ? 'bg-white w-5' : 'bg-white/20'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* ... /About me ... Section */}
            <div id="about" className="pt-2">
              <span className="font-mono text-xs text-white/50">... /About me ...</span>
              <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
                {profile.bio || "Hello! I'm Victor, I'm a full-stack developer. More than 6 years experience."}
              </p>

              {/* Portrait Photo Frame */}
              <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden bg-[#14161D] aspect-[4/5] relative group">
                <img
                  src={profile.about_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'}
                  alt={profile.name}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-102 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 pointer-events-none">
                  <span className="text-sm font-bold text-white">{profile.name}</span>
                  <span className="text-xs text-white/60 font-mono">{profile.location}</span>
                </div>
              </div>
            </div>

            {/* Skills Bento Cards (Exact layout from image) */}
            <div className="flex flex-col gap-3">
              {/* Front-end */}
              <div className="rounded-2xl border border-white/10 bg-[#14161D] p-4 text-xs">
                <span className="font-mono text-[11px] text-white/50 block mb-2">Front-end</span>
                <p className="text-white/80 leading-relaxed font-mono text-[11px]">
                  {profile.skills_frontend}
                </p>
              </div>

              {/* Styles with Arrow Icon */}
              <div className="rounded-2xl border border-white/10 bg-[#14161D] p-4 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] text-white/50 block mb-1.5">Styles</span>
                  <p className="text-white/80 font-mono text-[11px]">
                    {profile.skills_styles}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-white/60">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Back-end */}
              <div className="rounded-2xl border border-white/10 bg-[#14161D] p-4 text-xs">
                <span className="font-mono text-[11px] text-white/50 block mb-2">Back-end</span>
                <p className="text-white/80 leading-relaxed font-mono text-[11px]">
                  {profile.skills_backend}
                </p>
              </div>

              {/* DevOps */}
              <div className="rounded-2xl border border-white/10 bg-[#14161D] p-4 text-xs flex items-center justify-between">
                <div className="max-w-[70%]">
                  <span className="font-mono text-[11px] text-white/50 block mb-1">DevOps</span>
                  <p className="text-white/80 font-mono text-[11px]">
                    {profile.skills_devops}
                  </p>
                </div>
                <span className="text-[10px] text-white/40 text-right leading-tight max-w-[80px]">
                  Some of my favorite technologies
                </span>
              </div>
            </div>

          </div>


          {/* ========================================================================= */}
          {/* COLUMN 2: Work Experience & Projects Stream (Mockup Panel 2)               */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* "Work" Section Header */}
            <div id="work" className="border-b border-white/10 pb-4 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Work
              </h2>
              <span className="text-xs font-mono text-white/50">Experience Timeline</span>
            </div>

            {/* Work Timeline (Exact visual format from middle column) */}
            <div className="space-y-4">
              {WORK_EXPERIENCE.map((job, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-[#14161D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-white/40">{job.period}</span>
                    <span className="text-[11px] text-white/30 font-mono">{job.duration}</span>
                  </div>

                  <div className="flex-1 sm:px-4">
                    <h4 className="text-sm font-bold text-white leading-tight">{job.company}</h4>
                    <span className="text-xs text-white/70 block mt-0.5 font-medium">{job.role}</span>
                    <span className="text-[11px] font-mono text-[#76BB08] block mt-1">{job.stack}</span>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-dashed border-white/10 p-3.5 text-center">
                <span className="text-xs font-mono text-white/60">
                  Work experience • <strong className="text-white">{profile.years_experience || '6+ years'}</strong>
                </span>
              </div>
            </div>

            {/* ... /Projects ... Header */}
            <div id="projects" className="pt-4 border-b border-white/10 pb-4 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ... /Projects ...
              </h2>
              <span className="text-xs font-mono text-white/40">{projects.length} Showcased</span>
            </div>

            {/* Project Cards (Exact style from middle column) */}
            <div className="space-y-6">
              {projects.map((project) => {
                const techList = project.technologies.split(',').map((t) => t.trim());
                return (
                  <div 
                    key={project.id}
                    className="rounded-3xl border border-white/10 bg-[#14161D] overflow-hidden flex flex-col group hover:border-white/25 transition-all"
                  >
                    {/* Project Header Mockup Media */}
                    <div className="relative h-56 bg-neutral-900 overflow-hidden flex items-center justify-center p-4 border-b border-white/5">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-103 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-4 right-4">
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer shadow-lg"
                          title={`Open ${project.title}`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                      {project.category && (
                        <div className="absolute bottom-4 left-4">
                          <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/15">
                            {project.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="p-5 sm:p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {project.title}
                        </h3>
                        {project.live_url && (
                          <a 
                            href={project.live_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-white/50 hover:text-white flex items-center gap-1"
                          >
                            <span>{new URL(project.live_url).hostname.replace('www.', '')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {project.tagline && (
                        <p className="text-xs text-[#76BB08] font-medium font-mono">
                          {project.tagline}
                        </p>
                      )}

                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {techList.map((tech, tIdx) => (
                          <span 
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/70"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        {project.description}
                      </p>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#76BB08] transition-colors"
                        >
                          <span>Visit Live Website</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>

                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-mono"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>


          {/* ========================================================================= */}
          {/* COLUMN 3: Articles & Contacts & Colophon (Mockup Panel 3)                  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* "Articles" Header */}
            <div id="articles" className="border-b border-white/10 pb-4 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Articles
              </h2>
              <span className="text-xs font-mono text-white/40">Technical Writing</span>
            </div>

            {/* Articles Stream */}
            <div className="space-y-4">
              {articles.map((art) => (
                <div 
                  key={art.id}
                  className="rounded-3xl border border-white/10 bg-[#14161D] p-5 flex flex-col justify-between gap-4 hover:border-white/20 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-white/50 mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-[11px] font-semibold hover:bg-neutral-200 transition-colors"
                    >
                      <span>Read more</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-white/40 text-[10px]">
                      →
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls (Exact to mockup) */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setArticlePage(1)}
                  className={`w-7 h-7 rounded-full text-xs font-mono flex items-center justify-center transition-colors cursor-pointer ${
                    articlePage === 1 ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setArticlePage(2)}
                  className={`w-7 h-7 rounded-full text-xs font-mono flex items-center justify-center transition-colors cursor-pointer ${
                    articlePage === 2 ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setArticlePage((prev) => (prev === 1 ? 2 : 1))}
                  className="w-7 h-7 rounded-full bg-white/5 text-white/60 hover:bg-white/10 text-xs font-mono flex items-center justify-center transition-colors cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>

            {/* ... /Contacts ... Section */}
            <div id="contact" className="pt-6 border-t border-white/10 flex flex-col gap-6">
              <div>
                <span className="font-mono text-xs text-white/50 block mb-3">... /Contacts ...</span>
                
                {/* Secondary Mini Nav */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/60 mb-6">
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white cursor-pointer">Main</button>
                  <span>/</span>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white cursor-pointer">About</button>
                  <span>/</span>
                  <button onClick={() => scrollToSection('projects')} className="hover:text-white cursor-pointer">Projects</button>
                  <span>/</span>
                  <button onClick={() => scrollToSection('articles')} className="hover:text-white cursor-pointer">Articles</button>
                </div>

                {/* Colophon Card */}
                <div className="rounded-2xl border border-white/10 bg-[#14161D] p-4 text-[11px] font-mono text-white/60 space-y-1">
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider mb-1">Site</span>
                  <p>Handcrafted by {profile.name} /</p>
                  <p>Designed with precision /</p>
                  <p>Powered by Next.js & React</p>
                </div>
              </div>

              {/* Large Display Typography: "Victor Okoye" */}
              <div className="pt-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.05]">
                  {profile.name.split(' ')[0]}<br />
                  <span>{profile.name.split(' ').slice(1).join(' ') || 'Okoye'}</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-white/50 font-mono">Full-stack developer</span>
                </div>
              </div>

              {/* Social Grid (Bottom of mockup 3) */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {profile.social_github && (
                  <a
                    href={profile.social_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span className="truncate">Github</span>
                  </a>
                )}
                {profile.social_linkedin && (
                  <a
                    href={profile.social_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                    <span className="truncate">Linkedin</span>
                  </a>
                )}
                {profile.social_email && (
                  <a
                    href={`mailto:${profile.social_email}`}
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">E-mail</span>
                  </a>
                )}
                {profile.social_telegram && (
                  <a
                    href={profile.social_telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span className="truncate">Telegram</span>
                  </a>
                )}
                {profile.social_twitter && (
                  <a
                    href={profile.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span className="truncate">Twitter</span>
                  </a>
                )}
                {profile.social_instagram && (
                  <a
                    href={profile.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] text-white/80 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span className="truncate">Instagram</span>
                  </a>
                )}
              </div>

              {/* Quick WhatsApp message */}
              {profile.social_whatsapp && (
                <a
                  href={profile.social_whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Subtle Footer Bar */}
      <footer className="border-t border-white/5 py-8 text-center text-xs font-mono text-white/40">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioView;
