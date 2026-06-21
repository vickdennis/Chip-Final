import { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import UserDashboard from './views/UserDashboard';
import PublicProfileView from './views/PublicProfileView';
import AdminDashboard from './views/AdminDashboard';
import { supabase } from './supabaseClient';

export type ViewState = 'landing' | 'login' | 'user-dashboard' | 'public-profile' | 'admin-dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const path = window.location.pathname.replace(/\/$/, ""); // remove trailing slash
    if (path === '/admin') return 'admin-dashboard';
    if (path !== '' && path !== '/' && path !== '/login' && path !== '/dashboard' && path !== '/public-profile' && path !== '/admin') {
      return 'public-profile';
    }
    return 'landing';
  });
  const [sessionLoading, setSessionLoading] = useState(true);
  const [publicUsername, setPublicUsername] = useState<string | null>(() => {
    const path = window.location.pathname.replace(/\/$/, "");
    if (path !== '' && path !== '/' && path !== '/login' && path !== '/dashboard' && path !== '/public-profile' && path !== '/admin') {
      try {
        return decodeURIComponent(path.slice(1));
      } catch (e) {
        return path.slice(1);
      }
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
        const isProtected = prevView === 'user-dashboard' || prevView === 'admin-dashboard';
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
    return <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex items-center justify-center">Loading...</div>;
  }

  // Set the browser URL back to root when navigating away from a public profile to a core app view.
  const handleNavigate = (view: ViewState) => {
    if (view !== 'public-profile' && publicUsername) {
      window.history.pushState({}, '', '/');
      setPublicUsername(null);
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased selection:bg-black selection:text-white">
      {currentView === 'landing' && <LandingView onNavigate={handleNavigate} />}
      {currentView === 'login' && <LoginView onNavigate={handleNavigate} />}
      {currentView === 'user-dashboard' && <UserDashboard onNavigate={handleNavigate} />}
      {currentView === 'public-profile' && <PublicProfileView onNavigate={handleNavigate} username={publicUsername} />}
      {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
    </div>
  );
}
