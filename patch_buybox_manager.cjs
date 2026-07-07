const fs = require('fs');

let content = fs.readFileSync('src/views/AdminBuyBoxManager.tsx', 'utf8');

// Ensure we import supabase
if (!content.includes('import { supabase }')) {
  content = content.replace("import { Package", "import { supabase } from '../supabaseClient';\nimport { Package");
}

const targetFormInit = `  const [form, setForm] = useState<BuyBoxProduct>(defaultForm);`;
const newFormInit = `  const [form, setForm] = useState<BuyBoxProduct>(defaultForm);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${Math.random()}.\${fileExt}\`;
    const filePath = \`\${fileName}\`;
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
  };`;

content = content.replace(targetFormInit, newFormInit);

const targetImageField = `          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Image URL</label>
            <input required value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px]" />
          </div>`;

const newImageField = `          <div>
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
          </div>`;

content = content.replace(targetImageField, newImageField);

const saveButtonOld = `<button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-xl text-sm">Save</button>`;
const saveButtonNew = `<button disabled={uploadingImage} type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-xl text-sm disabled:opacity-50">{uploadingImage ? 'Uploading...' : 'Save'}</button>`;
content = content.replace(saveButtonOld, saveButtonNew);

fs.writeFileSync('src/views/AdminBuyBoxManager.tsx', content);
