import { useState } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import AdminOverviewView from './views/AdminOverviewView';
import AdminBioView from './views/AdminBioView';
import PublicProfileView from './views/PublicProfileView';

export type ViewState = 'landing' | 'login' | 'admin-overview' | 'admin-bio' | 'public-profile';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased selection:bg-black selection:text-white">
      {currentView === 'landing' && <LandingView onNavigate={setCurrentView} />}
      {currentView === 'login' && <LoginView onNavigate={setCurrentView} />}
      {currentView === 'admin-overview' && <AdminOverviewView onNavigate={setCurrentView} />}
      {currentView === 'admin-bio' && <AdminBioView onNavigate={setCurrentView} />}
      {currentView === 'public-profile' && <PublicProfileView onNavigate={setCurrentView} />}
    </div>
  );
}
