const fs = require('fs');
const content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const targetStr = `            </div>

            {profile?.address && (`

const galleryCode = `            </div>

            {/* Auto-sliding Gallery Placeholder */}
            <div className="w-full mb-8 flex flex-col gap-3 overflow-hidden relative group">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-1 px-1">Gallery</span>
              <div 
                id="profile-gallery"
                className="w-full flex gap-3 overflow-x-auto snap-x scrollbar-hide py-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                {[
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80"
                ].map((src, idx) => (
                  <div key={idx} className="min-w-[200px] h-[140px] shrink-0 snap-center rounded-2xl overflow-hidden border border-white/10 shadow-lg relative bg-black/20">
                    <img src={src} alt="Gallery item" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {profile?.address && (`;

if (content.includes(targetStr)) {
  const newContent = content.replace(targetStr, galleryCode);
  fs.writeFileSync('src/views/PublicProfileView.tsx', newContent);
  console.log("Patched gallery.");
} else {
  console.log("Target string not found.");
}
