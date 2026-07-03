const fs = require('fs');
let code = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf8');

const oldBigLink = `                  if (link.size === 'Big') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         className="relative w-full aspect-[4/3] sm:aspect-[2/1] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 group border border-white/10 hover:border-white/30 transition-all shadow-md"
                         style={{ background: (link.cover_image_url || coverUrl) ? \`url('\${link.cover_image_url || coverUrl}') center/cover\` : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' }}>
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                        {iconUrl && (
                          <div className="absolute top-4 left-4 w-10 h-10 rounded-full border border-white/20 bg-black/50 p-[2px] z-10 shadow-lg overflow-hidden flex items-center justify-center">
                             <img src={iconUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          </div>
                        )}
                        <h2 className="relative z-10 font-sans text-xl sm:text-2xl font-bold text-white shadow-sm mt-auto w-full text-center truncate px-4">{link.label}</h2>
                      </a>
                    );
                  }`;

const newBigLink = `                  if (link.size === 'Big') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         className="relative w-full aspect-[4/3] sm:aspect-[2/1] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 group border border-white/10 hover:border-white/30 transition-all shadow-md"
                         style={{ background: 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' }}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        
                        {coverUrl && (
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 bg-black/50 z-10 shadow-lg overflow-hidden flex items-center justify-center">
                            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        {iconUrl && (
                          <div className="relative w-16 h-16 rounded-full border border-white/20 bg-black/50 p-[2px] z-10 shadow-lg overflow-hidden flex items-center justify-center mb-4">
                             <img src={iconUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          </div>
                        )}
                        <h2 className="relative z-10 font-sans text-xl sm:text-2xl font-bold text-white shadow-sm mt-auto w-full text-center truncate px-4">{link.label}</h2>
                      </a>
                    );
                  }`;

code = code.replace(oldBigLink, newBigLink);
fs.writeFileSync('src/views/PublicProfileView.tsx', code);
