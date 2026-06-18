import React, { useState } from 'react';
import { ViewState } from '../App';
import { MemoryStick } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function LoginView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        window.location.href = "/";
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white relative">
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 py-12 md:py-0 relative z-10 bg-white">
        <div className="max-w-md w-full mx-auto">
          
          <div className="mb-10 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center">
              <MemoryStick className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-[24px] font-black tracking-tighter text-black">CHIP NG</span>
          </div>

          <div className="mb-10">
            <h1 className="font-display text-[36px] md:text-[42px] leading-[1.1] font-bold text-black mb-3">
              Claim Your Corner of the Grid.
            </h1>
            <p className="text-[16px] text-[#4c4546]">Join the network of elite creators and professionals.</p>
          </div>

          <div className="flex border-b border-[#e2e2e2] mb-8 relative">
            <button 
              className={`flex-1 pb-3 font-mono text-[14px] font-medium transition-colors text-left border-b-2 ${mode === 'login' ? 'text-black border-black' : 'text-[#4c4546] border-transparent hover:text-black'}`}
              onClick={() => { setMode('login'); setErrorMsg(''); }}
            >
              Login
            </button>
            <button 
              className={`flex-1 pb-3 font-mono text-[14px] font-medium transition-colors text-left border-b-2 ${mode === 'signup' ? 'text-black border-black' : 'text-[#4c4546] border-transparent hover:text-black'}`}
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
            >
              Create Account
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            {mode === 'signup' && (
              <div>
                <label className="block font-mono text-[13px] font-medium text-black mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Doe" 
                  className="w-full bg-white border border-[#cfc4c5] rounded-sm px-4 py-3 text-[14px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow"
                />
              </div>
            )}
            <div>
              <label className="block font-mono text-[13px] font-medium text-black mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="jane@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-[#cfc4c5] rounded-sm px-4 py-3 text-[14px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] font-medium text-black mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-[#cfc4c5] rounded-sm px-4 py-3 text-[14px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow"
              />
            </div>

            {errorMsg && (
              <p className="text-[13px] text-[#ba1a1a] font-medium mt-2">
                {errorMsg}
              </p>
            )}
            
            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-mono text-[14px] font-medium rounded-sm px-4 py-3.5 hover:opacity-90 active:translate-y-px transition-all disabled:opacity-70"
              >
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
              </button>
            </div>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-[#e2e2e2]"></div>
            <span className="mx-4 font-mono text-[12px] text-[#7e7576] uppercase tracking-widest font-medium">Or</span>
            <div className="flex-grow border-t border-[#e2e2e2]"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white border border-[#cfc4c5] text-black font-mono text-[14px] font-medium rounded-sm px-4 py-3 hover:bg-[#f3f3f4] active:bg-[#e8e8e8] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          <p className="mt-16 font-mono text-[12px] text-[#4c4546] text-center opacity-80">
            © 2026 CHIP NG. Precision Engineering for Humans.
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 lg:w-7/12 relative bg-[#1a1c1c] border-l border-[#2f3131] overflow-hidden">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC52T0geZ0Ka4tVnuMlQVaDk94TsuhmS9s5LPNk_t3NFtwh5SQ1z6vetB4un-QHWlf-X02uCzryP2f5_rFxv1TxLvRqKDs3F-iphwPcNAhfUAoQdpATyUGHESqSGxgT4zutPRMXGw8LB2JVXi4LJ6x-COGYFieW47GaBBBssXHXi0od0bEG5S9gyw8LqB3y5fJ49Vk19EHD6bWYuqHts83Qax1L4Q_pZCq7r8xtuXaYOHIzLwlaM2fuM3b7jQhfkm0EF12GbYBEgyc" 
          alt="Abstract Architecture Grid" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-luminosity grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent"></div>
      </div>
    </div>
  );
}
