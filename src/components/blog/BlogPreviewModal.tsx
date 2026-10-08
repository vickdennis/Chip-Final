import React from 'react';
import { X, Clock, Calendar, Tag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import SanitizedBlogContent from './SanitizedBlogContent';
import { calculateReadingTime } from '../../utils/sanitizeHtml';

interface BlogPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    title: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    category?: string;
    keywords?: string[];
    author?: string;
  };
}

export default function BlogPreviewModal({ isOpen, onClose, post }: BlogPreviewModalProps) {
  if (!isOpen) return null;

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0A0B0E] text-neutral-900 dark:text-white w-full max-w-4xl rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top bar with notice and close */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#12141A]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              Live Article Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable preview body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] font-bold">
                {post.category || post.keywords?.[0] || 'CHIP NG Journal'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(), 'MMMM d, yyyy')}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.15]">
              {post.title || 'Untitled Blog Post'}
            </h1>

            {post.excerpt && (
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                {post.excerpt}
              </p>
            )}

            {/* Author info pill */}
            <div className="py-4 border-y border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold flex items-center justify-center text-xs">
                CN
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white block">
                  {post.author || 'CHIP NG Research'}
                </span>
                <span className="text-[11px] text-neutral-400">Systems & Technology Advisory</span>
              </div>
            </div>
          </div>

          {/* Cover image if provided */}
          {post.cover_image_url && (
            <div className="rounded-3xl overflow-hidden aspect-[16/9] border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rendered content */}
          <article className="pt-2">
            <SanitizedBlogContent content={post.content} />
          </article>

          {/* CTA Box */}
          <div className="mt-12 p-8 rounded-3xl bg-neutral-950 text-white dark:bg-[#12141A] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs uppercase tracking-wider font-mono text-[#D2F843] font-bold">
                Level Up Your Networking
              </div>
              <h3 className="text-xl font-bold">Upgrade to CHIP NG Smart Cards</h3>
              <p className="text-xs text-neutral-400 max-w-md">
                One contactless tap replaces stacks of paper cards. Update your listings, links, and contact info dynamically.
              </p>
            </div>
            <button className="px-6 py-3 rounded-full bg-[#D2F843] text-neutral-950 text-xs font-bold hover:opacity-90 flex items-center gap-2 whitespace-nowrap cursor-pointer">
              <span>Order Smart Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-neutral-200/80 dark:border-neutral-800 flex justify-end bg-neutral-50 dark:bg-[#12141A]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
