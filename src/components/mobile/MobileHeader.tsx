import React from 'react';
import { Bell, WifiOff, Monitor } from 'lucide-react';
import chipngExactTile from '../../assets/images/chipng_exact_tile.png';

interface MobileHeaderProps {
  profile: any;
  unreadNotificationsCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onSwitchToWeb?: () => void;
  isOffline?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  profile,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenProfile,
  onSwitchToWeb,
  isOffline = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 select-none">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Offline Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={chipngExactTile}
                alt="CHIP NG"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              CHIP<span className="text-[#D2F843]">NG</span>
            </span>
          </div>

          {isOffline && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono font-medium">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Switch to Web view (for desktop/tablet users testing mobile app) */}
          {onSwitchToWeb && (
            <button
              onClick={onSwitchToWeb}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-xs font-mono transition-colors"
              title="Switch to Web Dashboard"
            >
              <Monitor className="w-3.5 h-3.5" /> Web
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D2F843] ring-2 ring-[#09090b]" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-xl bg-neutral-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer focus:ring-2 focus:ring-[#D2F843]/50 transition-all"
            aria-label="View Profile"
          >
            {profile?.cover_image_url ? (
              <img
                src={profile.cover_image_url}
                alt={profile.full_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-xs font-bold text-white">
                {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
