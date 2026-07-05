const fs = require('fs');
let code = fs.readFileSync('src/views/AdminLeadsManager.tsx', 'utf8');

const thOld = `<th className="p-3 font-medium">Source Blog</th>`;
const thNew = `<th className="p-3 font-medium">Source Blog</th>
                <th className="p-3 font-medium">Variant</th>`;
code = code.replace(thOld, thNew);

const tdOld = `<td className="p-3 text-xs text-[#7e7576]">
                    <div className="flex flex-col">
                      <span>/{lead.post_slug}</span>
                      <span className="opacity-50 text-[10px]">via {lead.source}</span>
                    </div>
                  </td>`;
const tdNew = `<td className="p-3 text-xs text-[#7e7576]">
                    <div className="flex flex-col">
                      <span>/{lead.post_slug}</span>
                      <span className="opacity-50 text-[10px]">via {lead.source}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{lead.clicked_variant || '-'}</td>`;
code = code.replace(tdOld, tdNew);

fs.writeFileSync('src/views/AdminLeadsManager.tsx', code);
