const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

// 1. Add states
content = content.replace(
  `const [showQR, setShowQR] = useState(false);`,
  `const [qrMode, setQrMode] = useState<'none' | 'bio' | 'vcard'>('none');
  const [isVcardCopied, setIsVcardCopied] = useState(false);`
);

// 2. Replace qr box
const oldQrBox = `{showQR ? (
    <div className="w-full h-full bg-white flex items-center justify-center p-2">
      <QRCodeSVG level="H" 
         value={\`https://chipng.com/\${profile.username || ''}\`}
        size={100} marginSize={1}
        imageSettings={{
          src: profile?.cover_image_url || coverUrl,
          x: undefined,
          y: undefined,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
    </div>
  ) : (
    <img src={profile?.cover_image_url || coverUrl} alt="Cover" className="w-full h-full object-cover" />
  )}`;

const newQrBox = `{qrMode !== 'none' ? (
    <div className="w-full h-full bg-white flex items-center justify-center p-2">
      <QRCodeSVG level="H" 
         value={qrMode === 'bio' ? \`https://chipng.com/\${profile.username || ''}\` : \`https://chipng.com/\${profile.username || ''}/vcard\`}
        size={100} marginSize={1}
        imageSettings={{
          src: profile?.cover_image_url || coverUrl,
          x: undefined,
          y: undefined,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
    </div>
  ) : (
    <img src={profile?.cover_image_url || coverUrl} alt="Cover" className="w-full h-full object-cover" />
  )}`;

if (content.includes(oldQrBox)) {
  content = content.replace(oldQrBox, newQrBox);
} else {
  // Use regex matching if exact string isn't found due to formatting
  content = content.replace(/\{showQR \? \([\s\S]*? \: \([\s\S]*?<\/img>[\s\S]*?\)\}/m, newQrBox);
}

// 3. Replace copy box and buttons
const oldButtons = `<div className="w-full bg-gray-50 dark:bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className="w-6 h-6 rounded-2xl bg-white dark:bg-[#1a1c1c] text-black dark:text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                       NG
                     </div>
                     <span className="text-black dark:text-white dark:text-white text-[13px] truncate font-medium">chipng.com/{profile.username}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(\`https://chipng.com/\${profile.username}\`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] text-black dark:text-white dark:text-white rounded-xl text-[13px] font-bold transition-colors shadow-sm"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="w-full py-4 rounded-2xl text-black dark:text-white dark:text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] shadow-sm flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> {showQR ? 'Show Profile Image' : 'Show QR Code'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: \`\${profile.full_name}'s Profile\`,
                          url: \`https://chipng.com/\${profile.username}\`
                        });
                      } else {
                        navigator.clipboard.writeText(\`https://chipng.com/\${profile.username}\`);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="w-full py-4 rounded-2xl text-black dark:text-white dark:text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#4776e6] to-[#8e54e9] shadow-[0_0_20px_rgba(71,118,230,0.3)] flex items-center justify-center gap-2"
                  >
                    <Share className="w-4 h-4" /> SHARE BIO LINK
                  </button>`;

const newButtons = `<div className="w-full bg-gray-50 dark:bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className="w-6 h-6 rounded-2xl bg-white dark:bg-[#1a1c1c] text-black dark:text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                       NG
                     </div>
                     <span className="text-black dark:text-white text-[13px] truncate font-medium">chipng.com/{profile.username}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(\`https://chipng.com/\${profile.username}\`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] text-black dark:text-white rounded-xl text-[13px] font-bold transition-colors shadow-sm"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="w-full bg-gray-50 dark:bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className="w-6 h-6 rounded-2xl bg-white dark:bg-[#1a1c1c] text-black dark:text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                       VC
                     </div>
                     <span className="text-black dark:text-white text-[13px] truncate font-medium">chipng.com/{profile.username}/vcard</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(\`https://chipng.com/\${profile.username}/vcard\`);
                      setIsVcardCopied(true);
                      setTimeout(() => setIsVcardCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] text-black dark:text-white rounded-xl text-[13px] font-bold transition-colors shadow-sm"
                  >
                    {isVcardCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setQrMode(qrMode === 'bio' ? 'none' : 'bio')}
                      className="flex-1 py-4 rounded-2xl text-black dark:text-white font-bold text-[13px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] shadow-sm flex flex-col items-center justify-center gap-1"
                    >
                      <QrCode className="w-5 h-5" /> {qrMode === 'bio' ? 'Hide' : 'Bio QR'}
                    </button>
                    
                    <button 
                      onClick={() => setQrMode(qrMode === 'vcard' ? 'none' : 'vcard')}
                      className="flex-1 py-4 rounded-2xl text-black dark:text-white font-bold text-[13px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] shadow-sm flex flex-col items-center justify-center gap-1"
                    >
                      <QrCode className="w-5 h-5" /> {qrMode === 'vcard' ? 'Hide' : 'Contact QR'}
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: \`\${profile.full_name}'s Profile\`,
                          url: \`https://chipng.com/\${profile.username}\`
                        });
                      } else {
                        navigator.clipboard.writeText(\`https://chipng.com/\${profile.username}\`);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="w-full py-4 rounded-2xl text-black dark:text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#4776e6] to-[#8e54e9] shadow-[0_0_20px_rgba(71,118,230,0.3)] flex items-center justify-center gap-2"
                  >
                    <Share className="w-4 h-4" /> SHARE BIO LINK
                  </button>`;

if (content.includes(oldButtons)) {
  content = content.replace(oldButtons, newButtons);
} else {
  // If exact matching fails, fallback with regex
  console.log("Could not find oldButtons exactly. Will try to replace manually.");
  content = content.replace(/<div className="w-full bg-gray-50.*?SHARE BIO LINK\s*<\/button>/s, newButtons);
}

fs.writeFileSync('src/views/PublicProfileView.tsx', content);
console.log('PublicProfileView.tsx patched');
