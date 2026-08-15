const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const targetStr = `<a 
                    href={\`/\${profile.username || ''}\`}
                    target="_blank"
                    className="mt-1 text-[#0066cc] font-mono text-[11px] text-center hover:underline bg-black/5 dark:bg-white/5 py-1.5 rounded-xl"
                  >
                    https://chipng.com/{profile.username || 'username'}
                  </a>`;

const replaceStr = `<a 
                    href={\`/\${profile.username || ''}\`}
                    target="_blank"
                    className="mt-1 text-[#0066cc] font-mono text-[11px] text-center hover:underline bg-black/5 dark:bg-white/5 py-1.5 rounded-xl"
                  >
                    https://chipng.com/{profile.username || 'username'}
                  </a>
                  <div className="mt-1 flex flex-col w-full bg-black/5 dark:bg-white/5 py-1.5 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-black/50 dark:text-white/50 tracking-widest text-center mb-0.5">Direct vCard Download Link</span>
                    <a 
                      onClick={(e) => {
                         e.preventDefault();
                         navigator.clipboard.writeText(\`https://chipng.com/\${profile.username}/vcard\`);
                         alert("vCard Download Link copied to clipboard! Anyone who clicks this link will automatically download your vCard.");
                      }}
                      href={\`/\${profile.username || ''}/vcard\`}
                      className="text-[#0066cc] font-mono text-[11px] text-center hover:underline cursor-pointer"
                    >
                      https://chipng.com/{profile.username || 'username'}/vcard
                    </a>
                  </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log('UserDashboard.tsx patched');
} else {
  console.log('Could not find target string in UserDashboard.tsx');
}
