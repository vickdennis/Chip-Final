import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { ExternalLink, Mail, Link as LinkIcon, Share } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function PublicProfileView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
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

      if (profileData) {
        setProfile({ ...profileData, email: user.email });
      }
      if (linksData) setLinks(linksData);
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
    <div className="min-h-screen bg-[#f3f3f4] flex flex-col items-center">
      <div className="w-full max-w-[480px] bg-white sm:shadow-2xl overflow-hidden relative min-h-screen flex flex-col border-x border-[#e2e2e2]">
        
        {/* Absolute header for return to dashboard if needed */}
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => onNavigate('admin-overview')} className="bg-white/20 backdrop-blur-md text-white border border-white/30 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm">
            Back to Dashboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {/* Header Section */}
          <section className="relative w-full aspect-square md:aspect-[4/5] bg-black">
            <img 
              src={coverUrl}
              alt={profile?.full_name || "Profile"} 
              className="w-full h-full object-cover object-top opacity-90 grayscale"
            />
            {/* Smooth fade container at top base */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
            
            <div className="absolute bottom-0 w-full left-0 flex flex-col items-center text-center pb-8 px-6">
              <h1 className="font-display text-[32px] font-black text-black leading-tight mb-0.5">{profile?.full_name || "[Data Placeholder]"}</h1>
              <p className="font-mono text-[14px] text-[#7e7576]">@{profile?.headline || "[username]"}</p>
            </div>
          </section>

          <section className="px-6 flex flex-col items-center pt-2">
            
            <div className="flex flex-col items-center mb-8">
              <span className="font-display text-[40px] font-extrabold text-black leading-none mb-1">[Data Placeholder]</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#7e7576]">Total Followers</span>
            </div>

            {/* Contact/Connect Action Strip */}
            <a href={`mailto:${profile?.email || 'placeholder@example.com'}`} className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-4 flex items-center justify-between rounded-sm cursor-pointer hover:border-black transition-colors mb-8 group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center">
                   <Mail className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                   <span className="font-mono text-[11px] uppercase tracking-wider text-[#7e7576] font-bold">Connect with</span>
                   <span className="font-sans text-[14px] text-black font-semibold">{profile?.email || "[Email Placeholder]"}</span>
                 </div>
               </div>
            </a>

            {/* Outbound Links */}
            <div className="w-full flex flex-col gap-3">
              {links.length > 0 ? links.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black text-white p-4 rounded-sm shadow-sm hover:-translate-y-0.5 transition-transform flex items-center w-full"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center mr-4">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-sans text-[15px] font-medium flex-1 truncate">{link.label}</h2>
                  <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0 ml-2" />
                </a>
              )) : (
                 <div className="w-full border-2 border-dashed border-[#e2e2e2] rounded-sm p-6 flex flex-col items-center justify-center gap-2 mb-3">
                   <span className="font-mono text-[12px] text-[#cfc4c5]">[Ordered Link Data Placeholder]</span>
                 </div>
              )}
            </div>
          </section>
        </div>

        {/* Persistent Footer */}
        <footer className="absolute bottom-0 w-full bg-white border-t border-[#e2e2e2] px-6 py-5 flex justify-center gap-6 z-10">
           <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#7e7576] hover:text-black transition-colors">Privacy Policy</a>
           <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#7e7576] hover:text-black transition-colors">Terms</a>
           <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#7e7576] hover:text-black transition-colors">Report</a>
        </footer>

      </div>
    </div>
  );
}
