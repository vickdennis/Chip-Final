import React, { useEffect, useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import {
  ArrowLeft, Clock, Calendar, Check, Link2,
  Share2, ArrowRight, MessageCircle, Twitter, Linkedin, Facebook
} from 'lucide-react';
import { format } from 'date-fns';
import SanitizedBlogContent from '../components/blog/SanitizedBlogContent';
import { calculateReadingTime, extractCleanExcerpt } from '../utils/sanitizeHtml';
import { RelatedPosts } from '../components/RelatedPosts';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  meta_title?: string;
  meta_description?: string;
  published_at: string;
  updated_at?: string;
  excerpt: string;
  keywords?: string[];
  author?: string;
  category?: string;
  is_published?: boolean;
}

const FALLBACK_ARTICLES: Record<string, BlogPost> = {
  'predictive-ai-cash-runway-forecasting': {
    id: 'post-1',
    title: 'How Solopreneurs are Using Predictive AI to Forecast 180-Day Cash Runway',
    slug: 'predictive-ai-cash-runway-forecasting',
    excerpt:
      'Eliminate the uncertainty of 30-to-60-day invoice delays. A breakdown of machine learning algorithms predicting bank liquidity for modern independent practices.',
    cover_image_url:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
    published_at: '2026-09-15T10:00:00Z',
    keywords: ['Finance', 'AI Modeling', 'Cashflow'],
    content: `
<h3>The Core Flaw of Static Accounting Spreadsheets</h3>

<p>Most solopreneurs and independent agency founders manage their business finances looking into a rearview mirror. Accounting tools like QuickBooks or Xero excel at reporting what happened 30 days ago, but fail catastrophically at answering the single question that keeps founders awake at 2 AM:</p>

<blockquote><p><em>"If my top client pays 45 days late and my operating costs rise by 12%, do I run out of cash before Q3?"</em></p></blockquote>

<p>Traditional financial software assumes fixed monthly linearity. In reality, modern client retainers, project milestone payments, and software licensing fees exhibit high volatility and payment friction.</p>

<h3>Probabilistic Liquidity Modeling</h3>

<p>CHIP NG’s predictive finance module replaces linear projections with probabilistic Markov-chain simulations. By connecting directly to your bank account and invoice ledger, the engine evaluates:</p>

<ol>
  <li><strong>Client Settlement Lag:</strong> Identifying each client's historical payment delta relative to due dates.</li>
  <li><strong>Deterministic Run-Rate:</strong> Isolating critical fixed overhead (cloud hosting, contractor retainers, tax liabilities).</li>
  <li><strong>Discretionary Variable Buffers:</strong> Dynamically projecting safe distributions without triggering liquidity warning thresholds.</li>
</ol>

<h3>Concrete Outcomes</h3>

<p>Teams adopting autonomous runway forecasting report an average <strong>3.4x decrease in cash deficits</strong> within 90 days. Instead of panicking over a delayed wire, our notification system alerts you 18 days ahead of time, automating polite milestone nudges and dynamic discount offers for immediate settlement.</p>
    `,
  },
  'hardware-engineering-sub-10ms-nfc': {
    id: 'post-2',
    title: 'The Hardware Engineering Behind Sub-10ms NFC Touchpoints',
    slug: 'hardware-engineering-sub-10ms-nfc',
    excerpt:
      'From custom dual-loop antenna coils to ceramic titanium coatings: how we engineered an instant digital handshake that converts 4x higher than paper business cards.',
    cover_image_url:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    published_at: '2026-08-28T14:30:00Z',
    keywords: ['Hardware', 'NFC', 'Design'],
    content: `
<h3>Why Physical Touchpoints Still Dictate Deal Velocity</h3>

<p>In an era saturated with cold LinkedIn messages and spam emails, in-person serendipity carries unprecedented leverage. Yet, the traditional business card has remained fundamentally unchanged for over a century: static cardstock that ends up buried in a coat pocket or wastebasket.</p>

<p>When we set out to build the CHIP NG physical card, we established two non-negotiable architectural mandates:</p>

<ol>
  <li><strong>Sub-10ms Handshake Latency:</strong> Zero hesitation between the physical tap and the smartphone opening your dynamic presence.</li>
  <li><strong>Zero App Dependency:</strong> If a prospect needs to download an application to view your portfolio, you have already lost 80% of conversion.</li>
</ol>

<h3>The Material Science of Antenna Resonance</h3>

<p>Metal cards traditionally pose a fatal obstacle for High-Frequency (HF) radio signals. Metal shields electromagnetic induction, causing standard RFID and NFC tags to fail completely when encased in stainless steel or aluminum.</p>

<p>To solve this, CHIP NG engineered a proprietary dual-loop ceramic antenna decoupled from the titanium body using a micro-ferrite absorption layer. The result is a 360-degree transmission field operating at 13.56 MHz that activates even through thick smartphone cases.</p>
    `,
  },
};

export default function BlogArticleView({
  onNavigate,
  slug,
  isDarkMode,
  toggleDarkMode,
}: {
  onNavigate: (view: ViewState, slug?: string) => void;
  slug: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [articleCategory, setArticleCategory] = useState<string>('NFC Technology');

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      // 1. Try backend API first
      try {
        const apiRes = await fetch(`/api/posts/${slug}`);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData) {
            setPost(apiData);
            if (apiData.category) setArticleCategory(apiData.category);

            // Register view count once per user session
            try {
              if (apiData.is_published && typeof window !== 'undefined' && !sessionStorage.getItem(`viewed_blog_${slug}`)) {
                sessionStorage.setItem(`viewed_blog_${slug}`, '1');
                fetch(`/api/post-view/${slug}`, { method: 'POST' }).catch(() => {});
              }
            } catch (e) {}

            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      // 2. Fetch from Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        if (FALLBACK_ARTICLES[slug]) {
          setPost(FALLBACK_ARTICLES[slug]);
        } else {
          setPost(null);
        }
      } else {
        setPost(data);

        // Fetch category if saved in backend
        try {
          const catRes = await fetch(`/api/post-categories-all`);
          if (catRes.ok) {
            const catMap = await catRes.json();
            if (catMap[slug]) setArticleCategory(catMap[slug]);
          }
        } catch (e) {
          // ignore
        }

        // Register view count
        try {
          fetch(`/api/post-view/${slug}`, { method: 'POST' }).catch(() => {});
        } catch (e) {}
      }
    } catch (err) {
      if (FALLBACK_ARTICLES[slug]) {
        setPost(FALLBACK_ARTICLES[slug]);
      } else {
        setPost(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://chipng.com/blog/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!post) return;
    const text = encodeURIComponent(`${post.title}\n\nRead more: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareX = () => {
    if (!post) return;
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}&via=chipng_app`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-[#D2F843] animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Loading article...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950">
        <MakroNavbar
          currentView="blog-article"
          onNavigate={onNavigate}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold">
            404
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Article Not Found</h2>
          <p className="text-sm text-neutral-500">
            The article you are looking for either does not exist, has been removed, or is currently an unpublished draft.
          </p>
          <button
            onClick={() => onNavigate('blog-directory')}
            className="px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Journal</span>
          </button>
        </main>
        <MakroFooter onNavigate={onNavigate} />
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);
  const cleanExcerpt = extractCleanExcerpt(post.excerpt || post.content, 160);
  const ogTitle = post.meta_title || `${post.title} — CHIP NG`;
  const ogDesc = post.meta_description || cleanExcerpt;
  const ogImage = post.cover_image_url || 'https://chipng.com/chipng_3d_logo.jpg';
  const categoryName = post.keywords?.[0] || articleCategory || 'NFC Technology';

  // Article structured data for search engines
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: ogDesc,
    image: [ogImage],
    datePublished: post.published_at || new Date().toISOString(),
    dateModified: post.updated_at || post.published_at || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: post.author || 'CHIP NG Editorial Team',
      url: 'https://chipng.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CHIP NG',
      logo: {
        '@type': 'ImageObject',
        url: 'https://chipng.com/chipng_exact_tile.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="title" content={ogTitle} />
        <meta name="description" content={ogDesc} />
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="CHIP NG" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:creator" content="@chipng_app" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <MakroNavbar
        currentView="blog-article"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 pb-24">
        {/* Draft Notice if post is unpublished */}
        {post.is_published === false && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Draft Preview Mode: This article is currently unpublished and only accessible via direct preview link.</span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
          <button
            onClick={() => onNavigate('blog-directory')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors mb-6 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Journal</span>
          </button>
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-neutral-500">
            <span className="px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] font-bold">
              {categoryName}
            </span>
            <span>·</span>
            <time dateTime={post.published_at}>
              {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recently Published'}
            </time>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readingTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.12]">
            {post.title}
          </h1>

          {cleanExcerpt && (
            <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
              {cleanExcerpt}
            </p>
          )}

          {/* Author bar & social sharing */}
          <div className="py-4 border-y border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold flex items-center justify-center text-xs shadow-xs">
                CN
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block">
                  {post.author || 'CHIP NG Editorial'}
                </span>
                <span className="text-[11px] text-neutral-400">Smart Contactless Systems & Growth Advisory</span>
              </div>
            </div>

            {/* Social Sharing Toolbar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400 mr-1 hidden sm:inline">Share:</span>
              
              {/* WhatsApp Button */}
              <button
                onClick={handleShareWhatsApp}
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleShareX}
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Share on X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors cursor-pointer"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors cursor-pointer"
                title="Share on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </button>

              {/* Copy Link */}
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
                title="Copy Link to Clipboard"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
                <span className="font-semibold">{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.cover_image_url && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-10">
            <div className="rounded-3xl overflow-hidden aspect-[16/9] border border-neutral-200/80 dark:border-neutral-800 shadow-sm bg-neutral-100 dark:bg-neutral-900">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Article Body - FIXED: Renders Sanitized HTML securely with proper typography */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <SanitizedBlogContent content={post.content} />
        </article>

        {/* Article Bottom Share & Tags */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 font-semibold">Tags:</span>
            {(post.keywords && post.keywords.length > 0 ? post.keywords : ['NFC', 'Smart Card', 'Nigeria', 'Networking']).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* CTA Conversion Box */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-neutral-950 text-white dark:bg-[#12141A] border border-neutral-800 shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#D2F843]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-[#D2F843]/20 text-[#D2F843] text-[11px] font-mono font-bold uppercase tracking-wider">
                Official Hardware & Profile Platform
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Stop handing out paper business cards that end up lost in car seats.
              </h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                Join top Nigerian realtors, corporate teams, and founders. Tap your CHIP NG card to any phone to instantly exchange verified contact details, property catalogs, and social portfolios.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('nfc-sales')}
                  className="px-6 py-3 rounded-full bg-[#D2F843] text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Order Your Smart NFC Card</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://wa.me/2348100764154?text=Hi%20CHIP%20NG%2C%20I%20read%20your%20article%20and%20want%20to%20order%20an%20NFC%20card"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles Component */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RelatedPosts
            currentPostSlug={post.slug}
            currentKeywords={post.keywords || []}
          />
        </div>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
