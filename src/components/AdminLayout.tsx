import React, { useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import BrandLogo from './BrandLogo';
import { 
  LogOut,
  Moon,
  Sun,
  ExternalLink,
  Shield,
  Star,
  Menu,
  X,
  Home,
  ShoppingBag,
  Briefcase,
  FileText,
  Building2,
  Sparkles,
  Users
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
  activePath,
  isDarkMode,
  toggleDarkMode,
  hideMobileNav,
  topRightContent,
  isAdmin,
  userHeaderProfile,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  const navItems = [
    { label: 'Home', view: 'landing' as ViewState, icon: Home },
    { label: 'Shop Cards', view: 'landing' as ViewState, isShop: true, icon: ShoppingBag },
    { label: 'Portfolio', view: 'portfolio' as ViewState, icon: Briefcase },
    { label: 'Blog', view: 'blog-directory' as ViewState, icon: FileText },
    { label: 'Updates', view: 'updates' as ViewState, icon: Sparkles },
    { label: 'Company', view: 'company' as ViewState, icon: Building2 },
  ];

  const handleNavClick = (item: { label: string; view: ViewState; isShop?: boolean }) => {
    if (item.isShop) {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById('shop');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return;
    }
    onNavigate(item.view);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#D2F843] selection:text-neutral-950 font-sans transition-colors flex flex-col">
      {/* Top Navbar - Exactly matching MakroNavbar UI/UX across CHIP NG */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAFAFA]/85 dark:bg-[#0A0B0E]/85 border-b border-neutral-200/80 dark:border-white/10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Zone 1: User Avatar + Welcome back + Name (Exact match to IMG_3124.jpeg) with Brand on Desktop */}
          <div className="flex items-center gap-3">
            {/* Desktop Brand Logo */}
            <button
              onClick={() => onNavigate('landing')}
              className="hidden lg:flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-xl transition-transform cursor-pointer"
              aria-label="CHIPNG Home"
            >
              <BrandLogo size="md" />
            </button>

            {/* Desktop Divider */}
            <div className="hidden lg:block h-6 w-px bg-neutral-200 dark:border-white/10" />

            {/* Exact IMG_3124.jpeg Mobile & Desktop User Greeting */}
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
                <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-neutral-900 dark:text-white leading-tight truncate max-w-[130px] sm:max-w-[180px]">
                  {userHeaderProfile?.full_name || userHeaderProfile?.username || 'CHIP USER'}
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Exact MakroNavbar styling) */}
          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-neutral-600 dark:text-neutral-300">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="relative py-1 transition-colors hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                {item.label}
              </button>
            ))}

            {userHeaderProfile?.username && (
              <button
                onClick={() => onNavigate(`profile-${userHeaderProfile.username}` as ViewState)}
                className="inline-flex items-center gap-1.5 text-neutral-900 dark:text-white font-semibold hover:text-[#6c8600] dark:hover:text-[#D2F843] transition-colors cursor-pointer"
                title="Preview Public Link-in-Bio"
              >
                <span>Live Card</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}
          </nav>

          {/* Zone 3: Actions - Review, Notifications, Admin, Theme Toggle, Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Super Admin button for admins */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D2F843]/40 bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] hover:bg-[#D2F843]/25 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                title="Super Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Super Admin</span>
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

            {/* Notification Bell */}
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

            {/* User Avatar + Sign Out */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full border border-neutral-200/80 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors cursor-pointer bg-white dark:bg-white/5 shadow-xs"
              title="Sign out of CHIP NG"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-[#0A0B0E] px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2">
            {/* User Greeting Card */}
            {userHeaderProfile && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                  {userHeaderProfile.avatar_url || userHeaderProfile.cover_image_url ? (
                    <img
                      src={userHeaderProfile.avatar_url || userHeaderProfile.cover_image_url}
                      alt={userHeaderProfile.full_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                      {(userHeaderProfile.full_name || userHeaderProfile.username || 'U').charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {userHeaderProfile.full_name || userHeaderProfile.username || 'CHIP NG User'}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    chipng.com/{userHeaderProfile.username || 'user'}
                  </p>
                </div>
              </div>
            )}

            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      handleNavClick(item);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-left text-sm font-semibold py-2.5 px-3.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-neutral-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {userHeaderProfile?.username && (
                <button
                  onClick={() => {
                    onNavigate(`profile-${userHeaderProfile.username}` as ViewState);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between py-2.5 px-3.5 rounded-xl text-neutral-900 dark:text-white font-semibold hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-sm"
                >
                  <span className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-[#6c8600] dark:text-[#D2F843]" />
                    <span>View Public Card</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">Preview</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] font-bold text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Super Admin Control Center</span>
                </button>
              )}
            </nav>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
              <a
                href="https://g.page/r/CZGM0zQdEiY7EAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold text-xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Drop A Review</span>
              </a>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - Full width with clean responsive padding */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
