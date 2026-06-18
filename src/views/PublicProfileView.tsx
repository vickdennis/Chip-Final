import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { Globe, Mail, Briefcase, MessageSquare, TrendingUp, ArrowRight, CalendarDays, Share, Linkedin, Twitter, Github, Instagram, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SocialIconMap: Record<string, React.ReactNode> = {
  'Website': <Globe className="w-5 h-5" />,
  'X': <Twitter className="w-5 h-5" />,
  'GitHub': <Github className="w-5 h-5" />,
  'LinkedIn': <Linkedin className="w-5 h-5" />,
  'Instagram': <Instagram className="w-5 h-5" />
};

export default function PublicProfileView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', user.id).order('position');
      const { data: socialData } = await supabase.from('social_links').select('*').eq('profile_id', user.id);

      if (profileData) {
        setProfile({ ...profileData, email: user.email });
      }
      if (linksData) setLinks(linksData);
      if (socialData) setSocialLinks(socialData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f3f4] flex items-center justify-center">Loading...</div>;
  }

  const coverUrl = profile?.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDJdZfBp08ThhJkbous1qpSV80_ElD1o9obSt5AOKNYgq32sqShFsY95dnIhjpFH1wxwvT4gzXvFAZ_IpKEl5CpME0qIY6tV53q3N41VoqzAapRX3JGVjV8t0xHFVojZGp54nQM3lEGjPU5Ju0AxqQw_8APH-7H5hG-vaOeYzXj3cEc4Wj1y2Dlzf4vx24Nocz6VRMn5bSHI36NCSzRpkwk1SSi4ZCVsbVNmmrSByG2hDIeGzM3OSF92uHwBeAQqdzi0PE4r_i8nQQ";

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
            src={coverUrl}
            alt={profile?.full_name || "Profile"} 
            className="w-full h-full object-cover object-top opacity-90 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute bottom-6 left-6 pr-6 text-white">
            <h1 className="font-display text-[36px] font-bold leading-tight mb-1">{profile?.full_name || "Name"}</h1>
            <p className="font-mono text-[12px] tracking-widest text-[#cfc4c5] uppercase font-bold">{profile?.headline || "Headline"}</p>
          </div>
        </section>

        {/* Social Icons */}
        <section className="px-6 py-8 flex justify-center gap-6 bg-white flex-wrap">
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className="w-12 h-12 flex items-center justify-center rounded-full border border-[#cfc4c5] hover:border-black text-black hover:bg-black hover:text-white transition-all duration-200 active:scale-95">
              <Mail className="w-5 h-5" />
            </a>
          )}
          {socialLinks.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full border border-[#cfc4c5] hover:border-black text-black hover:bg-black hover:text-white transition-all duration-200 active:scale-95">
              {SocialIconMap[link.platform] || <LinkIcon className="w-5 h-5" />}
            </a>
          ))}
          {socialLinks.length === 0 && !profile?.email && (
            <div className="text-[#7e7576] font-mono text-[12px]">No social links</div>
          )}
        </section>

        <div className="px-6 space-y-4">
          
          {/* Links Elements */}
          {links.map((link, i) => (
            <a 
              key={i} 
              href={link.url}
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-black text-white p-5 rounded-sm shadow-sm hover:shadow-md transform transition-all hover:-translate-y-0.5 duration-200"
            >
              <div className="flex justify-between items-center group">
                <h2 className="font-display text-[16px] font-bold group-hover:text-[#e0e0e0] transition-colors">{link.label}</h2>
                <ArrowRight className="w-5 h-5 text-[#cfc4c5] group-hover:text-white transition-colors" />
              </div>
            </a>
          ))}

          {/* Booking Element */}
          {profile?.show_availability !== false && (
            <section className="bg-[#f9f9f9] border border-[#e2e2e2] p-6 rounded-sm pt-8 mt-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-black" />
                  <h3 className="font-display text-[20px] font-bold text-black">Book a Session</h3>
                </div>
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
              </div>

              <div className="h-[1px] bg-[#e2e2e2] w-full my-4"></div>
              
              <div className="flex flex-col gap-3">
                <button className="w-full text-left px-4 py-3 hover:bg-[#f3f3f4] rounded-sm transition-colors flex justify-between items-center group">
                  <span className="font-mono text-[13px] font-bold text-black">10:00 AM (UTC)</span>
                  <span className="text-[12px] text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-[#f3f3f4] rounded-sm transition-colors flex justify-between items-center group">
                  <span className="font-mono text-[13px] font-bold text-black">2:30 PM (UTC)</span>
                  <span className="text-[12px] text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                </button>
                
                {profile?.calendar_link && (
                  <a 
                    href={profile.calendar_link.startsWith('http') ? profile.calendar_link : `https://${profile.calendar_link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 mt-4 bg-white border border-[#cfc4c5] text-black font-mono text-[13px] font-bold py-3 rounded-sm hover:bg-[#f3f3f4] active:scale-[0.98] transition-all"
                  >
                    View Full Calendar <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Contact / Lead form */}
          <section className="bg-white border border-[#e2e2e2] p-6 rounded-sm pt-8 mt-6">
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
              <button type="button" className="bg-black text-white py-3.5 rounded-sm font-mono text-[13px] font-bold tracking-widest uppercase mt-2 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
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
