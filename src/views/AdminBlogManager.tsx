import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit2, Trash2, Globe, Eye, Settings, Image as ImageIcon, Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
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
    console.log("Draft auto-saved to localStorage.");
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) {
      try {
        const metaRes = await fetch('/api/post-meta');
        const meta = await metaRes.json();
        const merged = data.map(p => {
          const m = meta.find((m: any) => m.post_slug === p.slug);
          return m ? { ...p, views: m.views || 0, product_json: m.product_json, faq_json: m.faq_json } : { ...p, views: 0 };
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
      const { error: uploadError } = await supabase.storage.from('blog').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('blog').getPublicUrl(filePath);
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
      const finalForm = { ...postForm, content: finalContent, is_published: publish, published_at: publish ? new Date().toISOString() : null };
      delete finalForm.faq_json;
      delete finalForm.product_json;
      delete finalForm.focus_keyword;
      
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
        body: JSON.stringify({ post_slug: finalForm.slug, product_json: showProduct ? postForm.product_json : null, faq_json: faqStr })
      });
      
      await fetch('/api/post-categories', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ post_slug: finalForm.slug, category })
      });
      
      localStorage.removeItem('blog_draft');
      setCreatingPost(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error: any) {
      alert('Error saving post: ' + error.message);
    }
  };

  const deletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (!error) fetchPosts();
    }
  };

  if (creatingPost || editingPost) {
    return (
      <div className="bg-[#f9f9f9] dark:bg-black min-h-screen text-white pb-20">
        <div className="max-w-4xl mx-auto pt-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setCreatingPost(false); setEditingPost(null); }} className="flex items-center text-white/40 hover:text-black dark:hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Posts
            </button>
            <div className="flex gap-3">
              <button onClick={() => savePost(false)} className="px-4 py-2 border border-white/10 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </button>
              <button onClick={() => savePost(true)} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-90 flex items-center">
                <Globe className="w-4 h-4 mr-2" /> {postForm.is_published ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Post Title" 
              className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-[#cfc4c5] dark:placeholder:text-[#333]"
              value={postForm.title}
              onChange={handleTitleChange}
            />
            <input 
              type="text" 
              placeholder="Slug (e.g., my-awesome-post)" 
              className="w-full font-mono text-sm bg-transparent border-none outline-none text-white/40"
              value={postForm.slug}
              onChange={(e) => setPostForm({...postForm, slug: e.target.value})}
            />

            <div className="border border-white/10 rounded-2xl p-4 bg-black/40 backdrop-blur-xl">
              <label className="block text-sm font-bold mb-2">Featured Image</label>
              <div className="flex items-center gap-4">
                {postForm.cover_image_url ? (
                  <img src={postForm.cover_image_url} alt="Cover" className="w-32 h-20 object-cover rounded-2xl" />
                ) : (
                  <div className="w-32 h-20 bg-[#f9f9f9] dark:bg-[#1a1a1a] flex items-center justify-center rounded-2xl border border-dashed border-white/10">
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  </div>
                )}
                <label className="px-4 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-white/10 rounded-2xl cursor-pointer hover:bg-black/5">
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 flex justify-between">
                <span>Excerpt</span>
                <span className={`text-xs ${postForm.excerpt.length > 155 ? 'text-red-500' : 'text-white/40'}`}>{postForm.excerpt.length}/155</span>
              </label>
              <textarea 
                className="w-full p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl outline-none focus:border-black dark:focus:border-white h-24"
                placeholder="Write a short summary..."
                value={postForm.excerpt}
                onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Content</label>
              <TiptapEditor content={postForm.content} onChange={(content) => setPostForm({...postForm, content})} />
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl">
              <button 
                className="w-full p-4 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a] hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setShowSeo(!showSeo)}
              >
                <h3 className="font-bold flex items-center"><Settings className="w-4 h-4 mr-2" /> SEO Optimization</h3>
                {showSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showSeo && (
                <div className="p-4 space-y-4">
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
                            console.error(e);
                            alert('Failed to generate AI meta');
                          }
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[11px] font-bold font-mono hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                     >
                       <Zap className="w-3 h-3" /> Auto-Generate via AI
                     </button>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 flex justify-between">
                      Meta Title
                      <span className={`text-xs ${postForm.meta_title.length > 60 ? 'text-red-500' : 'text-white/40'}`}>{postForm.meta_title.length}/60</span>
                    </label>
                    <input type="text" className="w-full p-2 bg-transparent border border-white/10 rounded-2xl" value={postForm.meta_title} onChange={e => setPostForm({...postForm, meta_title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 flex justify-between">
                      Meta Description
                      <span className={`text-xs ${postForm.meta_description.length > 155 ? 'text-red-500' : 'text-white/40'}`}>{postForm.meta_description.length}/155</span>
                    </label>
                    <textarea className="w-full p-2 bg-transparent border border-white/10 rounded-2xl h-20" value={postForm.meta_description} onChange={e => setPostForm({...postForm, meta_description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select className="w-full p-2 bg-transparent border border-white/10 rounded-2xl" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Realtor">Realtor</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Founder">Founder</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Focus Keyword</label>
                    <input type="text" className="w-full p-2 bg-transparent border border-white/10 rounded-2xl" value={postForm.focus_keyword} onChange={e => setPostForm({...postForm, focus_keyword: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Related Product (Buy Box)</label>
                    <select className="w-full p-2 bg-transparent border border-white/10 rounded-2xl" value={selectedProductId || ''} onChange={e => setSelectedProductId(e.target.value ? parseInt(e.target.value) : null)}>
                      <option value="">Default (First Product)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ₦{p.price_ngn}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold">FAQ Schema Builder</label>
                      <button onClick={() => setFaqs([...faqs, {q:'', a:''}])} className="text-xs flex items-center text-blue-500"><Plus className="w-3 h-3 mr-1" /> Add FAQ</button>
                    </div>
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="mb-3 p-3 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-white/10 rounded-2xl">
                        <input type="text" placeholder="Question" className="w-full p-2 bg-[#050505] border border-white/10 rounded-2xl mb-2 text-sm" value={faq.q} onChange={e => { const n = [...faqs]; n[idx].q = e.target.value; setFaqs(n); }} />
                        <textarea placeholder="Answer" className="w-full p-2 bg-[#050505] border border-white/10 rounded-2xl text-sm h-16" value={faq.a} onChange={e => { const n = [...faqs]; n[idx].a = e.target.value; setFaqs(n); }} />
                        <button onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="text-xs text-red-500 mt-1 flex items-center"><Trash2 className="w-3 h-3 mr-1" /> Remove</button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                     <label className="flex items-center text-sm font-bold cursor-pointer mb-2">
                        <input type="checkbox" className="mr-2" checked={showProduct} onChange={e => setShowProduct(e.target.checked)} />
                        Enable Product Schema JSON-LD
                     </label>
                     {showProduct && (
                       <div className="space-y-2 pl-6">
                         <input type="text" placeholder='Product JSON (e.g. {"price":"1000","currency":"NGN","rating":4.5})' className="w-full p-2 bg-transparent border border-white/10 rounded-2xl font-mono text-xs" value={postForm.product_json} onChange={e => setPostForm({...postForm, product_json: e.target.value})} />
                       </div>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-sans">Blog Management</h2>
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
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-2xl font-bold text-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border border-white/10 rounded-2xl text-center">
          <div className="text-2xl font-bold">{posts.length}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Total Posts</div>
        </div>
        <div className="p-4 border border-white/10 rounded-2xl text-center">
          <div className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.views || 0), 0)}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Total Views</div>
        </div>
        <div className="p-4 border border-white/10 rounded-2xl text-center">
          <div className="text-2xl font-bold">{posts.filter(p => !p.is_published).length}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Drafts</div>
        </div>
        <div className="p-4 border border-white/10 rounded-2xl text-center">
          <div className="text-2xl font-bold text-green-600">{posts.filter(p => p.is_published).length}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Published</div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-white/40">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-center text-white/40 border border-dashed border-white/10 rounded-2xl">
          No blog posts found. Create your first post!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm text-white/40">
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/10 hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a]">
                  <td className="p-3">
                    <div className="font-bold text-sm truncate max-w-[250px]">{post.title}</div>
                    <div className="text-xs text-white/40 font-mono truncate max-w-[250px]">/{post.slug}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${post.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-white/40">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {post.is_published && (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-1 text-white/40 hover:text-black dark:hover:text-white" title="View Public">
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => {
                        setEditingPost(post);
                        setPostForm(post);
                        if (post.faq_json) setFaqs(JSON.parse(post.faq_json));
                        if (post.product_json) setShowProduct(true);
                      }} className="p-1 text-white/40 hover:text-blue-600" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePost(post.id)} className="p-1 text-white/40 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
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
