import { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import UserDashboard from './views/UserDashboard';
import PublicProfileView from './views/PublicProfileView';
import { supabase } from './supabaseClient';

export type ViewState = 'landing' | 'login' | 'user-dashboard' | 'public-profile';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionLoading(false);
      const isProtected = currentView === 'user-dashboard';
      if (!session && isProtected) {
        setCurrentView('login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isProtected = currentView === 'user-dashboard';
      if (!session && isProtected) {
        setCurrentView('login');
      } else if (session && (currentView === 'login' || currentView === 'landing')) {
        setCurrentView('user-dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  if (sessionLoading) {
    return <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased selection:bg-black selection:text-white">
      {currentView === 'landing' && <LandingView onNavigate={setCurrentView} />}
      {currentView === 'login' && <LoginView onNavigate={setCurrentView} />}
      {currentView === 'user-dashboard' && <UserDashboard onNavigate={setCurrentView} />}
      {currentView === 'public-profile' && <PublicProfileView onNavigate={setCurrentView} />}
    </div>
  );
}
