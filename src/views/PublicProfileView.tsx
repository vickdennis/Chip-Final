import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { ExternalLink, Mail, Link as LinkIcon, Share, Globe, Phone, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SOCIAL_PLATFORMS } from './UserDashboard';

export default function PublicProfileView({ onNavigate, username }: { onNavigate?: (view: ViewState) => void, username?: string | null }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      let targetUserId = null;
      let profileData = null;

      if (username) {
        // Fetch public profile by username
        const { data, error } = await supabase.from('profiles').select('*').ilike('username', username).single();
        if (error || !data) {
          setError('User not found');
          setLoading(false);
          return;
        }
        profileData = data;
        targetUserId = data.id;
      } else {
        // Fetch own profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (onNavigate) onNavigate('login');
          return;
        }
        targetUserId = user.id;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profileData = { ...data, email: user.email };
      }

      const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', targetUserId).order('position');
      const { data: socialData } = await supabase.from('social_links').select('*').eq('profile_id', targetUserId);

      if (profileData) {
        setProfile(profileData);
      }
      if (linksData) setLinks(linksData);
      if (socialData) setSocialLinks(socialData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f3f4] flex items-center justify-center">Loading...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f3f3f4] flex flex-col items-center justify-center text-center p-6">
        <h1 className="font-display text-4xl font-black mb-2 text-black">Profile Not Found</h1>
        <p className="font-sans text-[#7e7576] mb-6">We couldn't find a user with this username.</p>
        <button 
          onClick={() => {
            window.location.href = '/';
          }} 
          className="px-6 py-2 bg-black text-white font-mono text-[13px] font-bold rounded-sm uppercase tracking-widest hover:bg-black/90 transition-colors"
        >
          Create your own chip.ng
        </button>
      </div>
    );
  }

  const coverUrl = profile?.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDJdZfBp08ThhJkbous1qpSV80_ElD1o9obSt5AOKNYgq32sqShFsY95dnIhjpFH1wxwvT4gzXvFAZ_IpKEl5CpME0qIY6tV53q3N41VoqzAapRX3JGVjV8t0xHFVojZGp54nQM3lEGjPU5Ju0AxqQw_8APH-7H5hG-vaOeYzXj3cEc4Wj1y2Dlzf4vx24Nocz6VRMn5bSHI36NCSzRpkwk1SSi4ZCVsbVNmmrSByG2hDIeGzM3OSF92uHwBeAQqdzi0PE4r_i8nQQ";

  return (
    <div className="min-h-screen bg-[#f3f3f4] flex flex-col items-center">
      <div className="w-full max-w-[480px] bg-white sm:shadow-2xl overflow-hidden relative min-h-screen flex flex-col border-x border-[#e2e2e2]">
        
        {/* Absolute header for return to dashboard if needed */}
        {!username && (
          <div className="absolute top-4 left-4 z-50">
            <button onClick={() => onNavigate && onNavigate('user-dashboard')} className="bg-black/50 backdrop-blur-md text-white border border-white/30 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-black/70 transition-colors">
              Back to Dashboard
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {/* Header Section */}
          <section className="relative w-full aspect-square md:aspect-[4/5] bg-black">
            <img 
              src={coverUrl}
              alt={profile?.full_name || "Profile"} 
              className="w-full h-full object-cover object-top opacity-90"
            />
            {/* Smooth fade container at top base */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
            
            <div className="absolute bottom-0 w-full left-0 flex flex-col items-center text-center pb-8 px-6">
              <h1 className="font-display text-[32px] font-black text-black leading-tight mb-2">{profile?.full_name || "[Data Placeholder]"}</h1>
              <p className="font-mono text-[14px] text-[#7e7576] font-bold mb-3">@{profile?.username || "username"}</p>
              
              {/* Horizontal Social Links */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {socialLinks.map((link, i) => {
                  const platformDef = SOCIAL_PLATFORMS.find(p => p.name === link.platform);
                  const Icon = platformDef?.icon || Globe;
                  const color = platformDef?.color || '#000000';
                  return (
                    <a 
                      key={i} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 flex items-center justify-center rounded-sm hover:-translate-y-1 transition-transform shadow-md"
                      style={{ backgroundColor: color, color: '#ffffff' }}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-6 flex flex-col items-center pt-2">
            
            <div className="flex flex-col items-center mb-8">
              <span className="font-display text-[40px] font-extrabold text-black leading-none mb-1">{links.length + socialLinks.length}</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#7e7576]">Total Links</span>
            </div>

            {/* Contact/Connect Action Strip */}
            <div className="w-full flex gap-3 mb-8 flex-col sm:flex-row">
              <a href={`mailto:${profile?.contact_email || profile?.email || 'hello@example.com'}`} className="flex-1 bg-[#f9f9f9] border border-[#cfc4c5] p-3 flex items-center justify-between rounded-sm cursor-pointer hover:border-black transition-colors group">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center">
                     <Mail className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col overflow-hidden max-w-[140px]">
                     <span className="font-mono text-[11px] uppercase tracking-wider text-[#7e7576] font-bold">Email</span>
                     <span className="font-sans text-[13px] text-black font-semibold truncate">{profile?.contact_email || profile?.email || "[Email Placeholder]"}</span>
                   </div>
                 </div>
              </a>
              {profile?.phone_number && (
                <a href={`tel:${profile.phone_number}`} className="flex-1 bg-[#f9f9f9] border border-[#cfc4c5] p-3 flex items-center justify-between rounded-sm cursor-pointer hover:border-black transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center">
                       <Phone className="w-4 h-4" />
                     </div>
                     <div className="flex flex-col overflow-hidden max-w-[140px]">
                       <span className="font-mono text-[11px] uppercase tracking-wider text-[#7e7576] font-bold">Call</span>
                       <span className="font-sans text-[13px] text-black font-semibold truncate">{profile.phone_number}</span>
                     </div>
                   </div>
                </a>
              )}
            </div>

            {profile?.address && (
              <div className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-4 flex items-center gap-3 rounded-sm mb-8">
                <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#7e7576] font-bold">Location</span>
                  <span className="font-sans text-[14px] text-black font-semibold">{profile.address}</span>
                </div>
              </div>
            )}

            {profile?.calendar_link && profile?.show_availability !== false && (
              <a 
                href={profile.calendar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#1a1c1c] text-white p-4 flex items-center justify-between rounded-sm cursor-pointer hover:bg-black transition-colors mb-8 shadow-md"
              >
                 <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                     <span className="font-mono text-[11px] uppercase tracking-wider text-[#cfc4c5] font-bold">{profile.booking_provider || 'Book a session'}</span>
                     <span className="font-sans text-[15px] text-white font-semibold flex items-center gap-2">View Availability</span>
                   </div>
                 </div>
                 <ExternalLink className="w-5 h-5 text-white/80" />
              </a>
            )}

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
