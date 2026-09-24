import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit2, Trash2, Globe, Eye, Settings, Image as ImageIcon, Save, ArrowLeft, ChevronDown, ChevronUp, Zap, FileText } from 'lucide-react';
import TiptapEditor from '../components/TiptapEditor';

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState({ 
    title: '', slug: '', content: '', excerpt: '', cover_image_url: '', 
    meta_title: '', meta_description: '', focus_keyword: '', 
    is_published: false, faq_json: '', product_json: '' 
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('Realtor');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-save drafts
  useEffect(() => {
    if ((creatingPost || editingPost) && !postForm.is_published && postForm.title) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [postForm, creatingPost, editingPost]);

  const saveDraft = () => {
    localStorage.setItem('blog_draft', JSON.stringify(postForm));
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) {
      try {
        const metaRes = await fetch('/api/post-meta');
        const meta = await metaRes.json();
        const merged = data.map(p => {
          const m = meta.find((m: any) => m.post_slug === p.slug);
          return m ? { ...p, views: m.views || 0, product_json: m.product_json, faq_json: m.faq_json, focus_keyword: m.focus_keyword } : { ...p, views: 0 };
        });
        setPosts(merged);
      } catch (e) {
        setPosts(data);
      }
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `blog/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      setPostForm({ ...postForm, cover_image_url: data.publicUrl });
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setPostForm({ 
      ...postForm, 
      title, 
      slug: creatingPost && !postForm.slug ? generateSlug(title) : postForm.slug 
    });
  };

  const savePost = async (publish: boolean) => {
    try {
      let finalContent = postForm.content;
      try {
        const linkRes = await fetch('/api/seo/auto-link', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({ content: postForm.content, post_slug: postForm.slug || 'draft' })
        });
        if (linkRes.ok) {
           const { content } = await linkRes.json();
           if (content) finalContent = content;
        }
      } catch (e) { console.error("Auto-link error", e); }
      
      const faqStr = faqs.length > 0 ? JSON.stringify(faqs) : '';
      const { focus_keyword, product_json, faq_json, ...restForm } = postForm;
      const finalForm = { ...restForm, content: finalContent, is_published: publish, published_at: publish ? new Date().toISOString() : null };
      
      if (creatingPost) {
        const { error } = await supabase.from('posts').insert([finalForm]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').update(finalForm).eq('id', editingPost.id);
        if (error) throw error;
      }
      
      if (selectedProductId !== null) {
         await fetch('/api/post-product', {
           method: 'POST',
           headers: {'Content-Type':'application/json'},
           body: JSON.stringify({ post_slug: finalForm.slug, product_id: selectedProductId })
         });
      }
      
      await fetch('/api/post-meta', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ post_slug: finalForm.slug, product_json: showProduct ? postForm.product_json : null, faq_json: faqStr, focus_keyword: postForm.focus_keyword })
      });
      
      await fetch('/api/post-categories', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ post_slug: finalForm.slug, category })
      });

      alert(publish ? 'Post published successfully!' : 'Draft saved!');
      setCreatingPost(false);
      setEditingPost(null);
      fetchPosts();
      localStorage.removeItem('blog_draft');
    } catch (e: any) {
      alert('Error saving post: ' + e.message);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (e: any) {
      alert('Error deleting post: ' + e.message);
    }
  };

  if (creatingPost || editingPost) {
    return (
      <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-white/10 mb-6">
          <button 
            onClick={() => { setCreatingPost(false); setEditingPost(null); }}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Article List
          </button>
          
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => savePost(false)}
              className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 font-semibold text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button 
              onClick={() => savePost(true)}
              className="px-5 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              Publish Now
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Article Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-lg font-bold text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              placeholder="e.g. Why Nigerian Realtors Need NFC Business Cards in 2025"
              value={postForm.title}
              onChange={handleTitleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">URL Slug</label>
            <div className="flex items-center">
              <span className="px-4 py-2.5 bg-neutral-100 dark:bg-[#151821] border border-r-0 border-neutral-200/80 dark:border-white/10 rounded-l-2xl text-xs font-mono text-neutral-400">/blog/</span>
              <input 
                type="text" 
                className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-r-2xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                value={postForm.slug}
                onChange={(e) => setPostForm({...postForm, slug: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Header Cover Image</label>
            <div className="flex items-center gap-4">
              {postForm.cover_image_url ? (
                <img src={postForm.cover_image_url} alt="Cover" className="w-32 h-20 object-cover rounded-2xl border border-neutral-200/80 dark:border-white/10" />
              ) : (
                <div className="w-32 h-20 bg-neutral-100 dark:bg-[#151821] flex items-center justify-center rounded-2xl border border-dashed border-neutral-200/80 dark:border-white/10">
                  <ImageIcon className="w-6 h-6 text-neutral-400" />
                </div>
              )}
              <label className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 font-semibold text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>
          </div>

          <div>
            <label className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              <span>Excerpt (Meta Description Fallback)</span>
              <span className={`text-[11px] ${postForm.excerpt.length > 155 ? 'text-rose-500' : 'text-neutral-400'}`}>{postForm.excerpt.length}/155</span>
            </label>
            <textarea 
              className="w-full p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] h-24"
              placeholder="Write a concise overview of this article..."
              value={postForm.excerpt}
              onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Full Article Content</label>
            <TiptapEditor content={postForm.content} onChange={(content) => setPostForm({...postForm, content})} />
          </div>

          {/* SEO Drawer */}
          <div className="border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-[#151821]/50">
            <button 
              type="button"
              className="w-full p-4 flex justify-between items-center hover:bg-neutral-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setShowSeo(!showSeo)}
            >
              <h3 className="font-bold text-sm flex items-center gap-2 text-neutral-950 dark:text-white">
                <Settings className="w-4 h-4 text-neutral-400" /> SEO & Schema Optimization
              </h3>
              {showSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showSeo && (
              <div className="p-5 space-y-4 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318]">
                <div className="flex justify-end">
                   <button
                      type="button"
                      onClick={async () => {
                        if (!postForm.content) return alert('Add some content first.');
                        try {
                          const res = await fetch('/api/seo/auto-meta', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: postForm.content })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setPostForm({
                              ...postForm,
                              meta_title: data.meta_title || postForm.meta_title,
                              meta_description: data.meta_description || postForm.meta_description,
                              focus_keyword: data.focus_keyword || postForm.focus_keyword
                            });
                          }
                        } catch (e) {
                          alert('Failed to generate AI meta');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 rounded-full text-xs font-semibold hover:bg-[#D2F843]/25 transition-colors flex items-center gap-1 cursor-pointer"
                   >
                     <Zap className="w-3 h-3" /> Auto-Generate SEO
                   </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Meta Title
                  </label>
                  <input type="text" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" value={postForm.meta_title} onChange={e => setPostForm({...postForm, meta_title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Meta Description
                  </label>
                  <textarea className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] h-20" value={postForm.meta_description} onChange={e => setPostForm({...postForm, meta_description: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Target Category</label>
                    <select className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Realtor">Realtor</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Founder">Founder</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Focus Keyword</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" value={postForm.focus_keyword} onChange={e => setPostForm({...postForm, focus_keyword: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Content Engine & SEO
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Blog & Editorial Manager
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Publish educational articles about link-in-bio growth, NFC smart cards, and local creator playbooks.
          </p>
        </div>
        <button
          onClick={() => {
            const saved = localStorage.getItem('blog_draft');
            if (saved && confirm("Resume unsaved draft?")) {
              const parsed = JSON.parse(saved);
              setPostForm(parsed);
              if (parsed.faq_json) setFaqs(JSON.parse(parsed.faq_json));
            } else {
              setPostForm({ title: '', slug: '', content: '', excerpt: '', cover_image_url: '', meta_title: '', meta_description: '', focus_keyword: '', is_published: false, faq_json: '', product_json: '' });
              setFaqs([]);
              setCategory('Realtor');
            }
            setCreatingPost(true);
          }}
          className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Create Article
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{posts.length}</div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">Total Articles</div>
        </div>
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#596e00] dark:text-[#D2F843] tracking-tight">{posts.reduce((sum, p) => sum + (p.views || 0), 0)}</div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">Total Readers</div>
        </div>
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">{posts.filter(p => !p.is_published).length}</div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">Drafts</div>
        </div>
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{posts.filter(p => p.is_published).length}</div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">Live Articles</div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">
          Loading articles...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 text-xs border border-dashed border-neutral-200/80 dark:border-white/10 rounded-2xl">
          No blog posts found. Create your first article to boost organic SEO search ranking.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Title & Slug</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Published Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-950 dark:text-white text-sm truncate max-w-[280px]">{post.title}</div>
                    <div className="text-xs text-neutral-400 font-mono truncate max-w-[280px]">/blog/{post.slug}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${
                      post.is_published 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {post.is_published && (
                        <a 
                          href={`/blog/${post.slug}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 transition-colors" 
                          title="View Live Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          setEditingPost(post);
                          setPostForm(post);
                          if (post.faq_json) setFaqs(JSON.parse(post.faq_json));
                          if (post.product_json) setShowProduct(true);
                        }} 
                        className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer" 
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deletePost(post.id)} 
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
    </div>
  );
}
