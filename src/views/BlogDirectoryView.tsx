import React, { useEffect, useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Clock, ChevronLeft, Rss } from 'lucide-react';
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

export default function BlogDirectoryView({
  onNavigate,
  onNavigateToArticle,
  isDarkMode,
  toggleDarkMode
}: {
  onNavigate: (view: ViewState) => void;
  onNavigateToArticle: (slug: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

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

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);


  const downloadRssFeed = () => {
    const siteUrl = 'https://chipng.com';
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>CHIP NG Blog</title>
  <link>${siteUrl}/blog</link>
  <description>Latest insights, updates, and articles from the CHIP NG team.</description>
  <language>en-us</language>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${posts.map(post => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${siteUrl}/blog/${post.slug}</link>
    <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
    <pubDate>${new Date(post.published_at || new Date()).toUTCString()}</pubDate>
    <description><![CDATA[${post.excerpt}]]></description>
  </item>`).join('')}
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
    <div className="min-h-screen pb-20">
      <Helmet>
        <title>Blog - CHIP NG</title>
        <meta name="description" content="Read the latest insights, updates, and articles from the CHIP NG team." />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-[#eaeaeb] dark:border-[#333]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('landing')}
              className="mr-4 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="font-sans font-bold text-xl tracking-tight cursor-pointer" onClick={() => onNavigate('landing')}>
              CHIP NG <span className="text-gray-400 font-normal">/ Blog</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={downloadRssFeed}
              className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
              title="RSS Feed"
            >
              <Rss className="w-4 h-4" />
              <span className="hidden sm:inline">RSS</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Latest Updates</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Insights, strategies, and announcements from our team to help you grow your digital presence.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 aspect-video rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
            <p className="text-gray-500">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map(post => (
              <article 
                key={post.id} 
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => onNavigateToArticle(post.slug)}
              >
                <div className="overflow-hidden rounded-xl mb-4 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 aspect-video">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-3 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {post.keywords && post.keywords.length > 0 && (
                    <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded font-bold">
                      {post.keywords[0]}
                    </span>
                  )}
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Read Article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#cfc4c5] dark:border-[#333] rounded-md disabled:opacity-50 font-bold text-sm hover:bg-black/5"
            >
              Previous
            </button>
            <span className="text-sm font-bold mx-4 text-[#7e7576]">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#cfc4c5] dark:border-[#333] rounded-md disabled:opacity-50 font-bold text-sm hover:bg-black/5"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
