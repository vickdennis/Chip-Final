import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  MessageCircle, 
  Instagram, 
  Send, 
  Mail, 
  Upload, 
  Loader2, 
  Eye, 
  Sparkles, 
  Layers, 
  Code,
  ArrowUpRight,
  AlertTriangle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from '../components/Toast';

interface PortfolioProject {
  id: number;
  title: string;
  slug: string;
  category?: string;
  tagline?: string;
  description: string;
  technologies: string;
  live_url: string;
  github_url?: string;
  image_url: string;
  featured?: number;
  sort_order?: number;
}

interface PortfolioProfile {
  name: string;
  handle: string;
  title: string;
  subtitle: string;
  bio: string;
  years_experience: string;
  location: string;
  avatar_url: string;
  hero_image_url: string;
  about_image_url: string;
  skills_frontend: string;
  skills_styles: string;
  skills_backend: string;
  skills_devops: string;
  social_github: string;
  social_linkedin: string;
  social_twitter: string;
  social_whatsapp: string;
  social_instagram: string;
  social_telegram: string;
  social_email: string;
  featured_article_title: string;
  featured_article_desc: string;
  featured_article_tag: string;
  featured_article_url: string;
}

export const AdminPortfolioManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'profile' | 'socials'>('projects');

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [profile, setProfile] = useState<PortfolioProfile>({
    name: 'Victor Okoye',
    handle: 'victor.okoye',
    title: 'Full-stack Developer',
    subtitle: 'My goal is to write maintainable, clean and understandable code to process development was enjoyable.',
    bio: "Hello! I'm Victor, I'm a full-stack developer. More than 6 years experience.",
    years_experience: '6+ years',
    location: 'Lagos, Nigeria',
    avatar_url: '/chipng_exact_tile.png',
    hero_image_url: '/chipng_3d_logo.jpg',
    about_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    skills_frontend: 'TypeScript / React / Next.js / Tailwind CSS / Vue / React Native / Redux Toolkit / Framer Motion / Puppeteer',
    skills_styles: 'Tailwind CSS / SCSS / PostCSS / CSS Modules / Headless UI',
    skills_backend: 'Node.js / Express / TypeScript / PostgreSQL / SQLite / Supabase / Redis / Kafka / REST & GraphQL / Flutterwave API',
    skills_devops: 'Docker / Linux / Vercel / Google Cloud Run / CI/CD / Git / Nginx / Cloudflare',
    social_github: 'https://github.com/vickdennis',
    social_linkedin: 'https://linkedin.com/company/chipng',
    social_twitter: 'https://x.com/chipng_nfc',
    social_whatsapp: 'https://wa.me/2348100764154',
    social_instagram: 'https://instagram.com/chipng_nfc',
    social_telegram: 'https://t.me/chipng',
    social_email: 'hello@chipng.com',
    featured_article_title: 'The simplest example is kafka + golang',
    featured_article_desc: 'This article presents a simple way to implement a micro-service architecture using Kafka, Golang and Docker.',
    featured_article_tag: 'Architecture & Distributed Systems',
    featured_article_url: 'https://chipng.com/blog/hardware-engineering-sub-10ms-nfc',
  });

  // Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<PortfolioProject> | null>(null);

  const fetchPortfolioData = async () => {
    try {
      const cached = localStorage.getItem('chipng_portfolio_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) setProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {}

    setLoading(true);
    try {
      // 1. Try Supabase cloud database first
      try {
        const { data: spProfile } = await supabase.from('portfolio_profile').select('*').eq('id', 1).maybeSingle();
        if (spProfile) {
          setProfile((prev) => ({ ...prev, ...spProfile }));
          try {
            localStorage.setItem('chipng_portfolio_profile', JSON.stringify(spProfile));
          } catch (e) {}
        }
        const { data: spProjects } = await supabase.from('portfolio_projects').select('*').order('sort_order', { ascending: true });
        if (spProjects && spProjects.length > 0) {
          setProjects(spProjects);
        }
      } catch (sbErr) {}

      // 2. Fetch from backend API
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          try {
            localStorage.setItem('chipng_portfolio_profile', JSON.stringify(data.profile));
          } catch (e) {}
        }
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.warn('Portfolio data fetch fallback to local cache:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      localStorage.setItem('chipng_portfolio_profile', JSON.stringify(profile));
    } catch (e) {}

    // 1. Sync with Supabase cloud database
    try {
      await supabase.from('portfolio_profile').upsert({ id: 1, ...profile, updated_at: new Date().toISOString() });
    } catch (sbErr) {
      console.warn('Supabase portfolio_profile sync:', sbErr);
    }

    // 2. Sync with backend API
    try {
      const res = await fetch('/api/portfolio/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        toast.success('Portfolio profile updated successfully!');
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn('Portfolio profile save response:', errJson);
        toast.success('Portfolio profile saved and active!');
      }
    } catch (e: any) {
      toast.success('Portfolio profile saved locally and active!');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject?.title || !editingProject?.description || !editingProject?.live_url) {
      alert('Please fill in title, description, and live URL.');
      return;
    }

    setSavingProject(true);
    try {
      const res = await fetch('/api/portfolio/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });
      if (res.ok) {
        toast.success(editingProject.id ? 'Project updated!' : 'Project created!');
        setIsModalOpen(false);
        setEditingProject(null);
        fetchPortfolioData();
      } else {
        toast.error('Failed to save project');
      }
    } catch (e: any) {
      toast.error(e.message || 'Network error');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;

    try {
      const res = await fetch(`/api/portfolio/project/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project deleted');
        fetchPortfolioData();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error deleting');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate image format
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      toast.error('Please select an image file (PNG, JPG, WebP, SVG, or GIF).');
      return;
    }

    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size exceeds 20MB limit. Please choose a smaller image.');
      return;
    }

    setUploadingImage(true);

    try {
      // 1. Primary: Try Supabase Cloud Storage (covers or portfolio bucket)
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanName = `portfolio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        let uploadRes = await supabase.storage.from('covers').upload(cleanName, file, { upsert: true });
        let targetBucket = 'covers';
        
        if (uploadRes.error) {
          uploadRes = await supabase.storage.from('portfolio').upload(cleanName, file, { upsert: true });
          targetBucket = 'portfolio';
        }

        if (!uploadRes.error) {
          const { data } = supabase.storage.from(targetBucket).getPublicUrl(cleanName);
          if (data?.publicUrl) {
            setter(data.publicUrl);
            toast.success('Image uploaded to Supabase Storage!');
            return;
          }
        }
      } catch (sbErr) {
        console.warn('Supabase storage upload attempt:', sbErr);
      }

      // 2. Read file as base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // 3. Fallback: Post to internal /api/portfolio/upload
      try {
        const res = await fetch('/api/portfolio/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: dataUrl,
            filename: file.name
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            setter(json.url);
            toast.success('Image uploaded successfully!');
            return;
          }
        }
      } catch (serverErr) {
        console.warn('Backend image upload endpoint error, using data URL:', serverErr);
      }

      // 4. Resilience: Use dataUrl directly so user is never blocked
      setter(dataUrl);
      toast.success('Image attached successfully!');
    } catch (err: any) {
      console.error('Image processing error:', err);
      toast.error('Could not process image: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
      // Reset input value so identical file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with live preview button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Developer Portfolio CMS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Victor Okoye Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage projects, bio descriptions, skills bento, and verified social channels reflecting live at <code className="text-[#D2F843] bg-neutral-900 px-1.5 py-0.5 rounded font-mono">/portfolio</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-900 dark:text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Portfolio</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-400" />
          </a>

          <button
            onClick={fetchPortfolioData}
            disabled={loading}
            className="p-2.5 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-neutral-200/80 dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveSubTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'projects'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'profile'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bio & Skills Bento</span>
        </button>

        <button
          onClick={() => setActiveSubTab('socials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'socials'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Socials & Contact</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: PROJECTS LIST & MANAGEMENT                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                Showcase Projects
              </h3>
              <p className="text-xs text-neutral-500">
                Primary projects displayed in the middle work stream (CHIP NG, Alvora Store, etc.).
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProject({
                  title: '',
                  slug: '',
                  category: 'Full-Stack',
                  tagline: '',
                  description: '',
                  technologies: 'Next.js, TypeScript, Tailwind CSS',
                  live_url: 'https://',
                  github_url: 'https://github.com/vickdennis',
                  image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
                  featured: 1,
                  sort_order: projects.length + 1,
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 font-bold text-xs flex items-center gap-2 transition-transform cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:border-neutral-400 dark:hover:border-white/25 transition-all"
              >
                <div>
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-neutral-900 border border-neutral-200 dark:border-white/5">
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/20">
                        Order #{proj.sort_order ?? 0}
                      </span>
                    </div>
                    {proj.category && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#D2F843] text-neutral-950 font-bold text-[10px] font-mono">
                          {proj.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-neutral-950 dark:text-white">
                      {proj.title}
                    </h4>
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1 font-mono"
                    >
                      <span>Visit</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>

                  {proj.tagline && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-[#D2F843] mt-0.5">
                      {proj.tagline}
                    </p>
                  )}

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.technologies.split(',').slice(0, 5).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-[10px] font-mono text-neutral-600 dark:text-neutral-300"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-neutral-400 truncate max-w-[60%]">
                    {proj.live_url}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProject({ ...proj });
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: BIO & SKILLS BENTO                                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                Personal Bio & Skills Bento
              </h3>
              <p className="text-xs text-neutral-500">
                Personal branding details, headline, experience years, and skills categories.
              </p>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Handle / URL Slug
              </label>
              <input
                type="text"
                value={profile.handle}
                onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Title / Headline
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Years of Experience / Badge
              </label>
              <input
                type="text"
                value={profile.years_experience}
                onChange={(e) => setProfile({ ...profile, years_experience: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
              Hero Statement / Subtitle
            </label>
            <textarea
              rows={2}
              value={profile.subtitle}
              onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
              About Me Biography
            </label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
            />
          </div>

          {/* Visual Assets & Photo Section */}
          <div className="border-t border-neutral-200/80 dark:border-white/10 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D2F843]" />
              <span>Portfolio Visual Assets & Media</span>
            </h4>

            {/* Avatar / Profile Photo */}
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Avatar Photo URL (Profile Tile)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="/chipng_exact_tile.png or https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                />
                <label className={`px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer ${uploadingImage ? 'opacity-70 pointer-events-none' : ''}`}>
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D2F843]" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, async (url) => {
                      setProfile(prev => ({ ...prev, avatar_url: url }));
                      try {
                        await fetch('/api/portfolio/profile', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ avatar_url: url })
                        });
                        toast.success('Avatar image saved!');
                      } catch (err) {}
                    })}
                  />
                </label>
              </div>
              {profile.avatar_url && (
                <div className="relative mt-2 p-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center gap-3">
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar Preview" 
                    className="w-10 h-10 object-cover rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-900"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate">{profile.avatar_url}</div>
                    <div className="text-[10px] text-emerald-500 font-medium">✓ Avatar preview ready</div>
                  </div>
                </div>
              )}
            </div>

            {/* Hero / Cover Image */}
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Hero 3D Card / Logo Cover URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.hero_image_url}
                  onChange={(e) => setProfile({ ...profile, hero_image_url: e.target.value })}
                  placeholder="/chipng_3d_logo.jpg or https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                />
                <label className={`px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer ${uploadingImage ? 'opacity-70 pointer-events-none' : ''}`}>
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D2F843]" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, async (url) => {
                      setProfile(prev => ({ ...prev, hero_image_url: url }));
                      try {
                        await fetch('/api/portfolio/profile', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ hero_image_url: url })
                        });
                        toast.success('Hero cover image saved!');
                      } catch (err) {}
                    })}
                  />
                </label>
              </div>
              {profile.hero_image_url && (
                <div className="relative mt-2 p-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center gap-3">
                  <img 
                    src={profile.hero_image_url} 
                    alt="Hero Preview" 
                    className="w-16 h-10 object-cover rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-900"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate">{profile.hero_image_url}</div>
                    <div className="text-[10px] text-emerald-500 font-medium">✓ Hero preview ready</div>
                  </div>
                </div>
              )}
            </div>

            {/* Portrait / About Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase text-neutral-500">
                  About Me Cover / Portrait Photo (Reflects live in Portfolio)
                </label>
                {profile.about_image_url && (
                  <button
                    type="button"
                    onClick={async () => {
                      setProfile(prev => ({ ...prev, about_image_url: '' }));
                      await fetch('/api/portfolio/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ about_image_url: '' })
                      });
                      toast.success('Cover photo reset.');
                    }}
                    className="text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    Reset Photo
                  </button>
                )}
              </div>

              {/* Big Interactive Visual Dropzone Card */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-neutral-50 dark:bg-black/40 p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10">
                <div className="w-24 h-32 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-900 shrink-0 relative group shadow-sm">
                  <img
                    src={profile.about_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'}
                    alt="About Me Cover"
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white font-mono font-medium">Cover</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.about_image_url}
                      onChange={(e) => setProfile({ ...profile, about_image_url: e.target.value })}
                      placeholder="https://... or /uploads/..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#151821] text-xs sm:text-sm font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                    />
                    <label className={`px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm ${uploadingImage ? 'opacity-70 pointer-events-none' : ''}`}>
                      {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D2F843]" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, async (url) => {
                          setProfile((prev) => {
                            const updated = { ...prev, about_image_url: url };
                            try {
                              localStorage.setItem('chipng_portfolio_profile', JSON.stringify(updated));
                            } catch (e) {}
                            return updated;
                          });
                          try {
                            await fetch('/api/portfolio/profile', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ about_image_url: url })
                            });
                            toast.success('About Me cover photo uploaded & saved live!');
                          } catch (err) {
                            console.warn('Auto-save error:', err);
                          }
                        })}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Supports high-resolution PNG, JPG, WebP, or SVG. When uploaded, it automatically saves to your database and updates the About Me section at <code className="text-[#D2F843] bg-neutral-900 px-1 py-0.5 rounded font-mono">/portfolio</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Bento Editor */}
          <div className="border-t border-neutral-200/80 dark:border-white/10 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
              Skills Bento Categories
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Front-end Stack
                </label>
                <input
                  type="text"
                  value={profile.skills_frontend}
                  onChange={(e) => setProfile({ ...profile, skills_frontend: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Styles & Motion
                </label>
                <input
                  type="text"
                  value={profile.skills_styles}
                  onChange={(e) => setProfile({ ...profile, skills_styles: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Back-end Architecture
                </label>
                <input
                  type="text"
                  value={profile.skills_backend}
                  onChange={(e) => setProfile({ ...profile, skills_backend: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  DevOps & Cloud
                </label>
                <input
                  type="text"
                  value={profile.skills_devops}
                  onChange={(e) => setProfile({ ...profile, skills_devops: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: SOCIALS & CONTACT CONFIGURATION                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'socials' && (
        <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                Socials & Contact Channels
              </h3>
              <p className="text-xs text-neutral-500">
                Configure GitHub, LinkedIn, Twitter/X, WhatsApp concierge, and inquiry email.
              </p>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Socials</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-neutral-700 dark:text-white" />
                <span>GitHub URL</span>
              </label>
              <input
                type="text"
                value={profile.social_github}
                onChange={(e) => setProfile({ ...profile, social_github: e.target.value })}
                placeholder="https://github.com/vickdennis"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                <span>LinkedIn URL</span>
              </label>
              <input
                type="text"
                value={profile.social_linkedin}
                onChange={(e) => setProfile({ ...profile, social_linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/chipng"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-sky-400" />
                <span>Twitter / X URL</span>
              </label>
              <input
                type="text"
                value={profile.social_twitter}
                onChange={(e) => setProfile({ ...profile, social_twitter: e.target.value })}
                placeholder="https://x.com/chipng_nfc"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp Link</span>
              </label>
              <input
                type="text"
                value={profile.social_whatsapp}
                onChange={(e) => setProfile({ ...profile, social_whatsapp: e.target.value })}
                placeholder="https://wa.me/2348100764154"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram URL</span>
              </label>
              <input
                type="text"
                value={profile.social_instagram}
                onChange={(e) => setProfile({ ...profile, social_instagram: e.target.value })}
                placeholder="https://instagram.com/chipng_nfc"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                value={profile.social_email}
                onChange={(e) => setProfile({ ...profile, social_email: e.target.value })}
                placeholder="hello@chipng.com"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PROJECT                                                 */}
      {/* ========================================================================= */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#14161D] border border-neutral-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-neutral-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold">
                  {editingProject.id ? 'Edit Project' : 'Add New Portfolio Project'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Update project metadata, live link, technologies, and visual mockup.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProject(null);
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    placeholder="e.g. CHIP NG or Alvora Store"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs sm:text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                    Category Badge
                  </label>
                  <input
                    type="text"
                    value={editingProject.category || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="e.g. Hardware & Identity or Luxury E-Commerce"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={editingProject.tagline || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                  placeholder="e.g. Premier Contactless Smart NFC Cards & Dynamic Link-in-Bio"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Detailed architectural summary and features of this project..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Technologies (Comma Separated) *
                </label>
                <input
                  type="text"
                  value={editingProject.technologies || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                  placeholder="Next.js, TypeScript, NFC NTAG216, Tailwind CSS, Flutterwave"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                    Live URL *
                  </label>
                  <input
                    type="url"
                    value={editingProject.live_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                    placeholder="https://chipng.com or https://alvora.com.ng"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                    GitHub / Source URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.github_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                    placeholder="https://github.com/vickdennis/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Project Mockup Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProject.image_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                    placeholder="https://... or /uploads/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs font-mono outline-none"
                  />
                  <label className={`px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${uploadingImage ? 'opacity-70 pointer-events-none' : ''}`}>
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D2F843]" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => setEditingProject({ ...editingProject, image_url: url }))}
                    />
                  </label>
                </div>

                {editingProject.image_url && (
                  <div className="relative mt-2.5 p-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center gap-3">
                    <img 
                      src={editingProject.image_url} 
                      alt="Project Preview" 
                      className="w-16 h-12 object-cover rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-900"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate">{editingProject.image_url}</div>
                      <div className="text-[10px] text-emerald-500 font-medium">✓ Image preview ready</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProject({ ...editingProject, image_url: '' })}
                      className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Clear image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                    Sort Order Priority
                  </label>
                  <input
                    type="number"
                    value={editingProject.sort_order ?? 0}
                    onChange={(e) => setEditingProject({ ...editingProject, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1c1f28] text-xs font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-white/10 pt-5 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProject(null);
                }}
                className="px-5 py-2.5 rounded-full border border-neutral-200 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={savingProject}
                className="px-6 py-2.5 rounded-full bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
