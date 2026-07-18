const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

if (!content.includes("import { QRCodeSVG } from 'qrcode.react';")) {
  content = content.replace("import { PaystackButton } from 'react-paystack';", "import { PaystackButton } from 'react-paystack';\nimport { QRCodeSVG } from 'qrcode.react';");
}

content = content.replace(
  /<img src={showQR \? \`https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=150x150&data=https:\/\/chipng\.com\/\${profile\.username \|\| ''}\` : coverUrl} alt="Cover\/QR" className={\`w-full h-full \${showQR \? 'object-contain bg-white dark:bg-\\[#1a1c1c\\] p-2' : 'object-cover'}\`} \/>/,
  `{showQR ? (
    <div className="w-full h-full bg-white flex items-center justify-center p-2">
      <QRCodeSVG 
        value={\`https://chipng.com/\${profile.username || ''}\`}
        size={130}
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
  )}`
);

fs.writeFileSync('src/views/PublicProfileView.tsx', content);
