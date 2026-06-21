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
        console.log("Fetching profile for username:", username);
        const { data, error } = await supabase.from('profiles').select('*').ilike('username', username).single();
        console.log("Fetched data:", data, "Error:", error);
        if (error || !data) {
          console.error("Failed to fetch public profile:", error);
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

  const totalFollowers = socialLinks.reduce((sum, link) => sum + (link.follower_count || 0), 0);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const renderSocialLinks = () => {
    const style = profile?.social_links_style || 'inline';

    if (style === 'grid') {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 w-full px-6">
          {socialLinks.map((link, i) => {
            const platformDef = SOCIAL_PLATFORMS.find(p => p.name === link.platform);
            const Icon = platformDef?.icon || Globe;
            const color = platformDef?.color || '#333333';
            return (
              <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl transition-transform hover:-translate-y-1"
                style={{ backgroundColor: color, color: '#ffffff' }}
              >
                <Icon className="w-6 h-6" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">{link.platform}</span>
              </a>
            );
          })}
        </div>
      );
    }

    if (style === 'list') {
      return (
        <div className="flex flex-col gap-3 mt-4 w-full px-6">
          {socialLinks.map((link, i) => {
            const platformDef = SOCIAL_PLATFORMS.find(p => p.name === link.platform);
            const Icon = platformDef?.icon || Globe;
            const color = platformDef?.color || '#333333';
            return (
              <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center p-3 rounded-xl transition-transform hover:-translate-y-1 shadow-md w-full"
                style={{ backgroundColor: color, color: '#ffffff' }}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-sans text-[15px] font-bold flex-1">{link.platform}</span>
                {link.follower_count > 0 && profile?.show_total_followers && (
                  <span className="font-mono text-[11px] font-bold opacity-80">{formatFollowers(link.follower_count)} followers</span>
                )}
                <ExternalLink className="w-4 h-4 opacity-50 ml-2" />
              </a>
            );
          })}
        </div>
      );
    }

    // Default inline
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4 px-6">
        {socialLinks.map((link, i) => {
          const platformDef = SOCIAL_PLATFORMS.find(p => p.name === link.platform);
          const Icon = platformDef?.icon || Globe;
          const color = platformDef?.color || '#333333';
          return (
            <a 
              key={i} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:-translate-y-1 transition-transform shadow-md"
              style={{ backgroundColor: color, color: '#ffffff' }}
            >
              <Icon className="w-6 h-6" />
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <div className="w-full max-w-[480px] bg-[#0a0a0a] sm:shadow-2xl overflow-hidden relative min-h-screen flex flex-col border-x border-[#1a1a1a]">
        
        {/* Absolute header for return to dashboard if needed */}
        {!username && (
          <div className="absolute top-4 left-4 z-50">
            <button onClick={() => onNavigate && onNavigate('user-dashboard')} className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-white/20 transition-colors">
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
              className="w-full h-full object-cover object-top opacity-70 mask-image:linear-gradient(to_bottom,black,transparent)"
            />
            {/* Smooth fade container at top base */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
            
            <div className="absolute bottom-0 w-full left-0 flex flex-col items-center text-center pb-2">
              <h1 className="font-display text-[32px] font-black text-white leading-tight mb-2 flex items-center gap-2 justify-center flex-wrap px-4">
                {profile?.full_name || "[Data Placeholder]"}
                {profile?.is_verified && (
                  <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.996 22q-2.072 0-3.905-.783q-1.834-.783-3.176-2.125Q3.572 17.75 2.788 15.917Q2.005 14.083 2.005 12.01q0-2.072.783-3.905q.784-1.834 2.127-3.176Q6.257 3.587 8.09 2.804q1.834-.783 3.906-.783q2.072 0 3.905.783q1.833.783 3.175 2.125Q20.418 6.27 21.202 8.104Q21.985 9.938 21.985 12.01q0 2.072-.783 3.905q-.784 1.834-2.126 3.176Q17.734 20.434 15.9 21.217q-1.833.783-3.904.783Zm3.844-14.341-5.753 5.752-2.529-2.53-1.042 1.042 3.571 3.572 6.795-6.794Z"/>
                  </svg>
                )}
              </h1>
              <p className="font-sans text-[14px] text-[#a0a0a0] font-medium mb-1 px-6">{profile?.headline || ""}</p>
              <p className="font-mono text-[13px] text-[#707070] font-bold mb-3 px-6">@{profile?.username || "username"}</p>
              
              {profile?.show_total_followers && totalFollowers > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full mb-2">
                  <Globe className="w-3.5 h-3.5 text-[#a0a0a0]" />
                  <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">{formatFollowers(totalFollowers)} Total Followers</span>
                </div>
              )}
            </div>
          </section>

          {renderSocialLinks()}

          <section className="px-6 flex flex-col items-center pt-8">
            <div className="flex flex-col items-center mb-10 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#333] to-transparent my-6"></div>
            </div>

            {/* Contact/Connect Action Strip */}
            <div className="w-full flex gap-3 mb-8 flex-col sm:flex-row">
              <a href={`mailto:${profile?.contact_email || profile?.email || 'hello@example.com'}`} className="flex-1 bg-[#141414] border border-[#2a2a2a] p-3 flex items-center justify-between rounded-xl cursor-pointer hover:border-[#4a4a4a] transition-colors group">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center group-hover:bg-[#3a3a3a] transition-colors">
                     <Mail className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col overflow-hidden max-w-[140px]">
                     <span className="font-mono text-[10px] uppercase tracking-wider text-[#a0a0a0] font-bold">Email</span>
                     <span className="font-sans text-[13px] text-white font-semibold truncate">{profile?.contact_email || profile?.email || "[Email Placeholder]"}</span>
                   </div>
                 </div>
              </a>
              {profile?.phone_number && (
                <a href={`tel:${profile.phone_number}`} className="flex-1 bg-[#141414] border border-[#2a2a2a] p-3 flex items-center justify-between rounded-xl cursor-pointer hover:border-[#4a4a4a] transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center group-hover:bg-[#3a3a3a] transition-colors">
                       <Phone className="w-4 h-4" />
                     </div>
                     <div className="flex flex-col overflow-hidden max-w-[140px]">
                       <span className="font-mono text-[10px] uppercase tracking-wider text-[#a0a0a0] font-bold">Call</span>
                       <span className="font-sans text-[13px] text-white font-semibold truncate">{profile.phone_number}</span>
                     </div>
                   </div>
                </a>
              )}
            </div>

            {profile?.address && (
              <div className="w-full bg-[#141414] border border-[#2a2a2a] p-4 flex items-center gap-4 rounded-xl mb-8">
                <div className="w-10 h-10 bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#a0a0a0] font-bold">Location</span>
                  <span className="font-sans text-[14px] text-white font-semibold">{profile.address}</span>
                </div>
              </div>
            )}

            {profile?.calendar_link && profile?.show_availability !== false && (
              <a 
                href={profile.calendar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#fafafa] text-black p-4 flex items-center justify-between rounded-xl cursor-pointer hover:bg-white transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                 <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                     <span className="font-mono text-[10px] uppercase tracking-wider text-[#505050] font-bold">{profile.booking_provider || 'Book a session'}</span>
                     <span className="font-sans text-[15px] font-bold flex items-center gap-2">View Availability</span>
                   </div>
                 </div>
                 <ExternalLink className="w-5 h-5 text-black" />
              </a>
            )}

            {/* Outbound Links */}
            <div className="w-full flex flex-col gap-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-2 px-1">Featured Links</span>
              {links.length > 0 ? links.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#141414] border border-[#2a2a2a] text-white p-4 rounded-xl shadow-sm hover:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center w-full group"
                >
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/10 transition-colors">
                    <LinkIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-sans text-[15px] font-medium flex-1 truncate">{link.label}</h2>
                  <ExternalLink className="w-4 h-4 text-[#707070] flex-shrink-0 ml-2 group-hover:text-white transition-colors" />
                </a>
              )) : (
                 <div className="w-full border-2 border-dashed border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center gap-2 mb-3 bg-[#0a0a0a]">
                   <span className="font-mono text-[12px] text-[#505050]">[Ordered Link Data Placeholder]</span>
                 </div>
              )}
            </div>
          </section>
        </div>

        {/* Persistent Footer */}
        <footer className="absolute bottom-0 w-full bg-[#0a0a0a] border-t border-[#1a1a1a] px-6 py-5 flex justify-center gap-6 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
           <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-white transition-colors">Privacy Policy</a>
           <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-white transition-colors">Terms</a>
           <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-white transition-colors">Report</a>
        </footer>

      </div>
    </div>
  );
}
