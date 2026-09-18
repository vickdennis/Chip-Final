import React, { useState, useEffect, useRef } from 'react';
import { CreditCard } from 'lucide-react';

interface AutoSlidingMediaProps {
  mediaUrls: string[];
  productName: string;
}

export function AutoSlidingMedia({ mediaUrls, productName }: AutoSlidingMediaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (mediaUrls.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-black/20 dark:text-white/20">
        <CreditCard className="w-12 h-12 stroke-[1.5]" />
      </div>
    );
  }
  
  useEffect(() => {
    if (mediaUrls.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const nextScroll = scrollLeft + clientWidth;
        
        if (nextScroll >= maxScroll + 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 3000); // Auto slide every 3 seconds
    
    return () => clearInterval(interval);
  }, [mediaUrls.length]);
  
  return (
    <div ref={scrollRef} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
      {mediaUrls.map((url: string, i: number) => (
        <div key={i} className="w-full h-full flex-shrink-0 snap-center relative">
          {url.match(/\.(mp4|webm)$/i) ? (
            <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <img src={url} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
        </div>
      ))}
    </div>
  );
}
