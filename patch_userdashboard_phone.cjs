const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const targetStr = `<div className="space-y-2">
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profile.phone_number || ''}
                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl focus:border-black dark:focus:border-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>`;

const replacement = `<div className="space-y-2 md:col-span-2">
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase tracking-widest mb-3">Phone Numbers</label>
                      <div className="flex flex-col gap-2">
                        {(() => {
                          const val = profile.phone_number || '';
                          let arr = [''];
                          try {
                            const parsed = JSON.parse(val);
                            if (Array.isArray(parsed)) arr = parsed;
                            else if (val.includes(',')) arr = val.split(',').map(s => s.trim());
                            else arr = [val];
                          } catch(e) {
                            if (val.includes(',')) arr = val.split(',').map(s => s.trim());
                            else arr = val ? [val] : [''];
                          }
                          if (arr.length === 0) arr = [''];

                          return arr.map((phone, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => {
                                  const newArr = [...arr];
                                  newArr[idx] = e.target.value;
                                  setProfile({ ...profile, phone_number: JSON.stringify(newArr) });
                                }}
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-2.5 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl focus:border-black dark:focus:border-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                              />
                              {arr.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newArr = arr.filter((_, i) => i !== idx);
                                    setProfile({ ...profile, phone_number: JSON.stringify(newArr) });
                                  }}
                                  className="w-10 h-10 shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )).concat(
                            <button
                              key="add-btn"
                              type="button"
                              onClick={() => {
                                setProfile({ ...profile, phone_number: JSON.stringify([...arr, '']) });
                              }}
                              className="mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white rounded-xl text-[13px] font-bold font-mono transition-colors"
                            >
                              <Plus className="w-4 h-4" /> Add Phone Number
                            </button>
                          );
                        })()}
                      </div>
                    </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log('Patched UserDashboard.tsx');
} else {
  console.log('Failed to find target in UserDashboard.tsx');
}
