import React from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import BrandLogo from './BrandLogo';
import { 
  LogOut,
  Moon,
  Sun,
  Shield,
  Star,
  ExternalLink
} from 'lucide-react';

interface AdminLayoutProps {
  topRightContent?: React.ReactNode;
  hideMobileNav?: boolean;
  children: React.ReactNode;
  onNavigate: (view: ViewState) => void;
  activePath: 'dashboard' | 'bio' | 'enterprise';
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin?: boolean;
  userHeaderProfile?: {
    avatar_url?: string;
    cover_image_url?: string;
    full_name?: string;
    username?: string;
  };
}

export default function AdminLayout({
  children,
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  topRightContent,
  isAdmin,
  userHeaderProfile,
}: AdminLayoutProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#76BB08] selection:text-neutral-950 font-sans transition-colors flex flex-col">
      {/* Top Header - Ultra-clean App Header (Matching Screen 2 in IMG_3124.jpeg) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAFAFA]/85 dark:bg-[#0A0B0E]/85 border-b border-neutral-200/80 dark:border-white/10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Zone 1: User Avatar + Welcome back + Name (Exact match to IMG_3124.jpeg) with Brand Logo on Desktop */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop Brand Logo */}
            <button
              onClick={() => onNavigate('landing')}
              className="hidden lg:flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-xl transition-transform cursor-pointer"
              aria-label="CHIPNG Home"
            >
              <BrandLogo size="md" />
            </button>

            {/* Desktop Divider */}
            <div className="hidden lg:block h-6 w-px bg-neutral-200 dark:bg-white/10" />

            {/* Exact IMG_3124.jpeg Profile Header: Avatar + Welcome back + Name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('user-dashboard')}
                className="w-10 h-10 rounded-full border border-neutral-300 dark:border-white/15 overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 shadow-xs focus:outline-none cursor-pointer group"
                title="Your Profile"
              >
                {userHeaderProfile?.avatar_url || userHeaderProfile?.cover_image_url ? (
                  <img
                    src={userHeaderProfile.avatar_url || userHeaderProfile.cover_image_url}
                    alt={userHeaderProfile.full_name || 'User'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs uppercase bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                    {(userHeaderProfile?.full_name || userHeaderProfile?.username || 'U').charAt(0)}
                  </div>
                )}
              </button>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">
                  Welcome back
                </span>
                <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-neutral-900 dark:text-white leading-tight truncate max-w-[130px] sm:max-w-[200px]">
                  {userHeaderProfile?.full_name || userHeaderProfile?.username || 'CHIP USER'}
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Action Icons - Super Admin, Live Card, Review, Notification Bell, Theme Switcher, Sign Out */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Super Admin button for admins */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#76BB08]/40 bg-[#76BB08]/15 text-[#76BB08] dark:text-[#76BB08] hover:bg-[#76BB08]/25 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                title="Super Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>
            )}

            {/* Live Card Link */}
            {userHeaderProfile?.username && (
              <button
                onClick={() => onNavigate(`profile-${userHeaderProfile.username}` as ViewState)}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition-all cursor-pointer shadow-xs"
                title="Preview Public Link-in-Bio"
              >
                <span>Live Card</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}

            {/* Drop A Review button */}
            <a
              href="https://g.page/r/CZGM0zQdEiY7EAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs transition-all cursor-pointer shadow-2xs"
              title="Drop a Google Review for CHIP NG"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Drop A Review</span>
            </a>

            {/* Notification Bell (Exact match to circular notification bell in IMG_3124.jpeg) */}
            {topRightContent}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-full border border-neutral-200/80 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer bg-white dark:bg-white/5 shadow-xs"
              title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full border border-neutral-200/80 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors cursor-pointer bg-white dark:bg-white/5 shadow-xs"
              title="Sign out of CHIP NG"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
