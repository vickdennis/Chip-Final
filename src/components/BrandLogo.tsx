import React from 'react';
import chipng3dLogo from '../assets/images/chipng_3d_logo_1790417547026.jpg';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withWordmark?: boolean;
  wordmarkClass?: string;
  subtitle?: string;
  className?: string;
  iconOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  withWordmark = true,
  wordmarkClass = '',
  subtitle,
  className = '',
  iconOnly = false,
}) => {
  // Dimension mappings ensuring clean, crisp raster scaling without blur
  const sizeMap = {
    xs: {
      box: 'w-6 h-6 rounded-lg',
      img: 'w-6 h-6',
      text: 'text-sm',
      subText: 'text-[9px]',
      gap: 'gap-2',
    },
    sm: {
      box: 'w-8 h-8 rounded-xl',
      img: 'w-8 h-8',
      text: 'text-base font-bold',
      subText: 'text-[10px]',
      gap: 'gap-2.5',
    },
    md: {
      box: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
      img: 'w-9 h-9 sm:w-10 sm:h-10',
      text: 'text-lg sm:text-xl font-bold',
      subText: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      img: 'w-12 h-12',
      text: 'text-2xl font-extrabold',
      subText: 'text-xs',
      gap: 'gap-3.5',
    },
    xl: {
      box: 'w-16 h-16 rounded-3xl',
      img: 'w-16 h-16',
      text: 'text-3xl font-extrabold',
      subText: 'text-sm',
      gap: 'gap-4',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* 3D CHIPNG Logo Emblem Container */}
      <div
        className={`relative ${currentSize.box} shrink-0 overflow-hidden bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/90 dark:border-white/15 shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300 ease-out`}
        style={{
          boxShadow: '0 2px 10px -2px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <img
          src={chipng3dLogo}
          alt="CHIPNG 3D Logo"
          className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-110 transition-transform duration-300 will-change-transform"
          loading="eager"
          decoding="async"
        />
        {/* Subtle sheen highlight border for high-end 3D finish */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-black/5 dark:ring-white/10" />
      </div>

      {/* Brand Typography (Wordmark) */}
      {!iconOnly && withWordmark && (
        <div className="flex flex-col text-left leading-none">
          <span
            className={`font-display font-extrabold tracking-tight text-neutral-950 dark:text-white transition-colors duration-200 ${
              wordmarkClass || currentSize.text
            }`}
          >
            CHIPNG
          </span>
          {subtitle && (
            <span
              className={`font-mono uppercase tracking-widest font-semibold text-[#6b8500] dark:text-[#D2F843] mt-1 ${currentSize.subText}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
