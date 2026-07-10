const fs = require('fs');
let file = 'src/views/UserDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = `import { Save, Eye,`;
const importReplacement = `import { Image as ImageIcon, ChevronLeft, ChevronRight, Save, Eye,`;
content = content.replace(importTarget, importReplacement);

const stateTarget = `  const [activeTab, setActiveTab] = useState`;
const stateReplacement = `  const [galleryImages, setGalleryImages] = useState<any[]>([]);\n  const [galleryInput, setGalleryInput] = useState('');\n  const [activeTab, setActiveTab] = useState`;
content = content.replace(stateTarget, stateReplacement);

const fetchTarget = `      if (profileData) {`;
const fetchReplacement = `      const galRes = await fetch('/api/gallery/' + user.id);
      if (galRes.ok) {
        const galData = await galRes.json();
        setGalleryImages(galData);
      }
      if (profileData) {`;
content = content.replace(fetchTarget, fetchReplacement);

const addGalleryFn = `
  const addGalleryImage = async () => {
    if (!galleryInput.trim() || !profile) return;
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ profile_id: profile.id, image_url: galleryInput })
      });
      if (res.ok) {
        setGalleryImages([...galleryImages, { image_url: galleryInput }]);
        setGalleryInput('');
      }
    } catch(e) {}
  };
  
  const removeGalleryImage = async (id: number, index: number) => {
    if (id) {
      await fetch('/api/gallery/' + id, { method: 'DELETE' });
    }
    const newGal = [...galleryImages];
    newGal.splice(index, 1);
    setGalleryImages(newGal);
  };
`;
content = content.replace('  const handleSave = async () => {', addGalleryFn + '\n  const handleSave = async () => {');

const galleryUI = `
            {/* Gallery Settings */}
            <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col mb-8">
              <div className="border-b border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-white uppercase tracking-widest">Photo Gallery</h3>
                <ImageIcon className="w-[20px] h-[20px] text-white/60" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Image URL (https://...)"
                    value={galleryInput}
                    onChange={e => setGalleryInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl font-sans text-sm text-white"
                  />
                  <button onClick={addGalleryImage} className="px-6 py-3 bg-white text-black font-bold rounded-xl whitespace-nowrap">Add Photo</button>
                </div>
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                        <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                        <button onClick={() => removeGalleryImage(img.id, idx)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
`;
content = content.replace(`            {/* Social Media */}`, galleryUI + '\n            {/* Social Media */}');

fs.writeFileSync(file, content);
