const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const regex = /\{showQR \? \([\s\S]*?<QRCodeSVG level="H"[\s\S]*?value=\{.*?\}.*?size=\{100\} marginSize=\{1\}[\s\S]*?imageSettings=\{\{[\s\S]*?src: profile\?\.cover_image_url \|\| coverUrl,[\s\S]*?x: undefined,[\s\S]*?y: undefined,[\s\S]*?height: 30,[\s\S]*?width: 30,[\s\S]*?excavate: true,[\s\S]*?\}\}[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?\) : \([\s\S]*?<img src=\{profile\?\.cover_image_url \|\| coverUrl\} alt="Cover" className="w-full h-full object-cover" \/>[\s\S]*?\)\}/m;

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

if (regex.test(content)) {
  content = content.replace(regex, newQrBox);
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
  console.log("Patched successfully.");
} else {
  console.log("Could not find QR Code box matching regex.");
}
