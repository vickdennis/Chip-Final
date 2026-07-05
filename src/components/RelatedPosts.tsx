import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';

export function RelatedPosts({ currentPostSlug, currentKeywords }: { currentPostSlug: string, currentKeywords: string[] }) {
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Fetch all published posts
        const { data: posts } = await supabase.from('posts').select('title, slug, excerpt, cover_image_url, keywords').eq('is_published', true).neq('slug', currentPostSlug);
        
        if (!posts) return;

        // Fetch categories for all posts
        const catRes = await fetch('/api/post-categories-all');
        let categories: Record<string, string> = {};
        if (catRes.ok) {
          categories = await catRes.json();
        }

        const currentCategory = categories[currentPostSlug] || '';

        // Score posts
        const scoredPosts = posts.map(post => {
          let score = 0;
          
          // 1. Same tags/keywords
          if (post.keywords && currentKeywords) {
            const intersection = post.keywords.filter((k: string) => currentKeywords.includes(k));
            score += intersection.length * 10;
          }

          // 2. Same category
          const postCat = categories[post.slug] || '';
          if (postCat && postCat === currentCategory) {
            score += 5;
          }

          return { ...post, score };
        });

        // Sort by score desc, then fallback to recent (assuming original array is roughly recent or we don't have created_at here. Let's add created_at if we can, else just score)
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
    <div className="mt-16 mb-8 border-t border-[#cfc4c5] dark:border-[#333] pt-12">
      <h3 className="font-sans font-bold text-2xl mb-8">You Might Also Like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {related.map(post => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-md overflow-hidden hover:border-black dark:hover:border-white transition-colors">
            {post.cover_image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-bold font-sans text-lg leading-tight mb-2 group-hover:underline">{post.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
              <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                Read Article <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
