import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface ProductImageSliderProps {
  images: string[];
  alt: string;
  badgeText: string;
  badgeType?: 'metal' | 'pvc' | 'tag';
  autoSlideInterval?: number;
}

export const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images,
  alt,
  badgeText,
  badgeType = 'pvc',
  autoSlideInterval = 3200,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Automatic smooth transition timer
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [images.length, isPaused, autoSlideInterval]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const diffX = touchStartX.current - e.changedTouches[0].clientX;
      const diffY = touchStartY.current - e.changedTouches[0].clientY;
      // Only trigger horizontal swipe if horizontal movement is greater than vertical movement
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      touchStartX.current = null;
      touchStartY.current = null;
    }
  };

  return (
    <div
      className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 overflow-hidden select-none group/slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Strip Track */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, i) => {
          const isVideo = src.match(/\.(mp4|webm)$/i);
          return (
            <div
              key={i}
              className="min-w-full w-full h-full shrink-0 relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center"
            >
              {isVideo ? (
                <video
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <img
                  src={src}
                  alt={`${alt} — view ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle Top Auto-Slide Progress Bar */}
      {images.length > 1 && (
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-black/25 z-20 overflow-hidden pointer-events-none">
          <div
            key={`${currentIndex}-${isPaused}`}
            className="h-full bg-[#76BB08] shadow-[0_0_8px_#76BB08]"
            style={{
              animation: isPaused
                ? 'none'
                : `slideProgress ${autoSlideInterval}ms linear forwards`,
              width: isPaused ? '100%' : undefined,
            }}
          />
        </div>
      )}

      {/* Top Left Badge: Hardware Type */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-20 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-neutral-950/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-white/10">
          <Zap className="w-3 h-3 text-[#76BB08]" />
          <span>{badgeText}</span>
        </span>
      </div>

      {/* Top Right Badge: Stock Status */}
      <div className="absolute top-3.5 right-3.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase z-20 shadow-sm pointer-events-none border border-emerald-400/30">
        In Stock
      </div>

      {/* Left Navigation Chevron Button (fades in on hover / mobile accessible) */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-950/75 hover:bg-neutral-950 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-200 z-30 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 shadow-md border border-white/10"
          aria-label="Previous product image"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Right Navigation Chevron Button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-950/75 hover:bg-neutral-950 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-200 z-30 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 shadow-md border border-white/10"
          aria-label="Next product image"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Bottom Animated Slide Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-30 px-3 pointer-events-auto">
          {images.map((_, mIdx) => (
            <button
              key={mIdx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(mIdx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === mIdx
                  ? 'w-6 bg-[#76BB08] shadow-[0_0_8px_rgba(118,187,8,0.7)]'
                  : 'w-1.5 bg-white/60 hover:bg-white hover:scale-125'
              }`}
              aria-label={`Slide to image ${mIdx + 1} of ${images.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
