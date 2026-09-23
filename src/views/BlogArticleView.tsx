import React, { useEffect, useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ArrowLeft, Clock, Share2, Check, Twitter, Linkedin, Link2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  meta_title?: string;
  meta_description?: string;
  published_at: string;
  excerpt: string;
  keywords?: string[];
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
### The Core Flaw of Static Accounting Spreadsheets

Most solopreneurs and independent agency founders manage their business finances looking into a rearview mirror. Accounting tools like QuickBooks or Xero excel at reporting what happened 30 days ago, but fail catastrophically at answering the single question that keeps founders awake at 2 AM:

> *"If my top client pays 45 days late and my operating costs rise by 12%, do I run out of cash before Q3?"*

Traditional financial software assumes fixed monthly linearity. In reality, modern client retainers, project milestone payments, and software licensing fees exhibit high volatility and payment friction.

### Probabilistic Liquidity Modeling

CHIPNG’s predictive finance module replaces linear projections with probabilistic Markov-chain simulations. By connecting directly to your bank account and invoice ledger, the engine evaluates:

1. **Client Settlement Lag:** Identifying each client's historical payment delta relative to due dates.
2. **Deterministic Run-Rate:** Isolating critical fixed overhead (cloud hosting, contractor retainers, tax liabilities).
3. **Discretionary Variable Buffers:** Dynamically projecting safe distributions without triggering liquidity warning thresholds.

### Concrete Outcomes

Teams adopting autonomous runway forecasting report an average **3.4x decrease in cash deficits** within 90 days. Instead of panicking over a delayed wire, our notification system alerts you 18 days ahead of time, automating polite milestone nudges and dynamic discount offers for immediate settlement.
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
### Why Physical Touchpoints Still Dictate Deal Velocity

In an era saturated with cold LinkedIn messages and spam emails, in-person serendipity carries unprecedented leverage. Yet, the traditional business card has remained fundamentally unchanged for over a century: static cardstock that ends up buried in a coat pocket or wastebasket.

When we set out to build the CHIPNG physical card, we established two non-negotiable architectural mandates:

1. **Sub-10ms Handshake Latency:** Zero hesitation between the physical tap and the smartphone opening your dynamic presence.
2. **Zero App Dependency:** If a prospect needs to download an application to view your portfolio, you have already lost 80% of conversion.

### The Material Science of Antenna Resonance

Metal cards traditionally pose a fatal obstacle for High-Frequency (HF) radio signals. Metal shields electromagnetic induction, causing standard RFID and NFC tags to fail completely when encased in stainless steel or aluminum.

To solve this, CHIPNG engineered a proprietary dual-loop ceramic antenna decoupled from the titanium body using a micro-ferrite absorption layer. The result is a 360-degree transmission field operating at 13.56 MHz that activates even through thick smartphone cases.
    `,
  },
};

export default function BlogArticleView({
  onNavigate,
  slug,
  isDarkMode,
  toggleDarkMode,
}: {
  onNavigate: (view: ViewState) => void;
  slug: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
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
          // default to first fallback
          setPost(FALLBACK_ARTICLES['predictive-ai-cash-runway-forecasting']);
        }
      } else {
        setPost(data);
      }
    } catch (err) {
      setPost(FALLBACK_ARTICLES[slug] || FALLBACK_ARTICLES['predictive-ai-cash-runway-forecasting']);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-[#D2F843] animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">Article not found</h2>
        <button
          onClick={() => onNavigate('blog-directory')}
          className="px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold"
        >
          Return to Journal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950">
      <Helmet>
        <title>{post.meta_title || `${post.title} — CHIPNG Journal`}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
      </Helmet>

      <MakroNavbar
        currentView="blog-article"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 pb-24">
        {/* Article Breadcrumb & Back */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-10">
          <button
            onClick={() => onNavigate('blog-directory')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all articles</span>
          </button>
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-6 sm:px-8 space-y-6">
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
            <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[#84A900] dark:text-[#D2F843] font-bold">
              {post.keywords?.[0] || 'Engineering'}
            </span>
            <span>·</span>
            <time>
              {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recent'}
            </time>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              6 min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.12]">
            {post.title}
          </h1>

          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Social share & copy bar */}
          <div className="py-4 border-y border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold flex items-center justify-center text-xs">
                CN
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block">CHIPNG Research</span>
                <span className="text-[11px]">Systems & Product Advisory</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="max-w-4xl mx-auto px-6 sm:px-8 my-10">
            <div className="rounded-3xl overflow-hidden aspect-[16/9] border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Body */}
        <article className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-6">
            {post.content.split('\n\n').map((block, i) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-2xl font-bold text-neutral-950 dark:text-white pt-6 pb-2 tracking-tight">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={i}
                    className="p-5 my-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border-l-4 border-[#D2F843] italic text-neutral-800 dark:text-neutral-200"
                  >
                    {trimmed.replace('> ', '')}
                  </blockquote>
                );
              }
              if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
                return (
                  <p key={i} className="pl-4 border-l-2 border-neutral-200 dark:border-neutral-700 text-sm sm:text-base font-medium">
                    {trimmed}
                  </p>
                );
              }
              return (
                <p key={i} className="text-sm sm:text-base leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </article>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
