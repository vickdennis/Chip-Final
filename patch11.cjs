const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldModalPreview = `            {/* Preview Section */}
            <div className={\`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border \${currentLink.size === 'Big' ? 'aspect-[4/3] border-white/10' : currentLink.size === 'Medium' ? 'aspect-[2/1] border-white/10' : currentLink.size === 'Small' ? 'h-24 border-white/10' : 'h-16 border-white/10'}\`}
                 style={{ 
                   background: 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>
                 
                 {currentLink.size === 'Big' && coverUrl && (
                   <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 bg-black/50 z-10 overflow-hidden flex items-center justify-center">
                     <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                   </div>
                 )}

              {/* Center Image / Icon */}
              {currentLink.size !== 'Button' && (
                <label className="relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors mb-2 z-10">
                  {currentLink.image_url ? (
                    <img src={currentLink.image_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : currentLink.use_link_icon && currentLink.url ? (
                    <img src={\`https://icon.horse/icon/\${(currentLink.url.replace(/^https?:\\/\\//, '').split('/')[0])}\`} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
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
                      setCurrentLink({...currentLink, image_url: data.publicUrl});
                    } catch (err: any) {
                      console.error(err);
                      alert('Error uploading image: ' + err.message);
                    } finally {
                      setUploading(false);
                    }
                  }} disabled={uploading} />
                </label>
              )}

              <span className="font-bold text-white/80 z-10">{currentLink.label || 'Title'}</span>
            </div>`;

const newModalPreview = `            {/* Preview Section */}
            <div className={\`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border \${currentLink.size === 'Big' ? 'aspect-[4/3] border-white/10' : currentLink.size === 'Medium' ? 'aspect-[2/1] border-white/10' : currentLink.size === 'Small' ? 'h-24 border-white/10' : 'h-16 border-white/10'}\`}
                 style={{ 
                   background: currentLink.size !== 'Button' && currentLink.image_url 
                     ? \`url('\${currentLink.image_url}') center/cover\`
                     : currentLink.size !== 'Button' && currentLink.use_link_icon && currentLink.url
                     ? \`url('https://icon.horse/icon/\${(currentLink.url.replace(/^https?:\\/\\//, '').split('/')[0])}') center/cover\`
                     : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>
                 
                 {/* Dark overlay to ensure text is readable if there's a background image */}
                 {currentLink.size !== 'Button' && (currentLink.image_url || (currentLink.use_link_icon && currentLink.url)) && (
                   <div className="absolute inset-0 bg-black/40 z-0"></div>
                 )}
                 
                 {/* Top Right Profile Cover (Only for Big) */}
                 {currentLink.size === 'Big' && coverUrl && (
                   <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 bg-black/50 z-10 shadow-lg overflow-hidden flex items-center justify-center">
                     <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                   </div>
                 )}

              {/* Center Image Upload Button */}
              {currentLink.size !== 'Button' && (
                <label className="relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors mb-2 z-10 backdrop-blur-md">
                  <Camera className="w-5 h-5 text-white" />
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
                      setCurrentLink({...currentLink, image_url: data.publicUrl});
                    } catch (err: any) {
                      console.error(err);
                      alert('Error uploading image: ' + err.message);
                    } finally {
                      setUploading(false);
                    }
                  }} disabled={uploading} />
                </label>
              )}

              <span className={\`font-bold text-white z-10 \${currentLink.size !== 'Button' ? 'text-lg mt-auto mb-6 drop-shadow-md' : 'text-md'}\`}>{currentLink.label || 'Title'}</span>
            </div>`;

code = code.replace(oldModalPreview, newModalPreview);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
