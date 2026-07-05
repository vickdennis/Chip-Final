import React, { useState, useEffect } from 'react';
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
      <div className="md:col-span-1 bg-white dark:bg-[#111] p-6 rounded-md shadow-sm border border-[#cfc4c5] dark:border-[#333] h-fit">
        <h3 className="font-sans font-bold text-lg mb-4">{editingProduct ? 'Edit Buy Box Product' : 'Add Buy Box Product'}</h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Name</label>
            <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Price NGN</label>
            <input required value={form.price_ngn} onChange={e=>setForm({...form, price_ngn: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Image URL</label>
            <input required value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Benefits (JSON Array)</label>
            <textarea required value={form.benefits_json} onChange={e=>setForm({...form, benefits_json: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] h-20" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Rating</label>
              <input required type="number" step="0.1" value={form.rating} onChange={e=>setForm({...form, rating: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
            </div>
            <div className="flex-1">
              <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Reviews</label>
              <input required type="number" value={form.review_count} onChange={e=>setForm({...form, review_count: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Badge Text</label>
            <input value={form.badge_text} onChange={e=>setForm({...form, badge_text: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">WhatsApp Link</label>
            <input required value={form.whatsapp_link} onChange={e=>setForm({...form, whatsapp_link: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Button Variant A</label>
            <input required value={form.button_variant_a} onChange={e=>setForm({...form, button_variant_a: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Button Variant B</label>
            <input required value={form.button_variant_b} onChange={e=>setForm({...form, button_variant_b: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-sm text-sm">Save</button>
            {editingProduct && (
              <button type="button" onClick={() => { setEditingProduct(null); setForm(defaultForm); }} className="flex-1 bg-gray-200 dark:bg-[#333] text-black dark:text-white font-bold py-2 rounded-sm text-sm">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white dark:bg-[#111] p-6 rounded-md shadow-sm border border-[#cfc4c5] dark:border-[#333]">
          <h3 className="font-sans font-bold text-lg mb-4">Existing Buy Box Products</h3>
          {loading ? <p>Loading...</p> : (
            <div className="flex flex-col gap-3">
              {products.map(p => (
                <div key={p.id} className="border border-[#cfc4c5] dark:border-[#333] p-4 rounded-md flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded-sm" />}
                    <div>
                      <div className="font-bold font-sans">{p.name}</div>
                      <div className="text-sm font-mono">₦{p.price_ngn}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 dark:bg-[#222] rounded-md"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id!)} className="p-2 bg-red-100 text-red-600 rounded-md"><Trash2 className="w-4 h-4" /></button>
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
