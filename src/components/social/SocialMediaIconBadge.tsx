import React from 'react';
import { Globe, Mail } from 'lucide-react';
import { 
  FaXTwitter, 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaFacebook, 
  FaYoutube, 
  FaTwitch, 
  FaTiktok, 
  FaSnapchat, 
  FaPinterest, 
  FaReddit, 
  FaDiscord, 
  FaSlack, 
  FaTelegram, 
  FaWhatsapp, 
  FaWeixin, 
  FaLine, 
  FaMedium, 
  FaDribbble, 
  FaBehance, 
  FaFigma, 
  FaDev, 
  FaProductHunt, 
  FaStackOverflow, 
  FaGitlab, 
  FaBitbucket, 
  FaSpotify, 
  FaSoundcloud, 
  FaPatreon, 
  FaPaypal 
} from 'react-icons/fa6';
import { 
  SiBuymeacoffee, 
  SiSubstack, 
  SiApplemusic, 
  SiVenmo 
} from 'react-icons/si';

export interface SocialPlatformConfig {
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  aliases?: string[];
}

export const SOCIAL_PLATFORMS_CONFIG: SocialPlatformConfig[] = [
  { name: 'Website', icon: Globe, color: '#000000', aliases: ['web', 'site', 'link', 'portfolio'] },
  { name: 'Email', icon: Mail, color: '#EA4335', aliases: ['mail', 'contact'] },
  { name: 'X (Twitter)', icon: FaXTwitter, color: '#000000', aliases: ['x', 'twitter', 'twitter/x'] },
  { name: 'GitHub', icon: FaGithub, color: '#181717', aliases: ['github', 'git'] },
  { name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2', aliases: ['linkedin', 'li'] },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F', aliases: ['instagram', 'ig'] },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2', aliases: ['facebook', 'fb'] },
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000', aliases: ['youtube', 'yt'] },
  { name: 'Twitch', icon: FaTwitch, color: '#9146FF', aliases: ['twitch'] },
  { name: 'TikTok', icon: FaTiktok, color: '#000000', aliases: ['tiktok', 'tt'] },
  { name: 'Snapchat', icon: FaSnapchat, color: '#FFFC00', aliases: ['snapchat', 'snap'] },
  { name: 'Pinterest', icon: FaPinterest, color: '#E60023', aliases: ['pinterest', 'pin'] },
  { name: 'Reddit', icon: FaReddit, color: '#FF4500', aliases: ['reddit'] },
  { name: 'Discord', icon: FaDiscord, color: '#5865F2', aliases: ['discord'] },
  { name: 'Slack', icon: FaSlack, color: '#4A154B', aliases: ['slack'] },
  { name: 'Telegram', icon: FaTelegram, color: '#26A5E4', aliases: ['telegram', 'tg'] },
  { name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', aliases: ['whatsapp', 'wa'] },
  { name: 'WeChat', icon: FaWeixin, color: '#07C160', aliases: ['wechat', 'weixin'] },
  { name: 'Line', icon: FaLine, color: '#00C300', aliases: ['line'] },
  { name: 'Medium', icon: FaMedium, color: '#000000', aliases: ['medium'] },
  { name: 'Substack', icon: SiSubstack, color: '#FF6719', aliases: ['substack'] },
  { name: 'Dribbble', icon: FaDribbble, color: '#EA4C89', aliases: ['dribbble'] },
  { name: 'Behance', icon: FaBehance, color: '#1769FF', aliases: ['behance'] },
  { name: 'Figma', icon: FaFigma, color: '#F24E1E', aliases: ['figma'] },
  { name: 'Dev.to', icon: FaDev, color: '#0A0A0A', aliases: ['dev', 'dev.to'] },
  { name: 'ProductHunt', icon: FaProductHunt, color: '#DA552F', aliases: ['producthunt', 'ph'] },
  { name: 'StackOverflow', icon: FaStackOverflow, color: '#F58025', aliases: ['stackoverflow', 'stack'] },
  { name: 'GitLab', icon: FaGitlab, color: '#FC6D26', aliases: ['gitlab'] },
  { name: 'Bitbucket', icon: FaBitbucket, color: '#0052CC', aliases: ['bitbucket'] },
  { name: 'Spotify', icon: FaSpotify, color: '#1DB954', aliases: ['spotify'] },
  { name: 'AppleMusic', icon: SiApplemusic, color: '#FA243C', aliases: ['applemusic', 'apple music'] },
  { name: 'SoundCloud', icon: FaSoundcloud, color: '#FF3300', aliases: ['soundcloud'] },
  { name: 'Patreon', icon: FaPatreon, color: '#FF424D', aliases: ['patreon'] },
  { name: 'BuyMeACoffee', icon: SiBuymeacoffee, color: '#FFDD00', aliases: ['buymeacoffee', 'bmc'] },
  { name: 'Venmo', icon: SiVenmo, color: '#008CFF', aliases: ['venmo'] },
  { name: 'PayPal', icon: FaPaypal, color: '#00457C', aliases: ['paypal'] }
];

export function findSocialPlatform(nameOrAlias: string): SocialPlatformConfig {
  if (!nameOrAlias) return SOCIAL_PLATFORMS_CONFIG[0];
  const normalized = nameOrAlias.trim().toLowerCase();
  
  const found = SOCIAL_PLATFORMS_CONFIG.find(p => 
    p.name.toLowerCase() === normalized || 
    (p.aliases && p.aliases.includes(normalized))
  );

  return found || SOCIAL_PLATFORMS_CONFIG[0];
}

export type SocialIconStyle = 'color-circle' | 'white-circle' | 'white-icon' | 'original';

export interface SocialMediaIconBadgeProps {
  platform: string;
  style?: SocialIconStyle;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  brandColorOverride?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  showHoverEffect?: boolean;
}

/**
 * Standardized Social Media Icon Badge Component
 * Implements the signature User Dashboard "Social Tab" aesthetic across the entire platform:
 * - Color Circle: Vibrant brand color circular badge with white icon
 * - White Circle: Light / Dark minimal circle with brand color icon
 * - White Icon: Solid Dark / White circular contrast badge
 * - Original: Subtle rounded badge with brand color icon
 */
export const SocialMediaIconBadge: React.FC<SocialMediaIconBadgeProps> = ({
  platform,
  style = 'color-circle',
  size = 'md',
  href,
  className = '',
  brandColorOverride,
  onClick,
  title,
  showHoverEffect = true
}) => {
  const platformDef = findSocialPlatform(platform);
  const Icon = platformDef.icon;
  const color = brandColorOverride || platformDef.color;
  const displayTitle = title || platformDef.name;

  // Size mapping
  const sizeConfig = {
    xs: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
    sm: { box: 'w-9 h-9', icon: 'w-4 h-4' },
    md: { box: 'w-10 h-10 sm:w-11 sm:h-11', icon: 'w-4.5 h-4.5 sm:w-5 sm:h-5' },
    lg: { box: 'w-12 h-12', icon: 'w-6 h-6' },
    xl: { box: 'w-14 h-14', icon: 'w-7 h-7' }
  }[size];

  const hoverClasses = showHoverEffect 
    ? 'hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer' 
    : '';

  let badgeContent: React.ReactNode;

  if (style === 'color-circle') {
    badgeContent = (
      <div 
        className={`${sizeConfig.box} flex items-center justify-center rounded-full shadow-sm shrink-0 ${hoverClasses} ${className}`}
        style={{ backgroundColor: color, color: '#ffffff' }}
        title={displayTitle}
      >
        <Icon className={sizeConfig.icon} />
      </div>
    );
  } else if (style === 'white-circle') {
    badgeContent = (
      <div 
        className={`${sizeConfig.box} flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shadow-xs shrink-0 ${hoverClasses} ${className}`}
        style={{ color: color }}
        title={displayTitle}
      >
        <Icon className={sizeConfig.icon} />
      </div>
    );
  } else if (style === 'white-icon') {
    badgeContent = (
      <div 
        className={`${sizeConfig.box} flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-xs shrink-0 ${hoverClasses} ${className}`}
        title={displayTitle}
      >
        <Icon className={sizeConfig.icon} />
      </div>
    );
  } else {
    // style === 'original'
    badgeContent = (
      <div 
        className={`${sizeConfig.box} flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-2xs shrink-0 ${hoverClasses} ${className}`}
        style={{ color: color }}
        title={displayTitle}
      >
        <Icon className={sizeConfig.icon} />
      </div>
    );
  }

  if (href) {
    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="no-underline inline-block shrink-0 focus:outline-none"
        title={displayTitle}
        aria-label={displayTitle}
      >
        {badgeContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="bg-transparent border-0 p-0 m-0 shrink-0 focus:outline-none cursor-pointer"
        title={displayTitle}
        aria-label={displayTitle}
      >
        {badgeContent}
      </button>
    );
  }

  return <>{badgeContent}</>;
};

export default SocialMediaIconBadge;
