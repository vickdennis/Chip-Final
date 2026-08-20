const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// Replace PREMIUM_THEMES with PROFILE_LAYOUTS
const layoutsDef = `
export const PROFILE_LAYOUTS = [
  { id: 'classic', name: 'Classic', description: 'Standard vertical layout.' },
  { id: 'bento', name: 'Bento Grid', description: 'Modern grid-based layout.' },
  { id: 'split', name: 'Split View', description: 'Side-by-side profile and links.' },
  { id: 'minimal', name: 'Minimalist', description: 'Clean text-focused design.' },
  { id: 'carousel', name: 'Carousel', description: 'Horizontal swipeable cards.' }
];`;

const themesRegex = /export const PREMIUM_THEMES = \[\s*\{.*\}\s*\];/s;
code = code.replace(themesRegex, layoutsDef);

// Find the section to replace
const sectionStart = `<section className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl flex flex-col">\n                <div className="border-b border-black/10 dark:border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">\n                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Premium Themes & Layouts</h3>`;
const sectionEndStr = `                <section className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl flex flex-col">\n                <div className="border-b border-black/10 dark:border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">\n                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Order NFC Card</h3>`;

const startIdx = code.indexOf(sectionStart);
const endIdx = code.indexOf(sectionEndStr);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find replacement section");
  process.exit(1);
}

const replacement = `<section className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl flex flex-col">
                <div className="border-b border-black/10 dark:border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Public Profile Layout & Color</h3>
                </div>
                <div className="p-6 flex flex-col gap-8">
                  {/* Background Color Picker */}
                  <div>
                    <label className="block text-sm font-bold text-black dark:text-white mb-3">Background Color</label>
                    <div className="flex flex-wrap gap-3">
                      {COLOR_PRESETS.map(color => (
                        <button
                          key={color}
                          onClick={() => { setProfile({ ...profile, bg_color: color }); }}
                          className={\`w-10 h-10 rounded-full border-2 transition-all \${profile.bg_color === color ? 'border-black dark:border-white scale-110 shadow-lg' : 'border-transparent shadow-sm'}\`}
                          style={{ backgroundColor: color }}
                          aria-label={\`Select color \${color}\`}
                        />
                      ))}
                    </div>
                    <p className="text-[13px] text-black/50 dark:text-white/50 mt-3">Text colors will automatically adjust to remain visible based on your selected background.</p>
                  </div>
                  
                  {/* Profile Layout Grid */}
                  <div>
                    <label className="block text-sm font-bold text-black dark:text-white mb-3">Profile Layout</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {PROFILE_LAYOUTS.map(layout => {
                        const isActive = profile.theme === layout.id || (layout.id === 'classic' && !profile.theme);
                        return (
                          <div 
                            key={layout.id} 
                            onClick={() => { setProfile({ ...profile, theme: layout.id }); }}
                            className={\`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-between gap-3 transition-all \${isActive ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 ring-1 ring-black dark:ring-white' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'}\`}
                          >
                            <div className="w-16 h-20 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md flex flex-col p-1.5 shadow-sm text-black dark:text-white">
                              {layout.id === 'classic' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="25" r="14" />
                                  <line x1="20" y1="55" x2="80" y2="55" />
                                  <line x1="20" y1="75" x2="80" y2="75" />
                                  <line x1="20" y1="95" x2="80" y2="95" />
                                </svg>
                              )}
                              {layout.id === 'bento' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="20" r="12" />
                                  <rect x="15" y="45" width="30" height="30" rx="6" />
                                  <rect x="55" y="45" width="30" height="30" rx="6" />
                                  <rect x="15" y="85" width="70" height="25" rx="6" />
                                </svg>
                              )}
                              {layout.id === 'split' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="10" y="10" width="80" height="35" rx="6" fill="currentColor" fillOpacity="0.2" stroke="none" />
                                  <circle cx="50" cy="27" r="10" />
                                  <line x1="20" y1="65" x2="80" y2="65" />
                                  <line x1="20" y1="85" x2="80" y2="85" />
                                  <line x1="20" y1="105" x2="80" y2="105" />
                                </svg>
                              )}
                              {layout.id === 'minimal' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="25" cy="30" r="12" />
                                  <line x1="50" y1="25" x2="85" y2="25" />
                                  <line x1="50" y1="38" x2="75" y2="38" />
                                  <line x1="20" y1="65" x2="80" y2="65" strokeWidth="3" />
                                  <line x1="20" y1="85" x2="80" y2="85" strokeWidth="3" />
                                  <line x1="20" y1="105" x2="80" y2="105" strokeWidth="3" />
                                </svg>
                              )}
                              {layout.id === 'carousel' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="25" r="14" />
                                  <line x1="30" y1="50" x2="70" y2="50" />
                                  <rect x="15" y="65" width="55" height="45" rx="6" />
                                  <rect x="80" y="65" width="20" height="45" rx="6" />
                                </svg>
                              )}
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-[12px] whitespace-nowrap">{layout.name}</h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">
                    <button onClick={handleSave} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold transition-opacity hover:opacity-90 text-[14px] flex items-center gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Appearance'}
                    </button>
                  </div>
                </div>
              </section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
console.log("Updated settings tab");
