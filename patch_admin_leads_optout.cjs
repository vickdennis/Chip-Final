const fs = require('fs');
let code = fs.readFileSync('src/views/AdminLeadsManager.tsx', 'utf8');

const thOld = `<th className="p-3 font-medium">Action</th>`;
const thNew = `<th className="p-3 font-medium text-right">Action</th>`;
code = code.replace(thOld, thNew);

const tdOld = `<td className="p-3">
                    <a 
                      href={\`https://wa.me/\${lead.whatsapp.replace('+', '')}\`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#25D366]/20 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> Chat
                    </a>
                  </td>`;

const tdNew = `<td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/broadcast/toggle-optout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ lead_id: lead.id, opt_out: lead.opt_out === 1 ? 0 : 1 })
                            });
                            fetchLeads();
                          } catch(e) { console.error(e); }
                        }}
                        className={\`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border \${lead.opt_out === 1 ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-[#cfc4c5] dark:border-[#333] text-[#7e7576] hover:bg-gray-50'}\`}
                      >
                        {lead.opt_out === 1 ? 'Opted Out' : 'Active'}
                      </button>
                      <a 
                        href={\`https://wa.me/\${lead.whatsapp.replace(/[^0-9]/g, '')}\`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#25D366]/20 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat
                      </a>
                    </div>
                  </td>`;

code = code.replace(tdOld, tdNew);

fs.writeFileSync('src/views/AdminLeadsManager.tsx', code);
