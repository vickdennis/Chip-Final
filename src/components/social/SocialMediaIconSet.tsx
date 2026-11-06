import React from 'react';
import { motion } from 'motion/react';
import { SocialMediaIconBadge, SocialIconStyle, findSocialPlatform } from './SocialMediaIconBadge';

export type SocialPlatform = 'instagram' | 'linkedin' | 'whatsapp' | 'x' | 'youtube' | 'tiktok';

export interface SocialMediaIconProps {
  platform: SocialPlatform | string;
  href?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: SocialIconStyle;
}

export const SocialMediaIcon: React.FC<SocialMediaIconProps> = ({
  platform,
  href,
  label,
  onClick,
  className = '',
  size = 'md',
  showLabel = false,
  style = 'color-circle'
}) => {
  const platformDef = findSocialPlatform(platform);
  const displayLabel = label || platformDef.name;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <SocialMediaIconBadge
        platform={platform}
        style={style}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'xl' : 'lg'}
        href={href}
        onClick={onClick}
        title={displayLabel}
        showHoverEffect={true}
      />
      {showLabel && (
        <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 tracking-wide transition-colors">
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
  style?: SocialIconStyle;
  onPlatformClick?: (platform: SocialPlatform) => void;
  customLinks?: Partial<Record<SocialPlatform, string>>;
}

/**
 * Standardized Social Media Icon Set
 * Uses the exact User Dashboard "Social Tab" aesthetic across the entire platform
 */
export const SocialMediaIconSet: React.FC<SocialMediaIconSetProps> = ({
  className = '',
  size = 'md',
  showLabels = false,
  style = 'color-circle',
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
    <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-5 ${className}`}>
      {platforms.map((platform) => (
        <SocialMediaIcon
          key={platform}
          platform={platform}
          size={size}
          style={style}
          showLabel={showLabels}
          href={customLinks[platform]}
          onClick={() => onPlatformClick && onPlatformClick(platform)}
        />
      ))}
    </div>
  );
};

export default SocialMediaIconSet;
