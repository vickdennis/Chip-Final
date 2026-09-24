import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Plus, Edit2, Trash2, CheckCircle2, Star, MessageSquare } from 'lucide-react';

interface BuyBoxProduct {
  id?: number;
  name: string;
  price_ngn: string;
  image_url: string;
  benefits_json: string;
  rating: number;
  review_count: number;
  badge_text: string;
  whatsapp_link: string;
  button_variant_a: string;
  button_variant_b: string;
}

export default function AdminBuyBoxManager() {
  const [products, setProducts] = useState<BuyBoxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<BuyBoxProduct | null>(null);

  const defaultForm: BuyBoxProduct = {
    name: '', price_ngn: '', image_url: '', benefits_json: '["Instant Tap & Share via NFC", "Works with all iPhones & Androids", "No Monthly App Subscription"]',
    rating: 4.9, review_count: 128, badge_text: 'Bestseller', whatsapp_link: '',
    button_variant_a: 'Order on WhatsApp Now', button_variant_b: 'Get Your NFC Card'
  };
  const [form, setForm] = useState<BuyBoxProduct>(defaultForm);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    setUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      setForm({ ...form, image_url: data.publicUrl });
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: Number(form.rating) || 0, review_count: Number(form.review_count) || 0 })
      });
      if (res.ok) {
        alert('Product saved successfully!');
        fetchProducts();
        setForm(defaultForm);
        setEditingProduct(null);
      } else {
        const errorData = await res.json();
        alert('Error saving product: ' + (errorData.error || res.statusText));
      }
    } catch (e: any) {
      console.error(e);
      alert('Error saving product: ' + e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch('/api/products/' + id, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (p: BuyBoxProduct) => {
    setEditingProduct(p);
    setForm(p);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Form column */}
      <div className="lg:col-span-5 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 h-fit">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
          <Package className="w-3.5 h-3.5" /> Direct Conversion Widget
        </div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mb-1">
          {editingProduct ? 'Edit Buy Box Offering' : 'Add Buy Box Offering'}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
          Controls the quick checkout widget rendered on sales and promotional landing funnels.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Card / Product Name</label>
            <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="e.g. Executive Metal NFC Card" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Price (₦)</label>
            <input required value={form.price_ngn} onChange={e=>setForm({...form, price_ngn: e.target.value})} placeholder="e.g. 29,900" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Hero Visual</label>
            {form.image_url && (
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 mb-2.5">
                <img src={form.image_url} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-200/70 dark:file:bg-white/10 file:text-neutral-900 dark:file:text-white hover:file:bg-neutral-300 cursor-pointer"
            />
            <input 
              value={form.image_url} 
              onChange={e=>setForm({...form, image_url: e.target.value})} 
              placeholder="Or paste image URL"
              className="mt-2 w-full px-4 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Key Features / Benefits</label>
              <button type="button" onClick={() => {
                let current = [];
                try { current = JSON.parse(form.benefits_json); } catch(e) {}
                current.push('');
                setForm({...form, benefits_json: JSON.stringify(current)});
              }} className="text-xs text-[#6c8600] dark:text-[#D2F843] font-semibold flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Bullet
              </button>
            </div>
            {(() => {
               let benefits = [];
               try { benefits = JSON.parse(form.benefits_json); } catch(e) {}
               if (!Array.isArray(benefits)) benefits = [];
               return benefits.map((b, idx) => (
                 <div key={idx} className="flex gap-2 mb-2">
                   <input 
                     value={b} 
                     onChange={e => {
                       const newB = [...benefits];
                       newB[idx] = e.target.value;
                       setForm({...form, benefits_json: JSON.stringify(newB)});
                     }} 
                     placeholder="Benefit point..."
                     className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" 
                   />
                   <button 
                     type="button" 
                     onClick={() => {
                       const newB = benefits.filter((_, i) => i !== idx);
                       setForm({...form, benefits_json: JSON.stringify(newB)});
                     }} 
                     className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-xl transition-colors cursor-pointer"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                 </div>
               ));
            })()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Rating</label>
              <input type="number" step="0.1" value={form.rating} onChange={e=>setForm({...form, rating: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Review Count</label>
              <input type="number" value={form.review_count} onChange={e=>setForm({...form, review_count: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Highlight Badge</label>
              <input value={form.badge_text} onChange={e=>setForm({...form, badge_text: e.target.value})} placeholder="e.g. BESTSELLER" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">WhatsApp Link</label>
              <input value={form.whatsapp_link} onChange={e=>setForm({...form, whatsapp_link: e.target.value})} placeholder="https://wa.me/..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button disabled={uploadingImage} type="submit" className="flex-1 py-3 px-5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50">
              {uploadingImage ? 'Uploading...' : (editingProduct ? 'Save Changes' : 'Create Buy Box')}
            </button>
            {editingProduct && (
              <button type="button" onClick={() => { setEditingProduct(null); setForm(defaultForm); }} className="px-5 py-3 rounded-full border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List column */}
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">Active Buy Box Widgets</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Products displayed across conversion funnel buy boxes</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300">
            {products.length} products
          </span>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-[#111318] p-12 rounded-3xl border border-neutral-200/80 dark:border-white/10 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-[#111318] p-12 rounded-3xl border border-dashed border-neutral-200/80 dark:border-white/10 text-center text-xs text-neutral-400">
            No buy box items configured yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-neutral-300 dark:hover:border-white/20 transition-all shadow-sm">
                <div className="flex gap-4 items-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-16 h-16 object-cover rounded-2xl border border-neutral-200/80 dark:border-white/10 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    {p.badge_text && (
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D2F843]/20 text-[#6c8600] dark:text-[#D2F843] mb-1">
                        {p.badge_text}
                      </span>
                    )}
                    <h4 className="font-bold text-neutral-950 dark:text-white text-base">{p.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="font-bold text-neutral-950 dark:text-white text-sm">₦{p.price_ngn}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating} ({p.review_count})</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-center">
                  <button 
                    onClick={() => handleEdit(p)} 
                    className="p-2.5 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id!)} 
                    className="p-2.5 rounded-full border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
