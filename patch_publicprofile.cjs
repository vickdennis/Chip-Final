const fs = require('fs');
let file = 'src/views/PublicProfileView.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement1 = `
            {/* Contact/Connect Action Strip */}
            <div className="w-full flex flex-col gap-3 mb-8">
              <a href={\`mailto:\${profile?.contact_email || profile?.email || 'hello@example.com'}\`} className="w-full bg-white rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors">
                <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                  <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                    {profile?.contact_email || profile?.email || "your@email.com"}
                  </span>
                </div>
                <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                  <span className="text-white font-sans text-[16px] font-bold tracking-tight">Connect with</span>
                  <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                </div>
              </a>

              <a href={\`https://wa.me/\${(profile?.phone_number || '').replace(/[^0-9]/g, '')}\`} target="_blank" rel="noopener noreferrer" className="w-full bg-white rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors">
                <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                  <span className="font-sans text-[19px] text-[#25D366] font-medium truncate" style={{ color: '#25D366' }}>
                    {profile?.phone_number || "+2348012345678"}
                  </span>
                </div>
                <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: '#8c8c8c' }}>
                  <span className="text-white font-sans text-[16px] font-bold tracking-tight">WhatsApp connect with</span>
                  <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                </div>
              </a>

              {profile?.phone_number && (
`;

content = content.replace(
  `            {/* Contact/Connect Action Strip */}
            <div className="w-full flex flex-col gap-3 mb-8">
              <a href={\`mailto:\${profile?.contact_email || profile?.email || 'hello@example.com'}\`} className="w-full bg-white rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors">
                <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                  <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                    {profile?.contact_email || profile?.email || "your@email.com"}
                  </span>
                </div>
                <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                  <span className="text-white font-sans text-[16px] font-bold tracking-tight">Connect with</span>
                  <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                </div>
              </a>
              {profile?.phone_number && (`, replacement1);

// Add center cover image for QR code
const qrReplacement1 = `
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/10 relative">
                   <img src={showQR ? \`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chipng.com/\${profile.username || ''}\` : coverUrl} alt="Cover/QR" className={\`w-full h-full \${showQR ? 'object-contain bg-white p-2' : 'object-cover'}\`} />
                   {showQR && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="bg-white p-1 rounded-full flex items-center justify-center">
                         <img src={coverUrl} alt="Center Logo" className="w-8 h-8 rounded-full object-cover border border-[#eee]" />
                       </div>
                     </div>
                   )}
                </div>
`;
content = content.replace(
  `                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/10 relative">
                   <img src={showQR ? \`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chipng.com/\${profile.username || ''}\` : coverUrl} alt="Cover/QR" className={\`w-full h-full \${showQR ? 'object-contain bg-white p-2' : 'object-cover'}\`} />
                </div>`, qrReplacement1);

fs.writeFileSync(file, content);
