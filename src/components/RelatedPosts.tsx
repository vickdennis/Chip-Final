import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowRight, Clock } from 'lucide-react';
import { extractCleanExcerpt } from '../utils/sanitizeHtml';

export function RelatedPosts({
  currentPostSlug,
  currentKeywords,
}: {
  currentPostSlug: string;
  currentKeywords: string[];
}) {
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        let posts: any[] = [];

        // 1. Try local backend API first
        try {
          const apiRes = await fetch('/api/posts');
          if (apiRes.ok) {
            const apiPosts = await apiRes.json();
            if (Array.isArray(apiPosts) && apiPosts.length > 0) {
              posts = apiPosts.filter((p: any) => p.is_published && p.slug !== currentPostSlug);
            }
          }
        } catch (e) {}

        // 2. Fallback to Supabase if API returned empty
        if (posts.length === 0) {
          const { data } = await supabase
            .from('posts')
            .select('title, slug, excerpt, content, cover_image_url, keywords, published_at, category')
            .eq('is_published', true)
            .neq('slug', currentPostSlug)
            .limit(10);
          if (data) posts = data;
        }

        if (!posts || posts.length === 0) return;

        // Fetch categories for all posts
        let categories: Record<string, string> = {};
        try {
          const catRes = await fetch('/api/post-categories-all');
          if (catRes.ok) {
            categories = await catRes.json();
          }
        } catch (e) {}

        const currentCategory = categories[currentPostSlug] || '';
        const currentKwList = Array.isArray(currentKeywords) ? currentKeywords : [];

        // Score posts based on keywords and category matches
        const scoredPosts = posts.map((post) => {
          let score = 0;

          // 1. Same keywords
          if (post.keywords && currentKwList.length > 0) {
            const postKws = Array.isArray(post.keywords) ? post.keywords : [];
            const intersection = postKws.filter((k: string) =>
              currentKwList.some((c) => c && typeof c === 'string' && c.toLowerCase() === String(k).toLowerCase())
            );
            score += intersection.length * 10;
          }

          // 2. Same category
          const postCat = post.category || categories[post.slug] || '';
          if (postCat && (postCat === currentCategory || currentKwList.includes(postCat))) {
            score += 5;
          }

          return { ...post, score };
        });

        // Sort by score desc
        scoredPosts.sort((a, b) => b.score - a.score);

        setRelated(scoredPosts.slice(0, 3));
      } catch (e) {
        console.error('Error fetching related posts:', e);
      }
    };

    fetchRelated();
  }, [currentPostSlug, currentKeywords]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 mb-8 border-t border-neutral-200/80 dark:border-neutral-800 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#84A900] dark:text-[#D2F843]">
            Curated For You
          </span>
          <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight text-neutral-950 dark:text-white mt-1">
            Related Articles
          </h3>
        </div>
        <a
          href="/blog"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors hidden sm:flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {related.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={post.cover_image_url || '/chipng_3d_logo.jpg'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/chipng_3d_logo.jpg';
                  }}
                />
              </div>

              <div className="p-5 space-y-2">
                <div className="text-[11px] font-mono text-[#84A900] dark:text-[#D2F843] font-semibold">
                  {post.keywords?.[0] || 'Article'}
                </div>

                <h4 className="font-bold text-base leading-snug text-neutral-950 dark:text-white group-hover:text-[#84A900] dark:group-hover:text-[#D2F843] transition-colors line-clamp-2">
                  {post.title}
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {extractCleanExcerpt(post.excerpt || post.content, 110)}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-semibold flex items-center justify-between text-neutral-900 dark:text-neutral-200">
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
