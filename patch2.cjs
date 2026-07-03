const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldExternalLinksSection = `            {/* Links */}
            <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">External Links</h3>
                <button 
                  onClick={() => setLinks([...links, { label: '', url: '' }])}
                  className="text-black dark:text-white hover:underline font-mono text-[12px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {links.map((item, i) => (
                  <div key={i} className="border border-[#cfc4c5] dark:border-[#333] rounded-sm p-4 bg-[#f9f9f9] dark:bg-[#1a1a1a] hover:border-[#7e7576] transition-colors group flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="cursor-move text-[#7e7576] opacity-40 group-hover:opacity-100">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <input 
                          type="text" 
                          value={item.label}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[i].label = e.target.value;
                            setLinks(newLinks);
                          }}
                          placeholder="Link Title"
                          className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none font-sans text-[14px] text-black dark:text-white"
                        />
                        <input 
                          type="text" 
                          value={item.url}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[i].url = e.target.value;
                            setLinks(newLinks);
                          }}
                          placeholder="https://"
                          className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none font-sans text-[13px] text-[#4c4546] dark:text-[#a0a0a0]"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <button 
                        onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                        className="p-2 text-[#7e7576] hover:text-[#ba1a1a] transition-colors rounded-sm hover:bg-[#ffdad6]"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-6 text-[#7e7576] font-mono text-[13px]">
                    No links added. Click 'Add Link' to get started.
                  </div>
                )}
              </div>
            </section>`;

const newExternalLinksSection = `            {/* Links */}
            <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">External Links</h3>
                <button 
                  onClick={() => {
                    setCurrentLink({ label: '', url: '', size: 'Button', use_link_icon: false });
                    setEditingLinkIndex(null);
                    setIsLinkModalOpen(true);
                  }}
                  className="text-black dark:text-white hover:underline font-mono text-[12px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {links.map((item, i) => (
                  <div key={i} className="border border-[#cfc4c5] dark:border-[#333] rounded-sm p-4 bg-[#f9f9f9] dark:bg-[#1a1a1a] hover:border-[#7e7576] transition-colors group flex items-center justify-between cursor-pointer" onClick={() => {
                    setCurrentLink({ ...item, size: item.size || 'Button', use_link_icon: item.use_link_icon || false });
                    setEditingLinkIndex(i);
                    setIsLinkModalOpen(true);
                  }}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="cursor-move text-[#7e7576] opacity-40 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-black dark:text-white text-sm">{item.label || 'Untitled Link'}</div>
                        <div className="text-xs text-[#7e7576] mt-1">{item.url}</div>
                      </div>
                      <div className="flex items-center gap-3 mr-4">
                        <span className="text-xs font-mono px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">{item.size || 'Button'}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinks(links.filter((_, idx) => idx !== i));
                        }}
                        className="p-2 text-[#7e7576] hover:text-[#ba1a1a] transition-colors rounded-sm hover:bg-[#ffdad6]"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-6 text-[#7e7576] font-mono text-[13px]">
                    No links added. Click 'Add Link' to get started.
                  </div>
                )}
              </div>
            </section>`;

code = code.replace(oldExternalLinksSection, newExternalLinksSection);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
