const fs = require('fs');
let file = 'src/views/UserDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
                <div className="w-12 h-12 bg-black/40 backdrop-blur-xl flex items-center justify-center rounded-xl border border-white/10 shrink-0 overflow-hidden p-1 relative">
                  <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chipng.com/\${profile.username || ''}\`} alt="QR Code" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-0.5 rounded-full flex items-center justify-center">
                      <img src={profile.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'} alt="Center Logo" className="w-3 h-3 rounded-full object-cover border border-[#eee]" />
                    </div>
                  </div>
                </div>
`;

content = content.replace(
  `                <div className="w-12 h-12 bg-black/40 backdrop-blur-xl flex items-center justify-center rounded-xl border border-white/10 shrink-0 overflow-hidden p-1">
                  <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chipng.com/\${profile.username || ''}\`} alt="QR Code" className="w-full h-full object-cover" />
                </div>`, replacement);

fs.writeFileSync(file, content);
