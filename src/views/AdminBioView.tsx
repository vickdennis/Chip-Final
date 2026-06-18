import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Save, Eye, UserCircle, Upload, Trash2, Link, GripVertical, Plus, Globe, AtSign, Rss, Calendar, QrCode, Download, Settings, Loader2 } from 'lucide-react';

export default function AdminBioView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [coverUrl, setCoverUrl] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuAKmj1IQNtRkZw-_CqYMvw1-oJRYbntoE9i-lcO4f0YTzE_on6FkGQEYyBT1UdJVxGV7OyV7ueGqGF2ch0RtSSReFT8haZ8lApX_7eI6tzbitRCQ6osMYAawyY38MGBi-DpEMoi9ECaOGMDEgNK_67r-NiOzMM9ELvAND9EE8Wk4NeqOUJGZZOq_UFQpkO0VYW9ksAGgsyyRu3PLkfrtMz0OidKOYsyRTejiHv7dqViKM_2W3KUE-4bVO2Xe9qhqoFFNPDvAfZVStY");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      setCoverUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout onNavigate={onNavigate} activePath="bio">
      <div className="max-w-[1200px] mx-auto pb-16">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-black tracking-tight mb-1">
              Bio Management
            </h2>
            <p className="text-[16px] text-[#4c4546]">Manage your professional profile and digital presence.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-black text-white font-mono text-[13px] font-medium hover:bg-black/90 transition-colors rounded-sm flex items-center gap-2">
              <Save className="w-[18px] h-[18px]" /> Save Changes
            </button>
            <button 
              onClick={() => onNavigate('public-profile')}
              className="px-5 py-2.5 border border-[#cfc4c5] text-black bg-white font-mono text-[13px] font-medium hover:bg-[#f3f3f4] transition-colors rounded-sm flex items-center gap-2"
            >
              <Eye className="w-[18px] h-[18px]" /> Preview Bio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Identity */}
            <section className="bg-white border border-[#cfc4c5] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] p-5 flex justify-between items-center bg-[#f9f9f9]">
                <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">Profile Identity</h3>
                <UserCircle className="w-[20px] h-[20px] text-[#4c4546]" />
              </div>
              <div className="p-6 flex flex-col gap-8">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest mb-3">Cover Image</label>
                  <div className="relative group h-56 w-full border border-[#cfc4c5] rounded-sm overflow-hidden bg-[#f3f3f4]">
                    <img 
                      src={coverUrl} 
                      alt="Cover" 
                      className="w-full h-full object-cover grayscale opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-sm font-mono text-[12px] font-bold hover:bg-white/90 flex items-center gap-2">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Uploading...' : 'Change'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                      <button 
                        onClick={() => setCoverUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuAKmj1IQNtRkZw-_CqYMvw1-oJRYbntoE9i-lcO4f0YTzE_on6FkGQEYyBT1UdJVxGV7OyV7ueGqGF2ch0RtSSReFT8haZ8lApX_7eI6tzbitRCQ6osMYAawyY38MGBi-DpEMoi9ECaOGMDEgNK_67r-NiOzMM9ELvAND9EE8Wk4NeqOUJGZZOq_UFQpkO0VYW9ksAGgsyyRu3PLkfrtMz0OidKOYsyRTejiHv7dqViKM_2W3KUE-4bVO2Xe9qhqoFFNPDvAfZVStY")}
                        className="bg-[#ba1a1a] text-white px-4 py-2 rounded-sm font-mono text-[12px] font-bold hover:bg-[#93000a] flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue="Marcus Sterling" 
                      className="w-full px-4 py-2.5 bg-white border border-[#cfc4c5] rounded-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow font-sans text-[14px] text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="marcus@chip-ng.io" 
                      className="w-full px-4 py-2.5 bg-white border border-[#cfc4c5] rounded-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow font-sans text-[14px] text-black"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">Job Title / Headline</label>
                    <input 
                      type="text" 
                      defaultValue="Director of Human Engineering" 
                      className="w-full px-4 py-2.5 bg-white border border-[#cfc4c5] rounded-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow font-sans text-[14px] text-black"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Links */}
            <section className="bg-white border border-[#cfc4c5] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] p-5 flex justify-between items-center bg-[#f9f9f9]">
                <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">External Links</h3>
                <button className="text-black hover:underline font-mono text-[12px] font-bold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {[
                  { label: "Precision Hardware Handbook", url: "https://chip-ng.io/handbook" },
                  { label: "Engineering Manifesto", url: "https://chip-ng.io/manifesto" }
                ].map((item, i) => (
                  <div key={i} className="border border-[#cfc4c5] rounded-sm p-4 bg-[#f9f9f9] hover:border-[#7e7576] transition-colors group flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="cursor-move text-[#7e7576] opacity-40 group-hover:opacity-100">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <input 
                          type="text" 
                          defaultValue={item.label} 
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] rounded-sm focus:border-black outline-none font-sans text-[14px] text-black"
                        />
                        <input 
                          type="text" 
                          defaultValue={item.url} 
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] rounded-sm focus:border-black outline-none font-sans text-[13px] text-[#4c4546]"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <button className="p-2 text-[#7e7576] hover:text-[#ba1a1a] transition-colors rounded-sm hover:bg-[#ffdad6]">
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Social Media */}
            <section className="bg-white border border-[#cfc4c5] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] p-5 flex justify-between items-center bg-[#f9f9f9]">
                <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">Social Media</h3>
                <Link className="w-[18px] h-[18px] text-[#4c4546]" />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center text-[#4c4546]"><Globe className="w-5 h-5" /></div>
                  <input type="text" defaultValue="https://chip-ng.io" className="flex-1 px-3 py-2 border border-[#cfc4c5] focus:border-black outline-none rounded-sm font-mono text-[12px] text-black" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center text-[#4c4546]"><AtSign className="w-5 h-5" /></div>
                  <input type="text" defaultValue="https://x.com/msterling" className="flex-1 px-3 py-2 border border-[#cfc4c5] focus:border-black outline-none rounded-sm font-mono text-[12px] text-black" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center text-[#4c4546]"><Rss className="w-5 h-5" /></div>
                  <input type="text" defaultValue="https://github.com/chip-ng" className="flex-1 px-3 py-2 border border-[#cfc4c5] focus:border-black outline-none rounded-sm font-mono text-[12px] text-black" />
                </div>
                <button className="mt-3 text-black font-mono text-[12px] font-bold hover:underline flex items-center gap-1 justify-center py-1">
                  <Plus className="w-4 h-4" /> Add Platform
                </button>
              </div>
            </section>

            {/* Appointments */}
            <section className="bg-white border border-[#cfc4c5] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] p-5 flex justify-between items-center bg-[#f9f9f9]">
                <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">Appointments</h3>
                <Calendar className="w-[18px] h-[18px] text-[#4c4546]" />
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">Booking Provider</label>
                  <select className="w-full px-3 py-2.5 bg-white border border-[#cfc4c5] rounded-sm font-sans text-[14px] outline-none focus:border-black">
                    <option>Calendly (Integrated)</option>
                    <option>SavvyCal</option>
                    <option>Custom URL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">Calendar Link</label>
                  <input type="text" defaultValue="calendly.com/chip-ng/consultation" className="w-full px-3 py-2.5 bg-white border border-[#cfc4c5] rounded-sm font-sans text-[14px] outline-none focus:border-black" />
                </div>
                <div className="flex items-center gap-3 bg-[#f9f9f9] p-3 rounded-sm border border-[#e2e2e2]">
                  <input type="checkbox" defaultChecked id="show-avail" className="w-4 h-4 text-black border-[#cfc4c5] rounded-[2px] focus:ring-black" />
                  <label htmlFor="show-avail" className="text-black text-[13px] font-medium leading-none cursor-pointer pt-0.5">Display availability on bio</label>
                </div>
              </div>
            </section>

            {/* Export */}
            <section className="bg-white border border-[#cfc4c5] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] p-4 flex justify-between items-center bg-[#f9f9f9]">
                <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">vCard Export</h3>
                <QrCode className="w-[18px] h-[18px] text-[#4c4546]" />
              </div>
              <div className="p-5 flex gap-3">
                <div className="w-12 h-12 bg-white flex items-center justify-center rounded-sm border border-[#cfc4c5] shrink-0">
                  <QrCode className="w-7 h-7 text-black" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button className="w-full px-3 py-1.5 border border-[#cfc4c5] text-black font-mono text-[12px] font-bold hover:bg-[#f3f3f4] rounded-[2px] flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" /> Download vCard
                  </button>
                  <button className="w-full px-3 py-1.5 border border-[#cfc4c5] text-black font-mono text-[12px] font-bold hover:bg-[#f3f3f4] rounded-[2px] flex items-center justify-center gap-2 transition-colors">
                    <Settings className="w-4 h-4" /> Advanced Setup
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
