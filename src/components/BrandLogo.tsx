import React from 'react';
import chipngExactTile from '../assets/images/chipng_exact_tile.png';
import chipngExactFull from '../assets/images/chipng_exact_3d_1790453078487.jpg';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withWordmark?: boolean;
  wordmarkClass?: string;
  subtitle?: string;
  className?: string;
  iconOnly?: boolean;
  useFullBadge?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  withWordmark = true,
  wordmarkClass = '',
  subtitle,
  className = '',
  iconOnly = false,
  useFullBadge = false,
}) => {
  // Dimension mappings tuned for the exact 3D CHIPNG squircle emblem
  const sizeMap = {
    xs: {
      box: 'w-7 h-7 rounded-lg',
      img: 'w-7 h-7',
      text: 'text-sm font-bold',
      subText: 'text-[9px]',
      gap: 'gap-2',
    },
    sm: {
      box: 'w-9 h-9 rounded-xl',
      img: 'w-9 h-9',
      text: 'text-base font-bold',
      subText: 'text-[10px]',
      gap: 'gap-2.5',
    },
    md: {
      box: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl',
      img: 'w-10 h-10 sm:w-11 sm:h-11',
      text: 'text-lg sm:text-xl font-bold',
      subText: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      box: 'w-14 h-14 rounded-2xl',
      img: 'w-14 h-14',
      text: 'text-2xl font-extrabold',
      subText: 'text-xs',
      gap: 'gap-3.5',
    },
    xl: {
      box: 'w-20 h-20 rounded-3xl',
      img: 'w-20 h-20',
      text: 'text-3xl font-extrabold',
      subText: 'text-sm',
      gap: 'gap-4',
    },
    '2xl': {
      box: 'w-28 h-28 rounded-[2rem]',
      img: 'w-28 h-28',
      text: 'text-4xl font-extrabold',
      subText: 'text-base',
      gap: 'gap-5',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const imageSrc = useFullBadge ? chipngExactFull : chipngExactTile;

  return (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Exact 3D CHIPNG Logo Emblem Tile */}
      <div
        className={`relative ${currentSize.box} shrink-0 overflow-hidden flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-105 group-hover:drop-shadow-md`}
      >
        <img
          src={imageSrc}
          alt="CHIPNG 3D Brand Logo"
          className="w-full h-full object-contain filter drop-shadow-sm will-change-transform"
          loading="eager"
          decoding="async"
        />
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
