import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';

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
    name: '', price_ngn: '', image_url: '', benefits_json: '["Benefit 1", "Benefit 2", "Benefit 3"]',
    rating: 4.9, review_count: 0, badge_text: '', whatsapp_link: '',
    button_variant_a: 'Order on WhatsApp Now', button_variant_b: 'Get Yours'
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
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchProducts();
        setForm(defaultForm);
        setEditingProduct(null);
      }
    } catch (e) {
      console.error(e);
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 h-fit">
        <h3 className="font-sans font-bold text-lg mb-4">{editingProduct ? 'Edit Buy Box Product' : 'Add Buy Box Product'}</h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Name</label>
            <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Price NGN</label>
            <input required value={form.price_ngn} onChange={e=>setForm({...form, price_ngn: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Image Upload</label>
            {form.image_url && <img src={form.image_url} className="w-full h-24 object-cover mb-2 rounded-xl border border-white/10" />}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-[13px]"
            />
            <div className="mt-2">
              <label className="block font-mono text-[10px] font-bold text-white/40 uppercase mb-1">Or Image URL</label>
              <input value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[12px] font-sans" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-mono text-[11px] font-bold text-white/60 uppercase">Benefits</label>
              <button type="button" onClick={() => {
                let current = [];
                try { current = JSON.parse(form.benefits_json); } catch(e) {}
                current.push('');
                setForm({...form, benefits_json: JSON.stringify(current)});
              }} className="text-xs text-blue-500 font-bold flex items-center">
                <Plus className="w-3 h-3 mr-1" /> Add Benefit
              </button>
            </div>
            {(() => {
               let benefits = [];
               try { benefits = JSON.parse(form.benefits_json); } catch(e) {}
               if (!Array.isArray(benefits)) benefits = [];
               return benefits.map((b, idx) => (
                 <div key={idx} className="flex gap-2 mb-2">
                   <input value={b} onChange={e => {
                     const newB = [...benefits];
                     newB[idx] = e.target.value;
                     setForm({...form, benefits_json: JSON.stringify(newB)});
                   }} className="w-full px-3 py-2 border border-white/10 bg-transparent rounded-xl text-[13px]" />
                   <button type="button" onClick={() => {
                     const newB = benefits.filter((_, i) => i !== idx);
                     setForm({...form, benefits_json: JSON.stringify(newB)});
                   }} className="text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ));
            })()}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Rating</label>
              <input required type="number" step="0.1" value={form.rating} onChange={e=>setForm({...form, rating: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
            </div>
            <div className="flex-1">
              <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Reviews</label>
              <input required type="number" value={form.review_count} onChange={e=>setForm({...form, review_count: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Badge Text</label>
            <input value={form.badge_text} onChange={e=>setForm({...form, badge_text: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">WhatsApp Link</label>
            <input required value={form.whatsapp_link} onChange={e=>setForm({...form, whatsapp_link: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Button Variant A</label>
            <input required value={form.button_variant_a} onChange={e=>setForm({...form, button_variant_a: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Button Variant B</label>
            <input required value={form.button_variant_b} onChange={e=>setForm({...form, button_variant_b: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>
          <div className="flex gap-2">
            <button disabled={uploadingImage} type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-xl text-sm disabled:opacity-50">{uploadingImage ? 'Uploading...' : 'Save'}</button>
            {editingProduct && (
              <button type="button" onClick={() => { setEditingProduct(null); setForm(defaultForm); }} className="flex-1 bg-gray-200 dark:bg-[#333] text-white font-bold py-2 rounded-xl text-sm">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="md:col-span-2">
        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10">
          <h3 className="font-sans font-bold text-lg mb-4">Existing Buy Box Products</h3>
          {loading ? <p>Loading...</p> : (
            <div className="flex flex-col gap-3">
              {products.map(p => (
                <div key={p.id} className="border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded-xl" />}
                    <div>
                      <div className="font-bold font-sans">{p.name}</div>
                      <div className="text-sm font-mono">₦{p.price_ngn}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 dark:bg-[#222] rounded-2xl"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id!)} className="p-2 bg-red-100 text-red-600 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
