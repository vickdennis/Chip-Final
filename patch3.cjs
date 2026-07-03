const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const linkModalCode = `
      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-sans font-bold text-white mb-6">
              {editingLinkIndex !== null ? 'Edit Featured Link' : 'Add Featured Link'}
            </h2>

            {/* Preview Section */}
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
              )}

              {/* Center Image / Icon */}
              {currentLink.size !== 'Button' && (
                <label className="relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors mb-2 z-10">
                  {currentLink.image_url ? (
                    <img src={currentLink.image_url} alt="" className="w-full h-full object-cover rounded-full" />
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
            </div>

            <div className="text-center text-white/50 text-xs mb-4">Find the look that fits you best</div>

            {/* Size Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(['Big', 'Medium', 'Small', 'Button'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setCurrentLink({...currentLink, size})}
                  className={\`flex flex-col items-center justify-center py-3 rounded-xl border \${currentLink.size === size ? 'border-[#B600A8] text-white bg-[#B600A8]/10' : 'border-white/10 text-white/60 hover:bg-white/5 hover:text-white'} transition-colors\`}
                >
                  <div className={\`w-6 border-2 mb-2 rounded-sm \${currentLink.size === size ? 'border-[#B600A8]' : 'border-white/40'} \${size === 'Big' ? 'h-5' : size === 'Medium' ? 'h-3' : size === 'Small' ? 'h-2' : 'h-1'}\`}></div>
                  <span className="text-[11px] font-bold">{size}</span>
                </button>
              ))}
            </div>

            {/* Warning Message */}
            {currentLink.size === 'Big' && !currentLink.image_url && !currentLink.cover_image_url && (
              <div className="flex items-center gap-3 bg-[#3f290d] border border-[#a66a1a] text-[#facc15] px-4 py-3 rounded-xl mb-6 text-xs font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                This will display as a button because there's no image. Add an image to use big thumbnail.
              </div>
            )}

            <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Use Link Icon</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={currentLink.use_link_icon} onChange={(e) => setCurrentLink({...currentLink, use_link_icon: e.target.checked})} />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B600A8]"></div>
                </label>
              </div>

              <input
                type="text"
                placeholder="Link, phone, number, or email"
                value={currentLink.url}
                onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#B600A8]"
              />

              <input
                type="text"
                placeholder="Title"
                value={currentLink.label}
                onChange={(e) => setCurrentLink({...currentLink, label: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#B600A8]"
              />
            </div>

            <button
              onClick={() => {
                if (editingLinkIndex !== null) {
                  const newLinks = [...links];
                  newLinks[editingLinkIndex] = currentLink;
                  setLinks(newLinks);
                } else {
                  setLinks([...links, currentLink]);
                }
                setIsLinkModalOpen(false);
              }}
              className="w-full mt-6 bg-[#B600A8] text-white font-bold py-3 rounded-xl hover:bg-[#B600A8]/80 transition-colors"
            >
              Save Link
            </button>
          </div>
        </div>
      )}
`;

code = code.replace('    </AdminLayout>', linkModalCode + '\n    </AdminLayout>');
fs.writeFileSync('src/views/UserDashboard.tsx', code);
