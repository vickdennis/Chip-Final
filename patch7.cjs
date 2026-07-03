const fs = require('fs');
let code = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf8');

const oldLinkRender = `                {links.length > 0 ? links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url?.startsWith('http') ? link.url : \`https://\${link.url}\`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#141414] border border-[#2a2a2a] text-white p-4 rounded-xl shadow-sm hover:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center w-full group"
                  >
                    <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/10 transition-colors" style={{ backgroundColor: enterpriseColor ? \`\${enterpriseColor}40\` : undefined, color: enterpriseColor || undefined }}>
                      <LinkIcon className="w-4 h-4 text-white" style={{ color: enterpriseColor || undefined }} />
                    </div>
                    <h2 className="font-sans text-[15px] font-medium flex-1 truncate">{link.label}</h2>
                    <ExternalLink className="w-4 h-4 text-[#707070] flex-shrink-0 ml-2 group-hover:text-white transition-colors" />
                  </a>
                )) : (`;

const newLinkRender = `                {links.length > 0 ? links.map((link, i) => {
                  const href = link.url?.startsWith('http') ? link.url : \`https://\${link.url}\`;
                  let iconUrl = link.image_url;
                  if (!iconUrl && link.use_link_icon && link.url) {
                    try { iconUrl = \`https://icon.horse/icon/\${(link.url.replace(/^https?:\\/\\//, '').split('/')[0])}\`; } catch(e){}
                  }
                  
                  if (link.size === 'Big') {
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
                  }
                  
                  if (link.size === 'Medium') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         className="bg-[#141414] border border-[#2a2a2a] text-white p-4 rounded-2xl shadow-sm hover:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center w-full group overflow-hidden relative">
                         {iconUrl ? (
                           <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden mr-4">
                             <img src={iconUrl} alt="" className="w-full h-full object-cover" />
                           </div>
                         ) : (
                           <div className="w-12 h-12 bg-[#2a2a2a] rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:bg-white/10 transition-colors" style={{ backgroundColor: enterpriseColor ? \`\${enterpriseColor}40\` : undefined, color: enterpriseColor || undefined }}>
                              <LinkIcon className="w-5 h-5 text-white" style={{ color: enterpriseColor || undefined }} />
                           </div>
                         )}
                         <div className="flex flex-col flex-1 truncate">
                           <h2 className="font-sans text-[16px] font-bold truncate">{link.label}</h2>
                           <span className="text-[12px] text-white/50 truncate mt-1">{link.url.replace(/^https?:\\/\\//, '')}</span>
                         </div>
                         <ExternalLink className="w-4 h-4 text-[#707070] flex-shrink-0 ml-4 group-hover:text-white transition-colors" />
                      </a>
                    );
                  }
                  
                  if (link.size === 'Small') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         className="bg-[#141414] border border-[#2a2a2a] text-white p-3 rounded-xl shadow-sm hover:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center w-full group">
                         {iconUrl ? (
                           <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden mr-3">
                             <img src={iconUrl} alt="" className="w-full h-full object-cover" />
                           </div>
                         ) : (
                           <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center mr-3 shrink-0 group-hover:bg-white/10 transition-colors" style={{ backgroundColor: enterpriseColor ? \`\${enterpriseColor}40\` : undefined, color: enterpriseColor || undefined }}>
                              <LinkIcon className="w-4 h-4 text-white" style={{ color: enterpriseColor || undefined }} />
                           </div>
                         )}
                         <h2 className="font-sans text-[14px] font-medium flex-1 truncate">{link.label}</h2>
                         <ExternalLink className="w-4 h-4 text-[#707070] flex-shrink-0 ml-2 group-hover:text-white transition-colors" />
                      </a>
                    );
                  }

                  // Default Button size
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                       className="bg-[#141414] border border-[#2a2a2a] text-white p-4 rounded-xl shadow-sm hover:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full group relative">
                       <h2 className="font-sans text-[15px] font-medium truncate text-center">{link.label}</h2>
                    </a>
                  );
                }) : (`;

code = code.replace(oldLinkRender, newLinkRender);
fs.writeFileSync('src/views/PublicProfileView.tsx', code);
