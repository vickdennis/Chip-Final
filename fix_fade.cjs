const fs = require('fs');

let code = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const oldFade = `<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>`;
const newFade = `<div className="absolute inset-0" style={{ background: \`linear-gradient(to top, \${customBg} 0%, \${customBg}66 50%, transparent 100%)\` }}></div>`;

code = code.replace(oldFade, newFade);

fs.writeFileSync('src/views/PublicProfileView.tsx', code);
console.log("Fixed gradient fade");
