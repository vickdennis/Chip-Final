const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

content = content.replace(/<div className="bg-white dark:bg-\[#0C0C0C\] min-h-screen text-black dark:text-\[#D7E2EA\] font-sans overflow-x-clip relative">/, '<div className="dark bg-[#0C0C0C] min-h-screen text-[#D7E2EA] font-sans overflow-x-clip relative">');

fs.writeFileSync('src/views/LandingView.tsx', content);
