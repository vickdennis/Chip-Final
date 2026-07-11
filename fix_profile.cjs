const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf8');
content = content.replace(
  '<h1 className="font-display text-4xl font-black mb-2 text-black">Profile Not Found</h1>',
  '<h1 className="font-display text-4xl font-black mb-2 text-white">Profile Not Found</h1>'
);
content = content.replace(
  'className="px-6 py-2 bg-black text-white font-mono text-[13px] font-bold rounded-xl uppercase tracking-widest hover:bg-black/90 transition-colors"',
  'className="px-6 py-2 bg-white text-black font-mono text-[13px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-colors"'
);
fs.writeFileSync('src/views/PublicProfileView.tsx', content);
