import React from 'react';
import { motion } from 'motion/react';

export type SocialPlatform = 'instagram' | 'linkedin' | 'whatsapp' | 'x' | 'youtube' | 'tiktok';

export interface SocialMediaIconProps {
  platform: SocialPlatform;
  href?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Precision SVG paths in a uniform 24x24 container (stroke-width: 1.5 or clean monochrome fill)
const renderPlatformSvg = (platform: SocialPlatform) => {
  switch (platform) {
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M9.5 9.5c.3-.6.6-.6.9-.6h.6c.2 0 .4.1.5.4.3.7.8 1.9.9 2 .1.2.1.3 0 .5s-.3.3-.4.5c-.1.2-.3.4-.1.7.3.5.7 1 1.2 1.4.6.5 1.2.8 1.7 1 .3.1.5 0 .7-.2.2-.2.6-.7.8-.9.2-.3.4-.2.6-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3 0 .2 0 1.2-.5 1.7-.5.5-1.1.7-1.8.7-1.5 0-3.3-1-4.8-2.5-1.5-1.5-2.5-3.3-2.5-4.8 0-.7.2-1.3.7-1.8z" />
        </svg>
      );

    case 'x':
      return (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="transition-colors duration-300"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="transition-colors duration-300"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.48c.32-.32.6-.67.84-1.05V10.8a8.27 8.27 0 0 0 4.79 1.52v-3.45a4.85 4.85 0 0 1-2-.18z" />
        </svg>
      );

    default:
      return null;
  }
};

const getPlatformLabel = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'instagram': return 'Instagram';
    case 'linkedin': return 'LinkedIn';
    case 'whatsapp': return 'WhatsApp';
    case 'x': return 'X (Twitter)';
    case 'youtube': return 'YouTube';
    case 'tiktok': return 'TikTok';
  }
};

const getBrandAccentColor = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'instagram': return 'group-hover:text-pink-400';
    case 'linkedin': return 'group-hover:text-blue-400';
    case 'whatsapp': return 'group-hover:text-emerald-400';
    case 'x': return 'group-hover:text-white';
    case 'youtube': return 'group-hover:text-red-400';
    case 'tiktok': return 'group-hover:text-cyan-300';
  }
};

/**
 * Individual Luxury Glassmorphic Social Media Icon
 * Follows exact specifications:
 * - Style: Dark-mode luxury / Glassmorphism
 * - Frame: Squircle layout (rounded-2xl) with translucent background (bg-white/5),
 *   subtle border (border border-white/10), and back-drop blur (backdrop-blur-md)
 * - Hover State: Smooth scaling (hover:scale-105), subtle glow transition
 *   (hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]), gold/brand accent gradient shift (hover:border-amber-500/50)
 * - Icons: SVG paths inside uniform 24x24 container with stroke-width 1.5 or clean monochrome fill
 * - Micro-interactions: Framer Motion spring physics on press (whileTap={{ scale: 0.95 }})
 */
export const SocialMediaIcon: React.FC<SocialMediaIconProps> = ({
  platform,
  href,
  label,
  onClick,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const displayLabel = label || getPlatformLabel(platform);
  const brandAccent = getBrandAccentColor(platform);

  const sizeClasses = {
    sm: 'w-11 h-11 p-2.5',
    md: 'w-14 h-14 p-3.5',
    lg: 'w-16 h-16 p-4',
  }[size];

  const content = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        group relative flex items-center justify-center
        rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md
        text-white/80 transition-all duration-300 cursor-pointer
        hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
        hover:border-amber-500/50
        hover:text-white
        ${sizeClasses}
        ${className}
      `}
      title={displayLabel}
      aria-label={displayLabel}
    >
      {/* Subtle Inner Sheen */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* 24x24 Uniform SVG Container */}
      <div className={`w-6 h-6 flex items-center justify-center ${brandAccent}`}>
        {renderPlatformSvg(platform)}
      </div>

      {/* Gold ambient pulse glow on hover */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />
    </motion.div>
  );

  if (href) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="no-underline block"
        >
          {content}
        </a>
        {showLabel && (
          <span className="text-[10px] font-mono text-white/50 tracking-wider uppercase transition-colors group-hover:text-white">
            {displayLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5" onClick={onClick}>
      {content}
      {showLabel && (
        <span className="text-[10px] font-mono text-white/50 tracking-wider uppercase">
          {displayLabel}
        </span>
      )}
    </div>
  );
};

export interface SocialMediaIconSetProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  onPlatformClick?: (platform: SocialPlatform) => void;
  customLinks?: Partial<Record<SocialPlatform, string>>;
}

/**
 * Cohesive Glassmorphic Social Media Icon Set
 * Features all 6 requested platforms: Instagram, LinkedIn, WhatsApp, X, YouTube, TikTok
 */
export const SocialMediaIconSet: React.FC<SocialMediaIconSetProps> = ({
  className = '',
  size = 'md',
  showLabels = false,
  onPlatformClick,
  customLinks = {},
}) => {
  const platforms: SocialPlatform[] = [
    'instagram',
    'linkedin',
    'whatsapp',
    'x',
    'youtube',
    'tiktok',
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${className}`}>
      {platforms.map((platform) => (
        <SocialMediaIcon
          key={platform}
          platform={platform}
          size={size}
          showLabel={showLabels}
          href={customLinks[platform]}
          onClick={() => onPlatformClick && onPlatformClick(platform)}
        />
      ))}
    </div>
  );
};
