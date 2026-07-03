import { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import UserDashboard from './views/UserDashboard';
import PublicProfileView from './views/PublicProfileView';
import AdminDashboard from './views/AdminDashboard';
import EnterpriseDashboard from './views/EnterpriseDashboard';
import BlogDirectoryView from './views/BlogDirectoryView';
import BlogArticleView from './views/BlogArticleView';
import { supabase } from './supabaseClient';

export type ViewState = 'landing' | 'login' | 'user-dashboard' | 'public-profile' | 'admin-dashboard' | 'enterprise-dashboard' | 'blog-directory' | 'blog-article';

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

  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const path = window.location.pathname.replace(/\/$/, ""); // remove trailing slash
    if (path === '/admin') return 'admin-dashboard';
    if (path === '/enterprise') return 'enterprise-dashboard';
    if (path === '/login') return 'login';
    if (path === '/dashboard') return 'user-dashboard';
    if (path === '/blog') return 'blog-directory';
    if (path.startsWith('/blog/')) return 'blog-article';
    if (path !== '' && path !== '/') {
      return 'public-profile';
    }
    return 'landing';
  });
  const [sessionLoading, setSessionLoading] = useState(true);
  const [publicUsername, setPublicUsername] = useState<string | null>(() => {
    const path = window.location.pathname.replace(/\/$/, "");
    if (path !== '' && path !== '/' && path !== '/login' && path !== '/dashboard' && path !== '/admin' && path !== '/enterprise' && path !== '/blog' && !path.startsWith('/blog/')) {
      try {
        return decodeURIComponent(path.slice(1));
      } catch (e) {
        return path.slice(1);
      }
    }
    return null;
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
      setSessionLoading(false);
      // Wait to redirect if going to user-dashboard
      setCurrentView(prev => {
        const isProtected = prev === 'user-dashboard' || prev === 'admin-dashboard';
        if (!session && isProtected) {
          return 'login';
        }
        return prev;
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Use functional state update to avoid dependency on currentView
      setCurrentView((prevView) => {
        const isProtected = prevView === 'user-dashboard' || prevView === 'admin-dashboard' || prevView === 'enterprise-dashboard';
        if (!session && isProtected) {
          return 'login';
        } else if (session && (prevView === 'login' || prevView === 'landing')) {
          return 'user-dashboard';
        }
        return prevView;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading && !publicUsername) {
    return <div className="min-h-screen bg-[#f9f9f9] dark:bg-black text-[#1a1c1c] font-sans flex items-center justify-center">Loading...</div>;
  }

  // Set the browser URL back to root when navigating away from a public profile to a core app view.
  const handleNavigate = (view: ViewState) => {
    if (view !== 'public-profile' && publicUsername) {
      window.history.pushState({}, '', '/');
      setPublicUsername(null);
    }
    if (view !== 'blog-article' && blogSlug) {
      setBlogSlug(null);
    }
    setCurrentView(view);
  };

  const handleNavigateToArticle = (slug: string) => {
    window.history.pushState({}, '', `/blog/${slug}`);
    setBlogSlug(slug);
    setCurrentView('blog-article');
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-black text-[#1a1c1c] font-sans antialiased selection:bg-black selection:text-white">
      {currentView === 'landing' && <LandingView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'login' && <LoginView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'user-dashboard' && <UserDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'public-profile' && <PublicProfileView onNavigate={handleNavigate} username={publicUsername} />}
      {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'enterprise-dashboard' && <EnterpriseDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'blog-directory' && <BlogDirectoryView onNavigate={handleNavigate} onNavigateToArticle={handleNavigateToArticle} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'blog-article' && <BlogArticleView onNavigate={handleNavigate} slug={blogSlug!} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
    </div>
  );
}
