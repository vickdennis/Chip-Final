const fs = require('fs');
const content = `import React, { useState } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { MemoryStick, ChevronRight, Check } from 'lucide-react';

interface LoginViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LoginView({ onNavigate, isDarkMode, toggleDarkMode }: LoginViewProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setSuccessMsg('Account created successfully! Please check your email to verify.');
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onNavigate('user-dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center p-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Absolute Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-md">
            <MemoryStick className="w-4 h-4 text-white dark:text-black" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-black dark:text-white">CHIP NG</span>
        </div>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          {isDarkMode ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      {/* Main Card Container */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#121212] rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 relative z-10">
        
        <div className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold text-black dark:text-white tracking-tight leading-tight mb-2">
            {mode === 'login' ? 'Welcome back.' : 'Create an account.'}
          </h1>
          <p className="text-black/50 dark:text-white/50 text-[15px]">
            {mode === 'login' ? 'Enter your details to access your dashboard.' : 'Start building your professional identity today.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-black/5 dark:bg-white/5 p-1 rounded-2xl flex mb-8">
          <button 
            className={\`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all \${mode === 'login' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button 
            className={\`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all \${mode === 'signup' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign Up
          </button>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white font-medium text-[15px] rounded-2xl px-4 py-4 hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-70 mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-black/5 dark:border-white/5"></div>
          <span className="mx-4 text-[13px] text-black/40 dark:text-white/40 font-medium">or continue with email</span>
          <div className="flex-grow border-t border-black/5 dark:border-white/5"></div>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-black/70 dark:text-white/70 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Jane Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-black/5 dark:bg-white/5 border-transparent rounded-2xl px-5 py-4 text-[15px] text-black dark:text-white focus:bg-white dark:focus:bg-[#1a1a1a] focus:border-black/20 dark:focus:border-white/20 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all placeholder-black/30 dark:placeholder-white/30"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-black/70 dark:text-white/70 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/5 dark:bg-white/5 border-transparent rounded-2xl px-5 py-4 text-[15px] text-black dark:text-white focus:bg-white dark:focus:bg-[#1a1a1a] focus:border-black/20 dark:focus:border-white/20 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all placeholder-black/30 dark:placeholder-white/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-black/70 dark:text-white/70 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/5 dark:bg-white/5 border-transparent rounded-2xl px-5 py-4 text-[15px] text-black dark:text-white focus:bg-white dark:focus:bg-[#1a1a1a] focus:border-black/20 dark:focus:border-white/20 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all placeholder-black/30 dark:placeholder-white/30"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-[14px] font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-2xl text-[14px] font-medium flex items-center gap-2">
              <Check className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold text-[16px] rounded-2xl px-4 py-4 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-black/10 dark:shadow-white/10"
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/views/LoginView.tsx', content);
console.log('Patched LoginView');
