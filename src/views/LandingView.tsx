import React from 'react';
import { ViewState } from '../App';
import { BookOpen, ArrowRight, Microchip, ShieldAlert, Activity, BarChart3, Star, Phone, MessageCircle } from 'lucide-react';

export default function LandingView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <nav className="flex justify-between items-center px-8 py-4 w-full sticky top-0 z-50 bg-[#f9f9f9]/80 backdrop-blur-md border-b border-[#e2e2e2]">
        <div className="flex items-center gap-6">
          <span className="font-display text-[24px] font-black tracking-tighter text-black">ChipNG</span>
          <div className="hidden md:flex gap-6 ml-8">
            <a href="#" className="font-mono text-[14px] text-[#4c4546] hover:text-black transition-colors font-medium">Features</a>
            <a href="#" className="font-mono text-[14px] text-[#4c4546] hover:text-black transition-colors font-medium">Use Cases</a>
            <a href="#" className="font-mono text-[14px] text-[#4c4546] hover:text-black transition-colors font-medium">Pricing</a>
            <a href="#" className="font-mono text-[14px] text-[#4c4546] hover:text-black transition-colors font-medium">Blog</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('login')}
            className="font-mono text-[14px] font-medium text-black hover:opacity-80 transition-opacity hidden md:block px-4 py-2"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="bg-black text-white font-mono text-[14px] font-medium px-6 py-2.5 rounded-sm hover:bg-black/90 active:translate-y-px transition-all"
          >
            Claim Your Link
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-20 px-8">
        <section className="max-w-4xl w-full mx-auto text-center flex flex-col items-center gap-10">
          <div className="w-48 h-48 mb-4 border border-[#e2e2e2] bg-white p-4 rounded-sm shadow-sm overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfMfGw30AK_ubznqFEGAgwiCyiaRj9m4reZICGiUR5WxHaUy8SzdPiuG5buvBu5WeAA9DB0111CklZcTTlQ2ffzcoYwgviMD3gHxBZOKmlT7sVtHT15n3eEE9D6dZdIY2jZVRXWH6thF_rcsUZISiNG0A3D8d4OafozFaTHHwjQDXmtaSWZFHDoh8H0bhPXXn4PYQI7APYWU_vvzbtvxvU0iUv2zWnGvTvI73n1MlLXKIU7YIc5G1LUb6JHI0mPPjJOCIhne8BNGU" 
              alt="CHIP NG Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="font-display text-[42px] md:text-[56px] leading-[1.1] font-extrabold text-black max-w-3xl tracking-tight">
            One Link to Power Your Digital Presence
          </h1>
          
          <p className="text-[18px] md:text-[20px] text-[#4c4546] max-w-2xl leading-relaxed">
            ChipNG is the definitive link-in-bio platform for African creators, professionals, and businesses. Consolidate your portfolio, book appointments, and share your world with one smart link.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              onClick={() => onNavigate('login')}
              className="bg-black text-white font-mono text-[14px] font-medium px-8 py-3.5 rounded-sm border border-black hover:bg-black/90 active:translate-y-px transition-all min-w-[160px]"
            >
              Start for Free
            </button>
            <button className="bg-[#f9f9f9] text-black border border-[#e2e2e2] font-mono text-[14px] font-medium px-8 py-3.5 rounded-sm hover:bg-[#f3f3f4] active:translate-y-px transition-colors flex items-center justify-center gap-2 min-w-[160px]">
              See Examples
            </button>
          </div>
        </section>

        <section className="max-w-5xl w-full mx-auto mt-32 mb-16">
          <div className="text-center mb-16">
            <h2 className="font-display text-[32px] font-bold text-black mb-3">Designed for Growth</h2>
            <p className="text-[16px] text-[#4c4546]">Everything you need to showcase who you are and what you do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <Microchip className="w-8 h-8 text-black mb-4" />
                <h3 className="font-display text-[24px] font-bold text-black mb-2">Beautiful Profiles</h3>
                <p className="text-[16px] text-[#4c4546] max-w-sm leading-relaxed">Create a stunning landing page in minutes. Add all your critical links, embedded players, and past work to one single hub.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-black font-mono text-[14px] font-medium group cursor-pointer w-max">
                Customize yours today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col min-h-[300px]">
              <Activity className="w-8 h-8 text-black mb-4" />
              <h3 className="font-display text-[24px] font-bold text-black mb-2 mt-auto">Seamless Integration</h3>
              <p className="text-[16px] text-[#4c4546] leading-relaxed">Connect over 30+ social networks, messaging apps, and custom platforms instantly without coding.</p>
            </div>

            <div className="border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col min-h-[300px]">
              <ShieldAlert className="w-8 h-8 text-black mb-4" />
              <h3 className="font-display text-[24px] font-bold text-black mb-2 mt-auto">Instant Bookings</h3>
              <p className="text-[16px] text-[#4c4546] leading-relaxed">Let clients schedule meetings directly on your profile with Calendly and SavvyCal integration.</p>
            </div>

            <div className="md:col-span-2 border border-[#e2e2e2] bg-[#f3f3f4] p-8 rounded-sm flex flex-col justify-between min-h-[300px] overflow-hidden relative">
              <div className="relative z-10">
                <BarChart3 className="w-8 h-8 text-black mb-4" />
                <h3 className="font-display text-[24px] font-bold text-black mb-2">Smart Analytics</h3>
                <p className="text-[16px] text-[#4c4546] max-w-sm leading-relaxed">Understand your audience. Track clicks, profile views, and engagement metrics to optimize your online footprint.</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-32 border-t border-[#e2e2e2] flex items-end justify-between px-6 pb-6 opacity-40">
                <div className="w-6 bg-black h-8 rounded-t-sm"></div>
                <div className="w-6 bg-black h-16 rounded-t-sm"></div>
                <div className="w-6 bg-black h-12 rounded-t-sm"></div>
                <div className="w-6 bg-black h-24 rounded-t-sm"></div>
                <div className="w-6 bg-black h-10 rounded-t-sm"></div>
                <div className="w-6 bg-black h-20 rounded-t-sm"></div>
                <div className="w-6 bg-black h-14 rounded-t-sm"></div>
                <div className="w-6 bg-black h-[110%] rounded-t-sm"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing */}
        <section className="max-w-5xl w-full mx-auto mt-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-[32px] font-bold text-black mb-3">Simple, Transparent Pricing</h2>
            <p className="text-[16px] text-[#4c4546]">Start for free, upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col">
              <h3 className="font-mono text-[14px] font-bold text-[#4c4546] uppercase tracking-widest mb-4">Basic</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-display text-[48px] font-black text-black leading-none">Free</span>
              </div>
              <p className="text-[16px] text-[#4c4546] mb-8">Everything you need to launch your digital presence.</p>
              <ul className="flex flex-col gap-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-[15px] text-black">
                   <div className="w-5 h-5 rounded-full bg-[#f3f3f4] flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-black"></div></div>
                   Unlimited Links
                </li>
                <li className="flex items-center gap-3 text-[15px] text-black">
                   <div className="w-5 h-5 rounded-full bg-[#f3f3f4] flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-black"></div></div>
                   Custom chipng.com/username
                </li>
                <li className="flex items-center gap-3 text-[15px] text-black">
                   <div className="w-5 h-5 rounded-full bg-[#f3f3f4] flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-black"></div></div>
                   Basic Analytics
                </li>
              </ul>
              <button onClick={() => onNavigate('login')} className="w-full py-3 bg-[#f3f3f4] text-black font-mono text-[14px] font-bold rounded-sm hover:bg-[#e2e2e2] transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro Tier */}
            <div className="border-2 border-black bg-black text-white p-8 rounded-sm flex flex-col relative">
              <div className="absolute top-0 right-0 bg-[#FFB800] text-black font-mono text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-sm">Popular</div>
              <h3 className="font-mono text-[14px] font-bold text-white/70 uppercase tracking-widest mb-4">Pro</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-display text-[48px] font-black text-white leading-none">₦3000</span>
                <span className="text-[16px] text-white/70">/ month</span>
              </div>
              <p className="text-[16px] text-white/80 mb-8">Unlock verification, premium features, and shop integration.</p>
              <ul className="flex flex-col gap-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-[15px] text-white">
                   <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-[#FFB800]"></div></div>
                   Everything in Basic
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white">
                   <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-[#FFB800]"></div></div>
                   Verification Badge
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white">
                   <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-[#FFB800]"></div></div>
                   Sell Products in Shop
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white">
                   <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-[#FFB800]"></div></div>
                   Advanced Analytics
                </li>
              </ul>
              <button onClick={() => onNavigate('login')} className="w-full py-3 bg-[#FFB800] text-black font-mono text-[14px] font-bold rounded-sm hover:bg-[#e6a600] transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-5xl w-full mx-auto mt-24 mb-16">
          <div className="text-center mb-16">
            <h2 className="font-display text-[32px] font-bold text-black mb-3">Loved by professionals across Nigeria</h2>
            <p className="text-[16px] text-[#4c4546]">Join thousands using ChipNG to empower their digital business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col">
              <div className="flex gap-1 mb-4 text-[#FFB800]">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-[16px] text-black leading-relaxed mb-6 font-medium">
                "Since switching to ChipNG, my clients can easily find my latest articles and book strategy sessions. The setup took less than 5 minutes."
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f3f4] border border-[#e2e2e2] flex items-center justify-center font-bold text-[#4c4546]">
                  CA
                </div>
                <div>
                  <h4 className="font-mono text-[14px] font-bold text-black leading-tight">Chinedu Abiodun</h4>
                  <p className="text-[13px] text-[#4c4546]">Digital Strategy Consultant</p>
                </div>
              </div>
            </div>

            <div className="border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col">
              <div className="flex gap-1 mb-4 text-[#FFB800]">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-[16px] text-black leading-relaxed mb-6 font-medium">
                "Having all my design portfolios and social links in one professional hub has elevated how I pitch to international clients. Clean and flawless."
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f3f4] border border-[#e2e2e2] flex items-center justify-center font-bold text-[#4c4546]">
                  AB
                </div>
                <div>
                  <h4 className="font-mono text-[14px] font-bold text-black leading-tight">Aisha Bello</h4>
                  <p className="text-[13px] text-[#4c4546]">Freelance UI/UX Designer</p>
                </div>
              </div>
            </div>

            <div className="border border-[#e2e2e2] bg-white p-8 rounded-sm flex flex-col">
              <div className="flex gap-1 mb-4 text-[#FFB800]">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-[16px] text-black leading-relaxed mb-6 font-medium">
                "The unified profile acts as our team's digital business card. The integrated analytics help us figure out exactly what content resonates."
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f3f4] border border-[#e2e2e2] flex items-center justify-center font-bold text-[#4c4546]">
                  TO
                </div>
                <div>
                  <h4 className="font-mono text-[14px] font-bold text-black leading-tight">Toluwanimi Olayinka</h4>
                  <p className="text-[13px] text-[#4c4546]">Tech Founder</p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      <footer className="flex flex-col md:flex-row justify-between items-center px-8 py-10 w-full mt-auto bg-white border-t border-[#e2e2e2]">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <span className="font-display text-[20px] font-black text-black block mb-1 tracking-tight">CHIP NG</span>
          <p className="text-[14px] text-[#4c4546] mb-3">© 2026 CHIP NG. Elevating African Professionals.</p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-[#4c4546]">
            <a href="tel:08100764154" className="flex items-center gap-1.5 hover:text-black transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-[14px] font-medium font-mono">08100764154</span>
            </a>
            <a href="https://tiktok.com/@chipng_app" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-black transition-colors">
              {/* Premium TikTok SVG Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
              <span className="text-[14px] font-medium font-mono">@chipng_app</span>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="text-[14px] text-[#4c4546] hover:text-black font-medium transition-colors">Privacy Policy</a>
          <a href="#" className="text-[14px] text-[#4c4546] hover:text-black font-medium transition-colors">Terms of Service</a>
          <a href="#" className="text-[14px] text-[#4c4546] hover:text-black font-medium transition-colors">Security</a>
          <a href="#" className="text-[14px] text-[#4c4546] hover:text-black font-medium transition-colors">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
