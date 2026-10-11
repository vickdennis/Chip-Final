import React, { useState } from 'react';
import { 
  Camera, 
  Save, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Share2, 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  Check, 
  Loader2, 
  Eye, 
  User, 
  Briefcase 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from '../../components/Toast';
import { SOCIAL_PLATFORMS } from '../UserDashboard';

interface MobileProfileTabProps {
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  links: any[];
  setLinks: React.Dispatch<React.SetStateAction<any[]>>;
  socialLinks: any[];
  setSocialLinks: React.Dispatch<React.SetStateAction<any[]>>;
  onViewPublicProfile: () => void;
  onOpenShare: () => void;
}

export const MobileProfileTab: React.FC<MobileProfileTabProps> = ({
  profile,
  setProfile,
  links,
  setLinks,
  socialLinks,
  setSocialLinks,
  onViewPublicProfile,
  onOpenShare,
}) => {
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'links' | 'social'>('info');
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Link Input State
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkSize, setNewLinkSize] = useState<'Button' | 'Small' | 'Medium' | 'Big'>('Button');

  // Handle Image Upload to Supabase Storage 'covers'
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !profile?.id) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setProfile((prev: any) => ({ ...prev, cover_image_url: publicUrl }));
      await supabase.from('profiles').update({ cover_image_url: publicUrl }).eq('id', profile.id);
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error('Image upload failed: ' + (err.message || 'Please try a smaller image'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Profile Info to Supabase
  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const cleanUsername = (profile.username || '').toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
      const updatePayload = {
        full_name: profile.full_name?.trim() || '',
        username: cleanUsername,
        headline: profile.headline?.trim() || '',
        bio: profile.bio?.trim() || '',
        cover_image_url: profile.cover_image_url || null,
        contact_email: profile.contact_email?.trim() || null,
        phone_number: profile.phone_number?.trim() || null,
        address: profile.address?.trim() || null,
        calendar_link: profile.calendar_link?.trim() || null,
        booking_provider: profile.booking_provider || 'Calendly (Integrated)',
        show_availability: profile.show_availability !== false,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile changes synchronized!');
    } catch (err: any) {
      toast.error('Failed to save profile: ' + (err.message || 'Check connection'));
    } finally {
      setSaving(false);
    }
  };

  // Add Link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim() || !profile?.id) return;

    let cleanUrl = newLinkUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      const newPos = links.length;
      const { data, error } = await supabase.from('links').insert([{
        profile_id: profile.id,
        label: newLinkLabel.trim(),
        url: cleanUrl,
        size: newLinkSize,
        position: newPos,
        use_link_icon: true
      }]).select().single();

      if (error) throw error;
      setLinks(prev => [...prev, data]);
      setNewLinkLabel('');
      setNewLinkUrl('');
      toast.success('Link added to profile!');
    } catch (err: any) {
      toast.error('Failed to add link: ' + err.message);
    }
  };

  // Delete Link
  const handleDeleteLink = async (linkId: string | number) => {
    try {
      await supabase.from('links').delete().eq('id', linkId);
      setLinks(prev => prev.filter(l => l.id !== linkId));
      toast.success('Link removed');
    } catch (err: any) {
      toast.error('Failed to delete link');
    }
  };

  // Update or Toggle Social Link
  const handleUpdateSocial = async (platformName: string, url: string) => {
    if (!profile?.id) return;
    try {
      const existing = socialLinks.find(s => s.platform?.toLowerCase() === platformName.toLowerCase());
      if (!url.trim()) {
        // Delete if empty
        if (existing) {
          await supabase.from('social_links').delete().eq('id', existing.id);
          setSocialLinks(prev => prev.filter(s => s.id !== existing.id));
        }
        return;
      }

      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      if (existing) {
        await supabase.from('social_links').update({ url: cleanUrl }).eq('id', existing.id);
        setSocialLinks(prev => prev.map(s => s.id === existing.id ? { ...s, url: cleanUrl } : s));
      } else {
        const { data, error } = await supabase.from('social_links').insert([{
          profile_id: profile.id,
          platform: platformName,
          url: cleanUrl
        }]).select().single();
        if (!error && data) {
          setSocialLinks(prev => [...prev, data]);
        }
      }
      toast.success(`${platformName} link updated!`);
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-28 text-left">
      {/* Top Profile Header Strip */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Profile Studio
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewPublicProfile}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-[#D2F843] hover:bg-[#c3eb34] active:scale-[0.98] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>
      </div>

      {/* Avatar & Identity Box */}
      <div className="p-5 rounded-3xl bg-neutral-900/80 border border-white/10 flex items-center gap-4">
        {/* Avatar Upload */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-white/15 overflow-hidden flex items-center justify-center relative">
            {profile?.cover_image_url ? (
              <img
                src={profile.cover_image_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-neutral-400">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-[#D2F843] animate-spin" />
              </div>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </label>
        </div>

        {/* Name and Handle Display */}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-white truncate">
            {profile?.full_name || 'Your Name'}
          </h3>
          <p className="text-xs text-[#D2F843] font-mono truncate">
            @{profile?.username || 'handle'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={onOpenShare}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3 h-3" /> Share Link
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs: Info vs Links vs Social */}
      <div className="flex bg-neutral-900 p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'info'
              ? 'bg-[#D2F843] text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          General Info
        </button>
        <button
          onClick={() => setActiveSubTab('links')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'links'
              ? 'bg-[#D2F843] text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Links ({links.length})
        </button>
        <button
          onClick={() => setActiveSubTab('social')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'social'
              ? 'bg-[#D2F843] text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Socials ({socialLinks.length})
        </button>
      </div>

      {/* TAB 1: General Info Form */}
      {activeSubTab === 'info' && (
        <div className="space-y-4 p-5 rounded-3xl bg-neutral-900/60 border border-white/5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="e.g. Victor Dennis"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Username Handle
            </label>
            <div className="flex items-center px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus-within:border-[#D2F843] transition-colors">
              <span className="text-xs font-mono text-neutral-500 mr-1">chipng.com/@</span>
              <input
                type="text"
                value={profile?.username || ''}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="handle"
                className="w-full bg-transparent text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Headline / Job Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Professional Headline / Role
            </label>
            <input
              type="text"
              value={profile?.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              placeholder="e.g. Lead Architect • Venture Partner"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Bio Summary
            </label>
            <textarea
              rows={3}
              value={profile?.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell visitors about your practice, accomplishments, or company..."
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Direct Phone / WhatsApp
            </label>
            <input
              type="tel"
              value={profile?.phone_number || ''}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              placeholder="+234 810 000 0000"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Contact Email
            </label>
            <input
              type="email"
              value={profile?.contact_email || ''}
              onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors"
            />
          </div>

          {/* Calendly / Booking link */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-neutral-400 mb-1.5">
              Appointment / Calendly URL
            </label>
            <input
              type="url"
              value={profile?.calendar_link || ''}
              onChange={(e) => setProfile({ ...profile, calendar_link: e.target.value })}
              placeholder="https://calendly.com/your-name"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* TAB 2: Custom Links */}
      {activeSubTab === 'links' && (
        <div className="space-y-4">
          {/* Add Link Form */}
          <form onSubmit={handleAddLink} className="p-4 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              + Add New Profile Link
            </h4>
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Link Title (e.g. Pitch Deck, Portfolio, Store)"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none"
              required
            />
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none"
              required
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-mono">Card Size:</span>
              {(['Button', 'Small', 'Medium', 'Big'] as const).map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => setNewLinkSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    newLinkSize === sz ? 'bg-[#D2F843] text-black' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D2F843] hover:bg-[#c3eb34] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Link
            </button>
          </form>

          {/* Links List */}
          <div className="space-y-2.5">
            {links.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-xs">
                No custom links added yet. Add your portfolio, store, or pitch deck above.
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{link.label}</h5>
                    <p className="text-[11px] font-mono text-neutral-400 truncate">{link.url}</p>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 mt-1 inline-block">
                      {link.size || 'Button'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Social Media Accounts */}
      {activeSubTab === 'social' && (
        <div className="space-y-3 p-5 rounded-3xl bg-neutral-900/60 border border-white/5">
          <p className="text-xs text-neutral-400 mb-2">
            Add your social profile URLs. They render as verified icon badges on your public card:
          </p>

          {['WhatsApp', 'Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok', 'YouTube', 'Facebook'].map((platform) => {
            const currentUrl = socialLinks.find(s => s.platform?.toLowerCase() === platform.toLowerCase())?.url || '';

            return (
              <div key={platform} className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-300 font-bold block">
                  {platform}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={currentUrl}
                    onBlur={(e) => handleUpdateSocial(platform, e.target.value)}
                    placeholder={`e.g. https://${platform.toLowerCase().includes('x') ? 'x.com' : platform.toLowerCase() + '.com'}/yourhandle`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
