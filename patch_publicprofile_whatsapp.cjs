const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const targetStr = `{profile?.phone_number && (
                <a href={\`https://wa.me/\${profile.phone_number.replace(/[^0-9]/g, '')}\`} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-[#1a1c1c] rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors mt-2">
                  <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                    <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                      {profile.phone_number}
                    </span>
                  </div>
                  <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                    <span className="text-black dark:text-white dark:text-white font-sans text-[16px] font-bold tracking-tight">WhatsApp connect</span>
                    <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                  </div>
                </a>
              )}`;

const replacementStr = `{(() => {
                if (!profile?.phone_number) return null;
                let arr = [];
                try {
                  const parsed = JSON.parse(profile.phone_number);
                  if (Array.isArray(parsed)) arr = parsed;
                  else if (profile.phone_number.includes(',')) arr = profile.phone_number.split(',').map(s=>s.trim());
                  else arr = [profile.phone_number];
                } catch(e) {
                  if (profile.phone_number.includes(',')) arr = profile.phone_number.split(',').map(s=>s.trim());
                  else arr = [profile.phone_number];
                }
                arr = arr.filter(Boolean);
                if (arr.length === 0) return null;

                return arr.map((phone, idx) => (
                  <a key={idx} href={\`https://wa.me/\${phone.replace(/[^0-9]/g, '')}\`} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-[#1a1c1c] rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 dark:hover:bg-black/60 transition-colors mt-2">
                    <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                      <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                        {phone}
                      </span>
                    </div>
                    <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                      <span className="text-black dark:text-white font-sans text-[16px] font-bold tracking-tight">WhatsApp connect</span>
                      <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                    </div>
                  </a>
                ));
              })()}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
  console.log("Patched whatsapp successfully.");
} else {
  console.log("Failed to patch whatsapp. Target not found.");
}
