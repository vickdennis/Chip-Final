const fs = require('fs');
let content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf-8');

// Replace top header style
content = content.replace(
  /<header className="bg-black text-black dark:text-white p-4 sticky top-0 z-20 shadow-md flex justify-between items-center">/,
  `<header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 text-black dark:text-white p-5 sticky top-0 z-20 flex justify-between items-center">`
);

content = content.replace(
  /<h1 className="font-mono text-\[16px\] font-bold tracking-widest uppercase">Super Admin<\/h1>/,
  `<h1 className="font-sans text-[18px] font-bold tracking-tight">Super Admin Hub</h1>`
);

// Replace Logout button in AdminDashboard
content = content.replace(
  /<button\s+onClick=\{\(\) => onNavigate\('user-dashboard'\)\}\s+className="flex items-center gap-2 text-white\/70 hover:text-black dark:text-white"\s*>\s*<LogOut className="w-4 h-4" \/>\s*Exit\s*<\/button>/,
  `<button onClick={() => onNavigate('user-dashboard')} className="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white font-medium text-[14px] bg-black/5 dark:bg-white/5 px-4 py-2 rounded-[12px]"><LogOut className="w-4 h-4" /> Exit</button>`
);

fs.writeFileSync('src/views/AdminDashboard.tsx', content);
console.log('Patched AdminDashboard header');
