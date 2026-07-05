import React, { useEffect, useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Clock, Twitter, Facebook, Linkedin, Link2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  excerpt: string;
  keywords: string[];
  faq_json?: string;
  product_json?: string;
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
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://chipng.com" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://chipng.com/blog" },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://chipng.com/blog/${post.slug}` }
            ]
          })}
        </script>
        {/* FAQ Schema */}
        {post.faq_json && post.faq_json.length > 5 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": JSON.parse(post.faq_json).map((faq: any) => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": { "@type": "Answer", "text": faq.a }
              }))
            })}
          </script>
        )}
        {/* Product Schema */}
        {post.product_json && post.product_json.length > 5 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": post.title,
              "description": post.meta_description || post.excerpt,
              ...JSON.parse(post.product_json)
            })}
          </script>
        )}
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
          <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: post.content || '' }}></div>
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
            <a 
               href={`https://api.whatsapp.com/send?text=Check out this article: ${shareTitle} ${shareUrl}`} 
               target="_blank" 
               rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> WhatsApp
            </a>
            <button 
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
            >
              <Link2 className="w-4 h-4" /> {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {post.keywords && post.keywords.length > 0 && (
          <RelatedPosts keywords={post.keywords} currentPostId={post.id} onNavigateToArticle={(slug) => { window.location.href = `/blog/${slug}`; }} />
        )}
      </article>
    </div>
  );
}

function RelatedPosts({ keywords, currentPostId, onNavigateToArticle }: { keywords: string[], currentPostId: string, onNavigateToArticle: (slug: string) => void }) {
  const [related, setRelated] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchRelated() {
      // Fetch posts that overlap in keywords
      // Since Supabase doesn't easily do array intersection without RPC, we'll just fetch a bunch and filter locally for simplicity in this demo, or just fetch recent.
      const { data } = await supabase.from('posts').select('id, title, slug, cover_image_url, keywords').eq('is_published', true).neq('id', currentPostId).limit(10);
      if (data) {
        // Filter those that have at least one matching keyword (or just take first 3 if none)
        let matches = data.filter(p => p.keywords && p.keywords.some((k: string) => keywords.includes(k)));
        if (matches.length < 3) {
           matches = [...matches, ...data.filter(p => !matches.find(m => m.id === p.id))].slice(0, 3);
        } else {
           matches = matches.slice(0, 3);
        }
        setRelated(matches);
      }
    }
    fetchRelated();
  }, [keywords, currentPostId]);

  if (related.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto pt-16 mt-16 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(p => (
          <div key={p.id} className="group cursor-pointer" onClick={() => onNavigateToArticle(p.slug)}>
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              {p.cover_image_url ? (
                <img src={p.cover_image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
              )}
            </div>
            <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{p.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
