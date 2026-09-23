import React from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, 
  Users, 
  LogOut,
  Moon,
  Sun,
  ExternalLink,
  Home
} from 'lucide-react';

interface AdminLayoutProps {
  topRightContent?: React.ReactNode;
  hideMobileNav?: boolean;
  children: React.ReactNode;
  onNavigate: (view: ViewState) => void;
  activePath: 'dashboard' | 'bio' | 'enterprise';
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AdminLayout({
  children,
  onNavigate,
  activePath,
  isDarkMode,
  toggleDarkMode,
  hideMobileNav,
  topRightContent,
}: AdminLayoutProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#D2F843] selection:text-neutral-950 font-sans transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#0E1017] z-20">
        <div className="p-6 pb-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-8 h-6 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center gap-1 px-1.5 group-hover:scale-105 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-950"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span>
            </div>
            <div>
              <h1 className="font-bold text-neutral-950 dark:text-white text-base tracking-tight leading-tight">
                CHIPNG
              </h1>
              <p className="text-[10px] text-[#84A900] dark:text-[#D2F843] font-mono uppercase tracking-widest font-semibold">
                Control Hub
              </p>
            </div>
          </button>
        </div>

        <div className="px-4 py-2">
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => onNavigate('user-dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
                activePath === 'dashboard'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Personal Console</span>
            </button>

            <button
              onClick={() => onNavigate('enterprise-dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
                activePath === 'enterprise'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Enterprise Fleet</span>
            </button>

            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all font-semibold text-xs cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Main Website</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col gap-1.5">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all font-semibold text-xs cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            <span>{isDarkMode ? 'Light Surface' : 'Obsidian Surface'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-semibold text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-[64px] shrink-0 bg-white/90 dark:bg-[#0E1017]/90 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between px-5 z-30 sticky top-0">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-7 h-5 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center gap-1 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-950"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span>
            </div>
            <span className="font-bold text-neutral-950 dark:text-white text-sm tracking-tight">
              CHIPNG
            </span>
          </button>

          <div className="flex items-center gap-2">
            {topRightContent}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Children */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
