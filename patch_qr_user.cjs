const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

if (!content.includes("import { QRCodeSVG } from 'qrcode.react';")) {
  content = content.replace("import { PaystackButton } from 'react-paystack';", "import { PaystackButton } from 'react-paystack';\nimport { QRCodeSVG } from 'qrcode.react';");
}

content = content.replace(
  /<img src={\`https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=150x150&data=https:\/\/chipng\.com\/\${profile\.username \|\| ''}\`} alt="QR Code" className="w-full h-full object-cover" \/>/,
  `<div className="w-full h-full bg-white flex items-center justify-center p-0.5">
    <QRCodeSVG 
      value={\`https://chipng.com/\${profile.username || ''}\`}
      size={40}
      imageSettings={{
        src: profile?.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDJdZfBp08ThhJkbous1qpSV80_ElD1o9obSt5AOKNYgq32sqShFsY95dnIhjpFH1wxwvT4gzXvFAZ_IpKEl5CpME0qIY6tV53q3N41VoqzAapRX3JGVjV8t0xHFVojZGp54nQM3lEGjPU5Ju0AxqQw_8APH-7H5hG-vaOeYzXj3cEc4Wj1y2Dlzf4vx24Nocz6VRMn5bSHI36NCSzRpkwk1SSi4ZCVsbVNmmrSByG2hDIeGzM3OSF92uHwBeAQqdzi0PE4r_i8nQQ",
        x: undefined,
        y: undefined,
        height: 12,
        width: 12,
        excavate: true,
      }}
    />
  </div>`
);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
