import { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import UserDashboard from './views/UserDashboard';
import PublicProfileView from './views/PublicProfileView';
import AdminDashboard from './views/AdminDashboard';
import EnterpriseDashboard from './views/EnterpriseDashboard';
import BlogDirectoryView from './views/BlogDirectoryView';
import BlogArticleView from './views/BlogArticleView';
import NfcSalesView from './views/NfcSalesView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsOfServiceView from './views/TermsOfServiceView';
import ShippingPolicyView from './views/ShippingPolicyView';
import RefundPolicyView from './views/RefundPolicyView';
import CommercialLandingView from './views/CommercialLandingView';
import { MakroCompanyView } from './views/MakroCompanyView';
import { MakroUpdatesView } from './views/MakroUpdatesView';
import { MakroContactView } from './views/MakroContactView';
import { COMMERCIAL_PAGES } from './data/commercialPagesData';
import { supabase } from './supabaseClient';

export type ViewState = 
  | 'landing' 
  | 'company' 
  | 'updates' 
  | 'contact' 
  | 'login' 
  | 'user-dashboard' 
  | 'public-profile' 
  | 'admin-dashboard' 
  | 'enterprise-dashboard' 
  | 'blog-directory' 
  | 'blog-article' 
  | 'nfc-sales' 
  | 'privacy-policy' 
  | 'terms-of-service'
  | 'shipping'
  | 'refund-policy'
  | 'commercial-landing';

const RESERVED_CORE_ROUTES = new Set([
  '',
  '/',
  'admin',
  'enterprise',
  'login',
  'dashboard',
  'blog',
  'company',
  'about',
  'updates',
  'contact',
  'buy-card',
  'shop',
  'privacy',
  'privacy-policy',
  'terms',
  'terms-of-service',
  'refund-policy',
  'shipping',
  'api'
]);

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [commercialSlug, setCommercialSlug] = useState<string | null>(() => {
    const rawPath = window.location.pathname.replace(/^\/|\/$/g, "");
    if (COMMERCIAL_PAGES[rawPath]) {
      return rawPath;
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const path = window.location.pathname.replace(/\/$/, ""); // remove trailing slash
    const cleanSegment = path.replace(/^\//, '');

    if (COMMERCIAL_PAGES[cleanSegment]) {
      return 'commercial-landing';
    }
    if (path === '/admin') return 'admin-dashboard';
    if (path === '/enterprise') return 'enterprise-dashboard';
    if (path === '/login') return 'login';
    if (path === '/dashboard') return 'user-dashboard';
    if (path === '/blog') return 'blog-directory';
    if (path === '/company' || path === '/about') return 'company';
    if (path === '/updates') return 'updates';
    if (path === '/contact') return 'contact';
    if (path === '/buy-card' || path === '/shop') return 'nfc-sales';
    if (path === '/privacy-policy' || path === '/privacy') return 'privacy-policy';
    if (path === '/terms-of-service' || path === '/terms') return 'terms-of-service';
    if (path === '/shipping') return 'shipping';
    if (path === '/refund-policy') return 'refund-policy';
    if (path.startsWith('/blog/')) return 'blog-article';
    
    if (path !== '' && path !== '/' && !RESERVED_CORE_ROUTES.has(cleanSegment)) {
      return 'public-profile';
    }
    return 'landing';
  });

  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [publicUsername, setPublicUsername] = useState<string | null>(() => {
    const path = window.location.pathname.replace(/\/$/, "");
    const cleanSegment = path.replace(/^\//, '');

    if (
      path !== '' && 
      path !== '/' && 
      !RESERVED_CORE_ROUTES.has(cleanSegment) && 
      !COMMERCIAL_PAGES[cleanSegment] && 
      !path.startsWith('/blog/')
    ) {
      try {
        let username = decodeURIComponent(cleanSegment).trim();
        if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
        if (username.startsWith('@')) username = username.slice(1);
        return username;
      } catch (e) {
        let username = cleanSegment.trim();
        if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
        if (username.startsWith('@')) username = username.slice(1);
        return username;
      }
    }
    return null;
  });

  const [autoDownloadVCard, setAutoDownloadVCard] = useState<boolean>(() => {
    return window.location.pathname.endsWith('/vcard') || window.location.pathname.endsWith('/vcard/');
  });
  
  const [blogSlug, setBlogSlug] = useState<string | null>(() => {
    const path = window.location.pathname.replace(/\/$/, "");
    if (path.startsWith('/blog/')) {
      return path.replace('/blog/', '');
    }
    return null;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
      // Wait to redirect if going to user-dashboard
      setCurrentView(prev => {
        const isProtected = prev === 'user-dashboard' || prev === 'admin-dashboard' || prev === 'enterprise-dashboard';
        if (!session && isProtected) {
          window.history.replaceState({}, '', '/login');
          return 'login';
        } else if (session && prev === 'login') {
          window.history.replaceState({}, '', '/dashboard');
          return 'user-dashboard';
        }
        return prev;
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Use functional state update to avoid dependency on currentView
      setCurrentView((prevView) => {
        const isProtected = prevView === 'user-dashboard' || prevView === 'admin-dashboard' || prevView === 'enterprise-dashboard';
        if (!session && isProtected) {
          window.history.replaceState({}, '', '/login');
          return 'login';
        } else if (session && prevView === 'login') {
          window.history.replaceState({}, '', '/dashboard');
          return 'user-dashboard';
        }
        return prevView;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading && !publicUsername && !commercialSlug) {
    return <div className="min-h-screen bg-[#f9f9f9] dark:bg-black text-[#1a1c1c] font-sans flex items-center justify-center font-bold text-xs uppercase tracking-wider text-neutral-400">Loading CHIP NG...</div>;
  }

  // Set the browser URL back to root when navigating away from a public profile to a core app view.
  const handleNavigate = (view: ViewState, slug?: string) => {
    if (view !== 'public-profile' && publicUsername) {
      window.history.pushState({}, '', '/');
      setPublicUsername(null);
    }
    if (view !== 'blog-article' && blogSlug) {
      setBlogSlug(null);
    }
    if (view !== 'commercial-landing' && commercialSlug) {
      setCommercialSlug(null);
    }

    if (view === 'landing') {
      window.history.pushState({}, '', '/');
    } else if (view === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (view === 'user-dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'admin-dashboard') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'enterprise-dashboard') {
      window.history.pushState({}, '', '/enterprise');
    } else if (view === 'nfc-sales') {
      window.history.pushState({}, '', '/buy-card');
    } else if (view === 'privacy-policy') {
      window.history.pushState({}, '', '/privacy-policy');
    } else if (view === 'terms-of-service') {
      window.history.pushState({}, '', '/terms-of-service');
    } else if (view === 'shipping') {
      window.history.pushState({}, '', '/shipping');
    } else if (view === 'refund-policy') {
      window.history.pushState({}, '', '/refund-policy');
    } else if (view === 'blog-directory') {
      window.history.pushState({}, '', '/blog');
    } else if (view === 'company') {
      window.history.pushState({}, '', '/company');
    } else if (view === 'updates') {
      window.history.pushState({}, '', '/updates');
    } else if (view === 'contact') {
      window.history.pushState({}, '', '/contact');
    } else if (view === 'commercial-landing' && slug) {
      window.history.pushState({}, '', `/${slug}`);
      setCommercialSlug(slug);
    }

    setCurrentView(view);
  };

  const handleNavigateToArticle = (slug: string) => {
    window.history.pushState({}, '', `/blog/${slug}`);
    setBlogSlug(slug);
    setCurrentView('blog-article');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white font-sans antialiased selection:bg-[#D2F843] selection:text-neutral-950">
      {currentView === 'landing' && <LandingView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
      {currentView === 'company' && <MakroCompanyView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
      {currentView === 'updates' && <MakroUpdatesView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
      {currentView === 'contact' && <MakroContactView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
      {currentView === 'login' && <LoginView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'user-dashboard' && <UserDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'public-profile' && <PublicProfileView onNavigate={handleNavigate} username={publicUsername} autoDownloadVCard={autoDownloadVCard} />}
      {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'enterprise-dashboard' && <EnterpriseDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'blog-directory' && <BlogDirectoryView onNavigate={handleNavigate} onNavigateToArticle={handleNavigateToArticle} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'nfc-sales' && <NfcSalesView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
      {currentView === 'blog-article' && <BlogArticleView onNavigate={handleNavigate} slug={blogSlug!} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'privacy-policy' && <PrivacyPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} />}
      {currentView === 'terms-of-service' && <TermsOfServiceView onNavigate={handleNavigate} isDarkMode={isDarkMode} />}
      {currentView === 'shipping' && <ShippingPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'refund-policy' && <RefundPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'commercial-landing' && commercialSlug && (
        <CommercialLandingView 
          slug={commercialSlug} 
          onNavigate={handleNavigate} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          session={session} 
        />
      )}
    </div>
  );
}
