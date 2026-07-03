import React, { useEffect, useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Clock, Twitter, Facebook, Linkedin, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  keywords: string[];
}

export default function BlogArticleView({
  onNavigate,
  slug,
  isDarkMode,
  toggleDarkMode
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

      if (error) throw error;
      setPost(data);

      // Track view
      if (data && data.id) {
        // Just fire and forget
        supabase.from('blog_views').insert([{ post_id: data.id }]).then();
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-mono text-sm">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2">Article not found</h2>
        <p className="text-gray-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => onNavigate('blog-directory')}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-medium"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24">
      <Helmet>
        <title>{post.meta_title || `${post.title} - CHIP NG Blog`}</title>
        <meta name="description" content={post.meta_description || ''} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || ''} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://chipng.com/blog/${post.slug}`} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#eaeaeb] dark:border-[#222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('blog-directory')}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Blog
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {post.keywords && post.keywords.length > 0 && (
              <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                {post.keywords[0]}
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-8">
            {post.title}
          </h1>

          {post.cover_image_url && (
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
              <img 
                src={post.cover_image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert prose-blue mx-auto max-w-3xl prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 mb-16">
          <div className="markdown-body">
            <Markdown>{post.content || ''}</Markdown>
          </div>
        </div>

        {/* Share Section */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Share this article</h3>
          <div className="flex flex-wrap gap-3">
            <a 
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-full text-sm font-medium transition-colors"
            >
              <Twitter className="w-4 h-4" /> Twitter
            </a>
            <a 
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] rounded-full text-sm font-medium transition-colors"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-full text-sm font-medium transition-colors"
            >
              <Facebook className="w-4 h-4" /> Facebook
            </a>
            <button 
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
            >
              <Link2 className="w-4 h-4" /> {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
