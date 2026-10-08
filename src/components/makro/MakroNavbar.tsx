import React, { useState } from 'react';
import { ArrowRight, Moon, Sun, Menu, X } from 'lucide-react';
import { ViewState } from '../../App';
import BrandLogo from '../BrandLogo';

interface MakroNavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export const MakroNavbar: React.FC<MakroNavbarProps> = ({
  currentView,
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; view: ViewState }[] = [
    { label: 'Home', view: 'landing' },
    { label: 'Shop Cards', view: 'nfc-sales' },
    { label: 'Company', view: 'company' as ViewState },
    { label: 'Blog', view: 'blog-directory' },
    { label: 'Updates', view: 'updates' as ViewState },
    { label: 'Contact', view: 'contact' as ViewState },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAFAFA]/85 dark:bg-[#0A0B0E]/85 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Zone 1: Single Brand Element with 3D CHIPNG Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-xl transition-transform"
          aria-label="CHIPNG Home"
        >
          <BrandLogo size="md" />
        </button>

        {/* Zone 2: Clean 4-6 nav links, 1-2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-neutral-600 dark:text-neutral-300">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.view)}
                className={`relative py-1 transition-colors hover:text-neutral-950 dark:hover:text-white cursor-pointer ${
                  isActive ? 'text-neutral-950 dark:text-white font-semibold' : ''
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-950 dark:bg-white rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          {/* User state or Get Started */}
          {session ? (
            <button
              onClick={() => onNavigate('user-dashboard')}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-neutral-950 dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="group flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-200" />
              </div>
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                Get started
              </span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-[#0A0B0E] px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-base font-medium py-2 px-3 rounded-lg ${
                  currentView === item.view
                    ? 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold text-sm"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
