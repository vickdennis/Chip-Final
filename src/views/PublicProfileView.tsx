import React from 'react';
import { ViewState } from '../App';
import { Globe, Mail, Briefcase, MessageSquare, TrendingUp, ArrowRight, CalendarDays, Share } from 'lucide-react';

export default function PublicProfileView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  return (
    <div className="min-h-screen bg-[#f3f3f4] flex flex-col items-center sm:py-12">
      <div className="w-full max-w-[480px] bg-white sm:rounded-sm sm:shadow-2xl overflow-hidden relative pb-12 min-h-screen sm:min-h-0 border border-[#e2e2e2]">
        
        {/* Top anchored nav */}
        <header className="flex justify-between items-center px-6 py-5 w-full absolute top-0 z-50 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="font-display text-[20px] font-black tracking-tight text-white pointer-events-auto cursor-pointer" onClick={() => onNavigate('admin-overview')}>CHIP NG</div>
          <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 font-mono text-[12px] font-bold px-4 py-2 rounded-full pointer-events-auto flex items-center gap-2 hover:bg-white/30 transition-colors">
            <Share className="w-3.5 h-3.5" /> Share
          </button>
        </header>

        {/* Hero Portrait */}
        <section className="relative w-full aspect-[4/5] bg-black">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJdZfBp08ThhJkbous1qpSV80_ElD1o9obSt5AOKNYgq32sqShFsY95dnIhjpFH1wxwvT4gzXvFAZ_IpKEl5CpME0qIY6tV53q3N41VoqzAapRX3JGVjV8t0xHFVojZGp54nQM3lEGjPU5Ju0AxqQw_8APH-7H5hG-vaOeYzXj3cEc4Wj1y2Dlzf4vx24Nocz6VRMn5bSHI36NCSzRpkwk1SSi4ZCVsbVNmmrSByG2hDIeGzM3OSF92uHwBeAQqdzi0PE4r_i8nQQ" 
            alt="Marcus Sterling" 
            className="w-full h-full object-cover object-top opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute bottom-6 left-6 pr-6 text-white">
            <h1 className="font-display text-[36px] font-bold leading-tight mb-1">Marcus Sterling</h1>
            <p className="font-mono text-[12px] tracking-widest text-[#cfc4c5] uppercase font-bold">Director of Human Engineering</p>
          </div>
        </section>

        {/* Social Icons */}
        <section className="px-6 py-8 flex justify-center gap-6 bg-white">
          {[Globe, Mail, Briefcase, MessageSquare].map((Icon, i) => (
            <a key={i} href="#" className="w-12 h-12 flex items-center justify-center rounded-full border border-[#cfc4c5] hover:border-black text-black hover:bg-black hover:text-white transition-all duration-200 active:scale-95">
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </section>

        <div className="px-6 space-y-6">
          
          {/* Release Bento Card */}
          <section className="bg-black text-white p-6 rounded-sm shadow-md flex flex-col gap-4 transform transition-transform hover:-translate-y-1 duration-200">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-[#cfc4c5]">Latest Release</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-[22px] font-bold mb-1">Precision Hardware Handbook</h2>
              <p className="font-sans text-[14px] text-[#cfc4c5] leading-relaxed">A 200-page guide to human-centric technical design. Available for download now.</p>
            </div>
            <button className="bg-white text-black font-mono text-[13px] font-bold py-3 rounded-sm px-5 w-fit flex items-center gap-2 mt-2 hover:bg-[#f3f3f4] active:scale-95 transition-all">
              Claim Copy <ArrowRight className="w-4 h-4" />
            </button>
          </section>

          {/* Booking Element */}
          <section className="bg-[#f9f9f9] border border-[#e2e2e2] p-6 rounded-sm pt-8">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="w-5 h-5 text-black" />
              <h3 className="font-display text-[20px] font-bold text-black">Book a Consultation</h3>
            </div>
            
            <div className="flex gap-2.5 overflow-x-auto pb-4 mb-2 -mx-2 px-2 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              <button className="snap-start flex-shrink-0 bg-black text-white px-4 py-3 rounded-sm text-center min-w-[72px] transition-colors">
                <div className="font-mono text-[10px] uppercase font-bold text-[#cfc4c5] mb-1">Mon</div>
                <div className="font-display font-extrabold text-[22px] leading-none">12</div>
              </button>
              <button className="snap-start flex-shrink-0 bg-white border border-[#cfc4c5] text-black px-4 py-3 rounded-sm text-center min-w-[72px] transition-colors hover:border-black">
                <div className="font-mono text-[10px] uppercase font-bold text-[#7e7576] mb-1">Tue</div>
                <div className="font-display font-extrabold text-[22px] leading-none">13</div>
              </button>
              <button className="snap-start flex-shrink-0 bg-white border border-[#cfc4c5] text-black px-4 py-3 rounded-sm text-center min-w-[72px] transition-colors hover:border-black">
                <div className="font-mono text-[10px] uppercase font-bold text-[#7e7576] mb-1">Wed</div>
                <div className="font-display font-extrabold text-[22px] leading-none">14</div>
              </button>
              <button className="snap-start flex-shrink-0 bg-white border border-[#cfc4c5] text-black px-4 py-3 rounded-sm text-center min-w-[72px] transition-colors hover:border-black">
                <div className="font-mono text-[10px] uppercase font-bold text-[#7e7576] mb-1">Thu</div>
                <div className="font-display font-extrabold text-[22px] leading-none">15</div>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="border border-[#cfc4c5] bg-white py-3 rounded-sm font-mono text-[13px] font-bold text-black hover:border-black hover:bg-[#f9f9f9] transition-all">09:00 AM</button>
              <button className="border border-[#cfc4c5] bg-white py-3 rounded-sm font-mono text-[13px] font-bold text-black hover:border-black hover:bg-[#f9f9f9] transition-all">11:30 AM</button>
              <button className="border border-[#cfc4c5] bg-white py-3 rounded-sm font-mono text-[13px] font-bold text-black hover:border-black hover:bg-[#f9f9f9] transition-all">02:00 PM</button>
              <button className="border border-[#cfc4c5] bg-white py-3 rounded-sm font-mono text-[13px] font-bold text-[#cfc4c5] cursor-not-allowed">04:30 PM</button>
            </div>
            
            <button className="w-full bg-black text-white py-3.5 rounded-sm font-mono text-[13px] font-bold tracking-widest uppercase active:scale-[0.98] transition-transform">
              Confirm Slot
            </button>
          </section>

          {/* Contact / Lead form */}
          <section className="bg-white border border-[#e2e2e2] p-6 rounded-sm pt-8">
            <h3 className="font-display text-[20px] font-bold text-black mb-1">Get in touch</h3>
            <p className="font-sans text-[14px] text-[#4c4546] mb-6">Drop your email for partnership opportunities and technical updates.</p>
            
            <form className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#4c4546] mb-1.5">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-sm p-3 focus:outline-none focus:border-black focus:bg-white transition-colors text-[14px]" />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#4c4546] mb-1.5">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-sm p-3 focus:outline-none focus:border-black focus:bg-white transition-colors text-[14px]" />
              </div>
              <button type="submit" className="bg-black text-white py-3.5 rounded-sm font-mono text-[13px] font-bold tracking-widest uppercase mt-2 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                Send Message <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </section>

        </div>

        <footer className="mt-12 mb-6 text-center">
           <div className="font-display text-[16px] font-black tracking-tight text-[#1a1c1c] mb-1">CHIP NG</div>
           <p className="font-sans text-[11px] text-[#7e7576]">Precision Engineering for Humans</p>
        </footer>

      </div>
    </div>
  );
}
