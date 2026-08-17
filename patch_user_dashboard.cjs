const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// Replace linear-gradient style button with sleek premium button style
content = content.replace(
  /style={{\s*background: 'linear-gradient[^}]+\s*boxShadow:[^}]+\s*}}/g,
  `className="flex-1 md:flex-none px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-[14px] hover:opacity-90 transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-black/10 dark:shadow-white/10"`
);

// Replace the previous text styling that might have been lost in replace
content = content.replace(
  /className="flex-1 md:flex-none px-5 py-2.5 text-black dark:text-white font-mono text-\[13px\] font-bold hover:scale-\[1.02\] hover:brightness-110 transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 border border-black\/10 dark:border-white\/10 cursor-pointer"/g,
  `className="hidden"` // Actually, since we injected a new className above, wait let's use a smarter replace
);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
console.log('Patched UserDashboard initial');
