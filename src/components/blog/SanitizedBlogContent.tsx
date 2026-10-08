import React, { useMemo } from 'react';
import { sanitizeBlogHtml } from '../../utils/sanitizeHtml';

interface SanitizedBlogContentProps {
  content: string;
  className?: string;
}

export default function SanitizedBlogContent({ content, className = '' }: SanitizedBlogContentProps) {
  const sanitizedHtml = useMemo(() => {
    return sanitizeBlogHtml(content);
  }, [content]);

  // Handle broken images by attaching an error handler to the container
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      // If it's internal link or WhatsApp, let normal action proceed
      if (href && !href.startsWith('#')) {
        // Handled naturally by browser
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-950 dark:prose-headings:text-white
        prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-2
        prose-p:my-4 prose-p:leading-relaxed
        prose-strong:font-bold prose-strong:text-neutral-950 dark:prose-strong:text-white
        prose-a:text-[#6a8700] dark:prose-a:text-[#D2F843] prose-a:underline prose-a:font-semibold hover:prose-a:opacity-80
        prose-blockquote:border-l-4 prose-blockquote:border-[#D2F843] prose-blockquote:bg-neutral-100/80 dark:prose-blockquote:bg-neutral-800/60 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:my-6 prose-blockquote:italic
        prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-li:my-1
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-li:my-1
        prose-img:rounded-3xl prose-img:border prose-img:border-neutral-200/80 dark:prose-img:border-neutral-800 prose-img:my-8 prose-img:max-h-[550px] prose-img:w-full prose-img:object-cover prose-img:shadow-sm
        prose-hr:my-8 prose-hr:border-neutral-200 dark:prose-hr:border-neutral-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:text-xs prose-code:font-mono
        prose-pre:bg-neutral-950 prose-pre:text-white prose-pre:rounded-2xl prose-pre:p-4 prose-pre:overflow-x-auto
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
