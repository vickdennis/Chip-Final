import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Update prodForm state
code = code.replace(
    "const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', image_url: '' });",
    "const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', media_urls: [] as string[] });"
)

# 2. Update setProdForm clears
code = code.replace(
    "setProdForm({ name: '', description: '', price: '', image_url: '' });",
    "setProdForm({ name: '', description: '', price: '', media_urls: [] });"
)
code = code.replace(
    "setProdForm({name:'', price:'', description:'', image_url:''});",
    "setProdForm({name:'', price:'', description:'', media_urls: []});"
)

# 3. Update setEditingProduct logic
old_edit = """                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm({ name: p.name, description: p.description || '', price: p.price.toString(), image_url: p.image_url || '' });
                          }}"""

new_edit = """                          onClick={() => {
                            setEditingProduct(p);
                            let media = [];
                            try { media = JSON.parse(p.image_url); } catch { if (p.image_url) media = [p.image_url]; }
                            setProdForm({ name: p.name, description: p.description || '', price: p.price.toString(), media_urls: media });
                          }}"""
code = code.replace(old_edit, new_edit)

# 4. Update handleSaveProduct
old_save = """    const payload = {
      profile_id: null,
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(prodForm.price.toString().replace(/,/g, '')),
      image_url: prodForm.image_url
    };"""

new_save = """    const payload = {
      profile_id: null,
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(prodForm.price.toString().replace(/,/g, '')),
      image_url: JSON.stringify(prodForm.media_urls)
    };"""
code = code.replace(old_save, new_save)

# 5. Update HTML form for multiple media
old_html = """                <div>
                  <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Image Upload</label>
                  {prodForm.image_url && <img src={prodForm.image_url} className="w-full h-24 object-cover mb-2 rounded-xl border border-black/10 dark:border-white/10" />}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setProdForm({...prodForm, image_url: url}), 'covers')}
                    className="w-full text-[13px]" 
                  />
                  <div className="mt-2">
                    <label className="block font-mono text-[10px] font-bold text-black/40 dark:text-white/40 uppercase mb-1">Or Image URL</label>
                    <input value={prodForm.image_url} onChange={e=>setProdForm({...prodForm, image_url: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-[12px] font-sans" />
                  </div>
                </div>"""

new_html = """                <div>
                  <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Media Upload (Images & Videos)</label>
                  
                  {prodForm.media_urls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2 mb-2">
                      {prodForm.media_urls.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 flex-shrink-0 group rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                          {url.match(/\.(mp4|webm)$/i) ? (
                            <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} className="w-full h-full object-cover" />
                          )}
                          <button type="button" onClick={() => setProdForm({...prodForm, media_urls: prodForm.media_urls.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    multiple
                    onChange={async (e) => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = [...prodForm.media_urls];
                      setUploadingImage(true);
                      for (const file of files) {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Math.random()}.${fileExt}`;
                        try {
                           const { error } = await supabase.storage.from('covers').upload(fileName, file);
                           if (!error) {
                             const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
                             urls.push(data.publicUrl);
                           }
                        } catch(err) {}
                      }
                      setProdForm({...prodForm, media_urls: urls});
                      setUploadingImage(false);
                    }}
                    className="w-full text-[13px]" 
                  />
                </div>"""

code = code.replace(old_html, new_html)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Admin Products Patched")
