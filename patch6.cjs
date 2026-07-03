const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldPreviewSection = `            {/* Preview Section */}
            <div className={\`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border \${currentLink.size === 'Big' ? 'aspect-[4/3] border-white/10' : currentLink.size === 'Medium' ? 'aspect-[2/1] border-white/10' : currentLink.size === 'Small' ? 'h-24 border-white/10' : 'h-16 border-white/10'}\`}
                 style={{ 
                   background: (currentLink.size === 'Big' && currentLink.cover_image_url) 
                     ? \`url('\${currentLink.cover_image_url}') center/cover\` 
                     : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>
              
              {/* Cover Image Upload (Only for Big) */}
              {currentLink.size === 'Big' && (
                <label className="absolute top-4 left-4 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors z-10">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const filePath = \`links/\${profile.id}/\${Math.random()}.\${fileExt}\`;
                      const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
                      if (uploadError) throw uploadError;
                      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
                      setCurrentLink({...currentLink, cover_image_url: data.publicUrl});
                    } catch (err: any) {
                      console.error(err);
                      alert('Error uploading image: ' + err.message);
                    } finally {
                      setUploading(false);
                    }
                  }} disabled={uploading} />
                </label>
              )}`;

const newPreviewSection = `            {/* Preview Section */}
            <div className={\`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border \${currentLink.size === 'Big' ? 'aspect-[4/3] border-white/10' : currentLink.size === 'Medium' ? 'aspect-[2/1] border-white/10' : currentLink.size === 'Small' ? 'h-24 border-white/10' : 'h-16 border-white/10'}\`}
                 style={{ 
                   background: (currentLink.size === 'Big' && coverUrl) 
                     ? \`url('\${coverUrl}') center/cover\` 
                     : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>`;

code = code.replace(oldPreviewSection, newPreviewSection);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
