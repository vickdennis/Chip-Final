import React, { useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { 
  MemoryStick, 
  LayoutDashboard, 
  Users, 
  LogOut,
  Moon,
  Sun
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

export default function AdminLayout({ children, onNavigate, activePath, isDarkMode, toggleDarkMode, hideMobileNav, topRightContent }: AdminLayoutProps) {
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  return (
    <div className="flex h-screen bg-[#f4f4f5] dark:bg-[#000000] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a] z-20">
        <div className="p-8 pb-6 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-black dark:bg-white shadow-md">
            <MemoryStick className="w-5 h-5 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="font-bold text-black dark:text-white text-lg tracking-tight leading-tight">CHIP NG</h1>
            <p className="text-[11px] text-black/50 dark:text-white/50 font-medium uppercase tracking-widest">Admin</p>
          </div>
        </div>

        <div className="px-4 py-2">
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => onNavigate('user-dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-[15px] ${activePath === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('enterprise-dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-[15px] ${activePath === 'enterprise' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <Users className="w-5 h-5" />
              Enterprise
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-1">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-medium text-[15px]"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-medium text-[15px]"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden h-[72px] shrink-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-black dark:bg-white shadow-sm">
              <MemoryStick className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="font-bold text-black dark:text-white tracking-tight">CHIP NG</span>
          </div>
          <div className="flex items-center gap-2">
            {topRightContent}
            <button onClick={toggleDarkMode} className="p-2 -mr-2 rounded-full text-black/60 dark:text-white/60 active:bg-black/5 dark:active:bg-white/5">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative z-10 pb-[100px] md:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {!hideMobileNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#121212] border-t border-black/5 dark:border-white/5 pb-4 md:pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        <div className="flex items-center justify-around h-[84px] px-2 relative">
          <button 
            onClick={() => onNavigate('user-dashboard')}
            className={`relative flex flex-col items-center justify-center w-[72px] h-[72px] gap-1.5 transition-all ${activePath === 'dashboard' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
          >
            {activePath === 'dashboard' && (
              <div className="absolute -top-3 w-16 h-16 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
            )}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activePath === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
              <LayoutDashboard className={`w-6 h-6 ${activePath === 'dashboard' ? '' : ''}`} />
            </div>
            <span className={`text-[11px] font-semibold tracking-wide transition-all ${activePath === 'dashboard' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Home</span>
          </button>
          
          <button 
            onClick={() => onNavigate('enterprise-dashboard')}
            className={`relative flex flex-col items-center justify-center w-[72px] h-[72px] gap-1.5 transition-all ${activePath === 'enterprise' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
          >
            {activePath === 'enterprise' && (
              <div className="absolute -top-3 w-16 h-16 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
            )}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activePath === 'enterprise' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
              <Users className={`w-6 h-6 ${activePath === 'enterprise' ? '' : ''}`} />
            </div>
            <span className={`text-[11px] font-semibold tracking-wide transition-all ${activePath === 'enterprise' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Enterprise</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-[72px] h-[72px] gap-1.5 text-black/40 dark:text-white/40 transition-all"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </nav>
      )}

    </div>
  );
}
