import React, { useEffect, useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ArrowRight, Clock, Rss, Search } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  cover_image_url: string;
  published_at: string;
  keywords: string[];
}

// Fallback high-editorial curated articles if database returns empty
const DEFAULT_EDITORIAL_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'How Solopreneurs are Using Predictive AI to Forecast 180-Day Cash Runway',
    slug: 'predictive-ai-cash-runway-forecasting',
    excerpt:
      'Eliminate the uncertainty of 30-to-60-day invoice delays. A breakdown of machine learning algorithms predicting bank liquidity for modern independent practices.',
    cover_image_url:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-09-15T10:00:00Z',
    keywords: ['Finance', 'AI Modeling', 'Cashflow'],
  },
  {
    id: 'post-2',
    title: 'The Hardware Engineering Behind Sub-10ms NFC Touchpoints',
    slug: 'hardware-engineering-sub-10ms-nfc',
    excerpt:
      'From custom dual-loop antenna coils to ceramic titanium coatings: how we engineered an instant digital handshake that converts 4x higher than paper business cards.',
    cover_image_url:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-08-28T14:30:00Z',
    keywords: ['Hardware', 'NFC', 'Design'],
  },
  {
    id: 'post-3',
    title: 'Why Frictionless Invoicing Beats Traditional Retainer Contracts',
    slug: 'frictionless-invoicing-retainer-speed',
    excerpt:
      'When payment friction drops to zero with instant Apple Pay and direct bank links, client settlement velocity improves by 340%. Here is the telemetry.',
    cover_image_url:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-08-10T09:15:00Z',
    keywords: ['Payments', 'Growth', 'Fintech'],
  },
  {
    id: 'post-4',
    title: 'Building a Sovereign Digital Identity in an Era of Platform Risk',
    slug: 'sovereign-digital-identity-platform-risk',
    excerpt:
      'Why owning your domain, vCard distribution, and CRM ledger is critical for independent consultants looking to scale past $500k annual recurring billing.',
    cover_image_url:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-07-22T11:45:00Z',
    keywords: ['Strategy', 'Identity', 'Consulting'],
  },
];

export default function BlogDirectoryView({
  onNavigate,
  onNavigateToArticle,
  isDarkMode,
  toggleDarkMode,
}: {
  onNavigate: (view: ViewState) => void;
  onNavigateToArticle: (slug: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, keywords, content')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setPosts(DEFAULT_EDITORIAL_POSTS);
      } else {
        setPosts(data);
      }
    } catch (err) {
      setPosts(DEFAULT_EDITORIAL_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === 'All' ||
      (post.keywords && post.keywords.some((k) => k.toLowerCase() === selectedTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts[0] || posts[0];
  const remainingPosts = filteredPosts.slice(1);

  const downloadRssFeed = () => {
    const siteUrl = 'https://chipng.com';
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>CHIPNG Journal</title>
  <link>${siteUrl}/blog</link>
  <description>The definitive engineering, design, and finance journal for modern solopreneurs.</description>
  <language>en-us</language>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${posts
    .map(
      (post) => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${siteUrl}/blog/${post.slug}</link>
    <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
    <pubDate>${new Date(post.published_at || new Date()).toUTCString()}</pubDate>
    <description><![CDATA[${post.excerpt}]]></description>
  </item>`
    )
    .join('')}
</channel>
</rss>`;

    const blob = new Blob([rss], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rss.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950">
      <Helmet>
        <title>Journal & Engineering - CHIPNG</title>
        <meta
          name="description"
          content="Insights on predictive finance, NFC hardware engineering, and digital identity for solopreneurs."
        />
      </Helmet>

      <MakroNavbar
        currentView="blog-directory"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1">
        {/* Editorial Header */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 border-b border-neutral-200/70 dark:border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    The CHIPNG Journal
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                  Ideas, systems, and engineering.
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
                  Explorations in predictive finance, contactless hardware, and sovereign creator business architecture.
                </p>
              </div>

              {/* RSS & Search bar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-full bg-white dark:bg-[#12141B] border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors w-48 sm:w-60"
                  />
                </div>
                <button
                  onClick={downloadRssFeed}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Rss className="w-3.5 h-3.5 text-[#84A900] dark:text-[#D2F843]" />
                  <span>RSS</span>
                </button>
              </div>
            </div>

            {/* Tag Filters */}
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['All', 'Finance', 'Hardware', 'Payments', 'Design', 'Strategy'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                      : 'bg-white dark:bg-[#12141B] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredPost && (
          <section className="py-12 border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#0C0E13]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div
                onClick={() => onNavigateToArticle(featuredPost.slug)}
                className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-neutral-50 dark:bg-[#12141B] rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
              >
                <div className="lg:col-span-7 rounded-2xl overflow-hidden aspect-[16/9] relative">
                  <img
                    src={featuredPost.cover_image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Featured Analysis
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                    <span className="text-[#84A900] dark:text-[#D2F843] font-bold">
                      {featuredPost.keywords?.[0] || 'Deep Dive'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      5 min read
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight group-hover:text-[#84A900] dark:group-hover:text-[#D2F843] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-neutral-950 dark:text-white">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Article Grid */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onNavigateToArticle(post.slug)}
                  className="group cursor-pointer bg-white dark:bg-[#12141B] rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <span className="text-[#84A900] dark:text-[#D2F843] font-semibold">
                        {post.keywords?.[0] || 'Article'}
                      </span>
                      <span>·</span>
                      <time>
                        {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recently'}
                      </time>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight group-hover:text-[#84A900] dark:group-hover:text-[#D2F843] transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                    <span>Read post</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
