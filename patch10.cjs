const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldModalPreview = `            {/* Preview Section */}
            <div className={\`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border \${currentLink.size === 'Big' ? 'aspect-[4/3] border-white/10' : currentLink.size === 'Medium' ? 'aspect-[2/1] border-white/10' : currentLink.size === 'Small' ? 'h-24 border-white/10' : 'h-16 border-white/10'}\`}
                 style={{ 
                   background: (currentLink.size === 'Big' && coverUrl) 
                     ? \`url('\${coverUrl}') center/cover\` 
                     : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>`;

const newModalPreview = `            {/* Preview Section */}
            <div className={\`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border \${currentLink.size === 'Big' ? 'aspect-[4/3] border-white/10' : currentLink.size === 'Medium' ? 'aspect-[2/1] border-white/10' : currentLink.size === 'Small' ? 'h-24 border-white/10' : 'h-16 border-white/10'}\`}
                 style={{ 
                   background: 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>
                 
                 {currentLink.size === 'Big' && coverUrl && (
                   <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 bg-black/50 z-10 overflow-hidden flex items-center justify-center">
                     <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                   </div>
                 )}`;

code = code.replace(oldModalPreview, newModalPreview);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
