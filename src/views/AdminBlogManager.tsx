import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Plus, Edit2, Trash2, Globe, Eye, Settings, Image as ImageIcon,
  Save, ArrowLeft, ChevronDown, ChevronUp, Zap, FileText,
  Search, Check, AlertCircle, RefreshCw, X, Tag, User, Clock,
  Upload, Sparkles
} from 'lucide-react';
import TiptapEditor from '../components/TiptapEditor';
import BlogPreviewModal from '../components/blog/BlogPreviewModal';
import { extractCleanExcerpt, calculateReadingTime } from '../utils/sanitizeHtml';

interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  keywords?: string[];
  is_published: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  author?: string;
  category?: string;
  views?: number;
}

const CATEGORIES = [
  'NFC Technology',
  'Real Estate',
  'Business & Sales',
  'Networking & Growth',
  'Technology & Hardware',
  'Marketing',
  'How-To Guides',
  'Entrepreneurship'
];

interface AdminBlogManagerProps {
  initialEditSlug?: string;
}

export default function AdminBlogManager({ initialEditSlug }: AdminBlogManagerProps = {}) {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'drafts'>('all');

  // Form State
  const [editingPost, setEditingPost] = useState<BlogPostRecord | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image_url: string;
    meta_title: string;
    meta_description: string;
    focus_keyword: string;
    keywords: string[];
    author: string;
    category: string;
    is_published: boolean;
  }>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    keywords: ['NFC', 'Smart Card', 'Nigeria'],
    author: 'CHIP NG Editorial',
    category: 'NFC Technology',
    is_published: false,
  });

  const [tagsInput, setTagsInput] = useState('NFC, Smart Card, Nigeria');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savingPost, setSavingPost] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Preview Modal
  const [previewPostData, setPreviewPostData] = useState<any>(null);

  // Delete Confirmation Modal
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<BlogPostRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // In-app Notification / Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Discard & Resume Modals
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [resumeDraftPrompt, setResumeDraftPrompt] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (initialEditSlug && posts.length > 0 && !editingPost) {
      const match = posts.find(p => p.slug === initialEditSlug);
      if (match) {
        startEdit(match);
      }
    }
  }, [initialEditSlug, posts, editingPost]);

  // Autosave Draft in browser storage every 15 seconds if editing
  useEffect(() => {
    if ((creatingPost || editingPost) && postForm.title) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem('chipng_blog_autosave', JSON.stringify({
            form: postForm,
            timestamp: new Date().toLocaleTimeString(),
          }));
          setSaveStatus(`Draft autosaved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        } catch (e) {}
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [postForm, creatingPost, editingPost]);

  const fetchPosts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 1. Try backend robust API first
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const apiPosts = await res.json();
          if (Array.isArray(apiPosts) && apiPosts.length > 0) {
            setPosts(apiPosts);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      // 2. Fallback to Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data as BlogPostRecord[]);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const newSlug = creatingPost && (!postForm.slug || postForm.slug === generateSlug(postForm.title))
      ? generateSlug(title)
      : postForm.slug;
    
    setPostForm({
      ...postForm,
      title,
      slug: newSlug,
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setPostForm({ ...postForm, slug });
    
    // Check uniqueness safely against other posts
    const exists = posts.some(p => p.slug === slug && p.id !== editingPost?.id && p.slug !== editingPost?.slug);
    if (exists) {
      setSlugError('This slug is already used by another article.');
    } else {
      setSlugError(null);
    }
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit. Please compress first.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `blog/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      let bucket = 'blog';
      let uploadRes = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (uploadRes.error) {
        bucket = 'covers';
        uploadRes = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      }

      if (uploadRes.error) throw uploadRes.error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setPostForm({ ...postForm, cover_image_url: data.publicUrl });
      showToast('Cover image uploaded successfully.', 'success');
    } catch (error: any) {
      showToast('Error uploading cover image: ' + error.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateExcerpt = () => {
    const clean = extractCleanExcerpt(postForm.content || '', 160);
    if (!clean) {
      showToast('Write some article content first to extract an excerpt.', 'info');
      return;
    }
    setPostForm({ ...postForm, excerpt: clean });
    showToast('Excerpt extracted from content.', 'success');
  };

  const savePost = async (publish: boolean) => {
    const cleanTitle = (postForm.title || '').trim();
    if (!cleanTitle) {
      showToast('Please enter an article title.', 'error');
      return;
    }

    const slug = (postForm.slug || '').trim() || generateSlug(cleanTitle);
    if (!slug) {
      showToast('Please provide a URL slug.', 'error');
      return;
    }

    // Slug uniqueness validation
    const duplicate = posts.find(p => p.slug === slug && p.id !== editingPost?.id && p.slug !== editingPost?.slug);
    if (duplicate) {
      showToast(`The slug "/blog/${slug}" is already in use by "${duplicate.title}". Please choose a unique slug.`, 'error');
      return;
    }

    setSavingPost(true);
    try {
      const tagsArray = (tagsInput || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const finalExcerpt = (postForm.excerpt || '').trim() || extractCleanExcerpt(postForm.content || '', 160);

      const payload = {
        id: editingPost?.id,
        old_slug: editingPost?.slug,
        title: cleanTitle,
        slug,
        content: postForm.content || '',
        excerpt: finalExcerpt,
        cover_image_url: postForm.cover_image_url || '',
        meta_title: (postForm.meta_title || '').trim() || cleanTitle,
        meta_description: (postForm.meta_description || '').trim() || finalExcerpt,
        keywords: tagsArray.length > 0 ? tagsArray : [postForm.category || 'NFC Technology'],
        is_published: publish,
        published_at: publish ? (editingPost?.published_at || new Date().toISOString()) : (editingPost?.is_published ? editingPost.published_at : null),
        updated_at: new Date().toISOString(),
        author: (postForm.author || '').trim() || 'CHIP NG Editorial',
        category: postForm.category || 'NFC Technology',
        focus_keyword: (postForm.focus_keyword || '').trim(),
      };

      // 1. Save via backend API
      const apiRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save article on server.');
      }

      // 2. Also attempt Supabase insert/update if authenticated
      try {
        const supabasePayload: any = {
          title: cleanTitle,
          slug,
          content: postForm.content || '',
          excerpt: finalExcerpt,
          cover_image_url: postForm.cover_image_url || '',
          meta_title: (postForm.meta_title || '').trim() || cleanTitle,
          meta_description: (postForm.meta_description || '').trim() || finalExcerpt,
          keywords: tagsArray.length > 0 ? tagsArray : (postForm.category ? [postForm.category] : null),
          is_published: publish,
          published_at: publish ? (editingPost?.published_at || new Date().toISOString()) : (editingPost?.is_published ? editingPost.published_at : null),
          updated_at: new Date().toISOString(),
        };

        if (editingPost?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingPost.id)) {
          supabasePayload.id = editingPost.id;
          await supabase.from('posts').update(supabasePayload).eq('id', editingPost.id);
        } else {
          await supabase.from('posts').upsert([supabasePayload], { onConflict: 'slug' });
        }

        // Clean up old slug in Supabase if renamed
        if (editingPost?.slug && editingPost.slug !== slug) {
          try {
            await supabase.from('posts').delete().eq('slug', editingPost.slug);
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Supabase post sync warning:', e);
      }

      localStorage.removeItem('chipng_blog_autosave');
      showToast(publish ? (editingPost ? 'Article updated successfully!' : 'Article published successfully!') : 'Draft saved successfully!', 'success');
      setCreatingPost(false);
      setEditingPost(null);
      await fetchPosts();
    } catch (err: any) {
      showToast('Error saving article: ' + err.message, 'error');
    } finally {
      setSavingPost(false);
    }
  };

  const togglePublishStatus = async (post: BlogPostRecord) => {
    const nextStatus = !post.is_published;
    try {
      const updated = {
        ...post,
        is_published: nextStatus,
        published_at: nextStatus ? (post.published_at || new Date().toISOString()) : post.published_at,
        updated_at: new Date().toISOString(),
      };

      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      try {
        await supabase
          .from('posts')
          .update({
            is_published: nextStatus,
            published_at: updated.published_at,
            updated_at: updated.updated_at,
          })
          .eq('id', post.id);
      } catch (e) {}

      fetchPosts();
      showToast(nextStatus ? 'Article published.' : 'Article changed to draft.', 'success');
    } catch (e: any) {
      showToast('Error updating status: ' + e.message, 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!deleteConfirmPost) return;
    setDeletingId(deleteConfirmPost.id);
    try {
      await fetch(`/api/posts/${deleteConfirmPost.id}`, { method: 'DELETE' });

      try {
        await supabase.from('posts').delete().eq('id', deleteConfirmPost.id);
      } catch (e) {}

      setDeleteConfirmPost(null);
      showToast('Article deleted successfully.', 'success');
      fetchPosts();
    } catch (e: any) {
      showToast('Error deleting post: ' + e.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const startCreate = () => {
    // Check autosave
    const autosaved = localStorage.getItem('chipng_blog_autosave');
    if (autosaved) {
      try {
        const parsed = JSON.parse(autosaved);
        if (parsed?.form?.title) {
          setResumeDraftPrompt(parsed);
          return;
        }
      } catch (e) {}
    }

    setPostForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      cover_image_url: '',
      meta_title: '',
      meta_description: '',
      focus_keyword: '',
      keywords: ['NFC', 'Smart Card', 'Nigeria'],
      author: 'CHIP NG Editorial',
      category: 'NFC Technology',
      is_published: false,
    });
    setTagsInput('NFC, Smart Card, Nigeria');
    setSlugError(null);
    setCreatingPost(true);
    setEditingPost(null);
  };

  const startEdit = (post: BlogPostRecord) => {
    setEditingPost(post);
    setCreatingPost(false);
    setPostForm({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      cover_image_url: post.cover_image_url || '',
      meta_title: post.meta_title || post.title || '',
      meta_description: post.meta_description || post.excerpt || '',
      focus_keyword: post.focus_keyword || '',
      keywords: post.keywords || ['NFC'],
      author: post.author || 'CHIP NG Editorial',
      category: post.category || 'NFC Technology',
      is_published: post.is_published,
    });
    setTagsInput((post.keywords || ['NFC']).join(', '));
    setSlugError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter posts based on search query and status tab
  const filteredPosts = posts.filter(post => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      post.title.toLowerCase().includes(q) ||
      post.slug.toLowerCase().includes(q) ||
      (post.category && post.category.toLowerCase().includes(q)) ||
      (post.keywords && post.keywords.some(k => k.toLowerCase().includes(q)))
    );

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.is_published) ||
      (statusFilter === 'drafts' && !post.is_published);

    return matchesSearch && matchesStatus;
  });

  // Editor View (Create or Edit)
  if (creatingPost || editingPost) {
    return (
      <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 animate-in fade-in">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (postForm.title.trim()) {
                  setConfirmDiscard(true);
                } else {
                  setCreatingPost(false);
                  setEditingPost(null);
                }
              }}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </button>
            {saveStatus && (
              <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                · {saveStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPreviewPostData(postForm)}
              className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              disabled={savingPost}
              onClick={() => savePost(false)}
              className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={savingPost}
              onClick={() => savePost(true)}
              className="px-5 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingPost && editingPost.is_published ? 'Update Article' : 'Publish Now'}</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Why Lagos Realtors Need NFC Business Cards in 2026"
              value={postForm.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-lg sm:text-xl font-bold text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-4 py-2.5 bg-neutral-100 dark:bg-[#151821] border border-r-0 border-neutral-200/80 dark:border-white/10 rounded-l-2xl text-xs font-mono text-neutral-400">
                https://chipng.com/blog/
              </span>
              <input
                type="text"
                required
                value={postForm.slug}
                onChange={handleSlugChange}
                className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-r-2xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>
            {slugError && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {slugError}
              </p>
            )}
          </div>

          {/* Category, Author, and Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Category
              </label>
              <select
                value={postForm.category}
                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={postForm.author}
                onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                placeholder="CHIP NG Editorial"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="NFC, Lagos, Realtor, Networking"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
            </div>
          </div>

          {/* Featured Header Cover Image */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Featured Header Cover Image
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {postForm.cover_image_url ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-video w-44 bg-neutral-900 border border-neutral-200/80 dark:border-white/10">
                  <img
                    src={postForm.cover_image_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPostForm({ ...postForm, cover_image_url: '' })}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                    title="Remove Cover Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video w-44 rounded-2xl bg-neutral-100 dark:bg-[#151821] border border-dashed border-neutral-200/80 dark:border-white/10 flex flex-col items-center justify-center text-neutral-400">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-mono">No cover image</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 font-semibold text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Cover Image'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleHeaderImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                <div className="text-[11px] text-neutral-400">
                  Recommended size: 1200 × 630px. PNG, JPG or WEBP.
                </div>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Article Excerpt
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateExcerpt}
                  className="text-xs text-[#6b8500] dark:text-[#D2F843] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Auto-extract from content
                </button>
                <span className={`text-[11px] font-mono ${postForm.excerpt.length > 160 ? 'text-amber-500' : 'text-neutral-400'}`}>
                  {postForm.excerpt.length}/160
                </span>
              </div>
            </div>
            <textarea
              rows={3}
              value={postForm.excerpt}
              onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
              placeholder="A short, compelling summary of this article shown on cards and in search results..."
              className="w-full p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] leading-relaxed resize-y"
            />
          </div>

          {/* Full Article Content with TiptapEditor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Article Content <span className="text-rose-500">*</span>
            </label>
            <TiptapEditor
              content={postForm.content}
              onChange={(html) => setPostForm({ ...postForm, content: html })}
            />
          </div>

          {/* SEO & Meta Drawer */}
          <div className="border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-[#151821]/50">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full p-4 flex justify-between items-center hover:bg-neutral-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <h3 className="font-bold text-sm flex items-center gap-2 text-neutral-950 dark:text-white">
                <Settings className="w-4 h-4 text-[#84A900] dark:text-[#D2F843]" />
                <span>SEO, Google Snippet & OpenGraph Meta</span>
              </h3>
              {showSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSeo && (
              <div className="p-5 sm:p-6 space-y-5 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318]">
                {/* Google Search Preview */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 font-sans">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    Google Search Result Snippet Preview
                  </span>
                  <div className="text-xs text-[#202124] dark:text-neutral-400 font-mono">
                    https://chipng.com › blog › {postForm.slug || 'article-slug'}
                  </div>
                  <div className="text-base text-[#1a0dab] dark:text-[#8ab4f8] font-medium line-clamp-1">
                    {postForm.meta_title || postForm.title || 'CHIP NG Article Title'}
                  </div>
                  <div className="text-xs text-[#4d5156] dark:text-neutral-300 line-clamp-2 leading-relaxed">
                    {postForm.meta_description || postForm.excerpt || 'Article summary description appearing in Google search results.'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    SEO Meta Title (Recommended: 50-60 characters)
                  </label>
                  <input
                    type="text"
                    value={postForm.meta_title}
                    onChange={(e) => setPostForm({ ...postForm, meta_title: e.target.value })}
                    placeholder={postForm.title || 'Page title in Google tabs'}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    SEO Meta Description (Recommended: 120-160 characters)
                  </label>
                  <textarea
                    rows={2}
                    value={postForm.meta_description}
                    onChange={(e) => setPostForm({ ...postForm, meta_description: e.target.value })}
                    placeholder={postForm.excerpt || 'Search engine summary description'}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Focus Target Keyword
                  </label>
                  <input
                    type="text"
                    value={postForm.focus_keyword}
                    onChange={(e) => setPostForm({ ...postForm, focus_keyword: e.target.value })}
                    placeholder="e.g. NFC business card Lagos"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Modal */}
        <BlogPreviewModal
          isOpen={!!previewPostData}
          onClose={() => setPreviewPostData(null)}
          post={previewPostData || postForm}
        />

        {/* Confirm Discard Modal */}
        {confirmDiscard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#12141A] w-full max-w-sm rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
              <h3 className="text-base font-bold text-center">Discard unsaved changes?</h3>
              <p className="text-xs text-neutral-500 text-center">
                Any modifications made to this article will be lost unless you save a draft.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDiscard(false)}
                  className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDiscard(false);
                    setCreatingPost(false);
                    setEditingPost(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-app Toast Banner */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-neutral-950 text-white border-neutral-800 dark:bg-white dark:text-neutral-950'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-neutral-900 text-neutral-100 border-neutral-700'
            }`}>
              {toast.type === 'success' && <Check className="w-4 h-4 text-[#D2F843] dark:text-[#6a8700]" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
              {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#D2F843]" />}
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-2 text-neutral-400 hover:text-white dark:hover:text-neutral-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Articles Directory / Manager View
  return (
    <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 animate-in fade-in">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Content Engine & SEO
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Blog & Editorial Manager
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Publish educational articles, real estate playbooks, and hardware guides to drive organic search traffic.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Blog Post</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            {posts.length}
          </div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
            Total Articles
          </div>
        </div>

        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {posts.filter(p => p.is_published).length}
          </div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
            Published
          </div>
        </div>

        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">
            {posts.filter(p => !p.is_published).length}
          </div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
            Drafts
          </div>
        </div>

        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#596e00] dark:text-[#D2F843] tracking-tight">
            {posts.reduce((sum, p) => sum + (p.views || 0), 0)}
          </div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
            Total Readers
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, slug, category, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-[#151821] text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-white dark:bg-[#151821] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Published ({posts.filter(p => p.is_published).length})
          </button>
          <button
            onClick={() => setStatusFilter('drafts')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'drafts'
                ? 'bg-white dark:bg-[#151821] text-amber-500 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Drafts ({posts.filter(p => !p.is_published).length})
          </button>
        </div>
      </div>

      {/* Posts Table / Cards */}
      {loading ? (
        <div className="py-16 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading articles...</span>
        </div>
      ) : fetchError ? (
        <div className="py-12 text-center text-neutral-500 text-xs space-y-3">
          <p>{fetchError}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 text-xs border border-dashed border-neutral-200/80 dark:border-white/10 rounded-2xl space-y-3">
          <p>
            {searchQuery
              ? `No articles found matching "${searchQuery}".`
              : 'No blog posts found. Create your first article to boost organic SEO search ranking.'}
          </p>
          <button
            onClick={startCreate}
            className="px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Post</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Published Date</th>
                <th className="py-3.5 px-4 text-center">Views</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/chipng_3d_logo.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-950 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                          {post.title}
                        </div>
                        <div className="text-xs text-neutral-400 font-mono truncate max-w-xs sm:max-w-md">
                          /blog/{post.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublishStatus(post)}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors cursor-pointer ${
                        post.is_published
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {post.is_published ? '● PUBLISHED' : '○ DRAFT'}
                    </button>
                  </td>

                  <td className="py-4 px-4 text-xs font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                    {post.category || post.keywords?.[0] || 'NFC Technology'}
                  </td>

                  <td className="py-4 px-4 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Not published'}
                  </td>

                  <td className="py-4 px-4 text-xs font-mono font-semibold text-center text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {post.views || 0}
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Live Preview Button */}
                      <button
                        onClick={() => setPreviewPostData(post)}
                        className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        title="Preview Article"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* View live public page if published */}
                      {post.is_published && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 transition-colors"
                          title="Open Live Public URL"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => startEdit(post)}
                        className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmPost(post)}
                        className="p-2 rounded-full border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#12141A] w-full max-w-md rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold">Delete this article?</h3>
              <p className="text-xs text-neutral-500">
                Are you sure you want to permanently delete:
              </p>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white italic">
                "{deleteConfirmPost.title}"
              </p>
              <p className="text-[11px] text-neutral-400 mt-2">
                This action cannot be undone. Public links to /blog/{deleteConfirmPost.slug} will return 404.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPost(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmPost.id}
                onClick={handleDeletePost}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingId === deleteConfirmPost.id ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <BlogPreviewModal
        isOpen={!!previewPostData}
        onClose={() => setPreviewPostData(null)}
        post={previewPostData || {}}
      />

      {/* Resume Autosaved Draft Modal */}
      {resumeDraftPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#12141A] w-full max-w-sm rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold">Resume Autosaved Draft?</h3>
              <p className="text-xs text-neutral-500">
                Found an unsaved draft from {resumeDraftPrompt.timestamp}:
              </p>
              <p className="text-xs font-semibold italic text-neutral-900 dark:text-white line-clamp-1">
                "{resumeDraftPrompt.form.title}"
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('chipng_blog_autosave');
                  setResumeDraftPrompt(null);
                  setCreatingPost(true);
                }}
                className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Start Fresh
              </button>
              <button
                type="button"
                onClick={() => {
                  setPostForm(resumeDraftPrompt.form);
                  setTagsInput((resumeDraftPrompt.form.keywords || []).join(', '));
                  setResumeDraftPrompt(null);
                  setCreatingPost(true);
                }}
                className="flex-1 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-neutral-950 text-white border-neutral-800 dark:bg-white dark:text-neutral-950'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-neutral-900 text-neutral-100 border-neutral-700'
          }`}>
            {toast.type === 'success' && <Check className="w-4 h-4 text-[#D2F843] dark:text-[#6a8700]" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#D2F843]" />}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-neutral-400 hover:text-white dark:hover:text-neutral-900 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
