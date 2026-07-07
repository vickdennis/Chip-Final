const fs = require('fs');

let content = fs.readFileSync('src/views/AdminBuyBoxManager.tsx', 'utf8');

// Replace textarea with a dynamic list
const benefitsTarget = `          <div>
            <label className="block font-mono text-[11px] font-bold text-white/60 uppercase mb-1">Benefits (JSON Array)</label>
            <textarea required value={form.benefits_json} onChange={e=>setForm({...form, benefits_json: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-xl text-[13px] h-20" />
          </div>`;

const newBenefits = `          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-mono text-[11px] font-bold text-white/60 uppercase">Benefits</label>
              <button type="button" onClick={() => {
                let current = [];
                try { current = JSON.parse(form.benefits_json); } catch(e) {}
                current.push('');
                setForm({...form, benefits_json: JSON.stringify(current)});
              }} className="text-xs text-blue-500 font-bold flex items-center">
                <Plus className="w-3 h-3 mr-1" /> Add Benefit
              </button>
            </div>
            {(() => {
               let benefits = [];
               try { benefits = JSON.parse(form.benefits_json); } catch(e) {}
               if (!Array.isArray(benefits)) benefits = [];
               return benefits.map((b, idx) => (
                 <div key={idx} className="flex gap-2 mb-2">
                   <input value={b} onChange={e => {
                     const newB = [...benefits];
                     newB[idx] = e.target.value;
                     setForm({...form, benefits_json: JSON.stringify(newB)});
                   }} className="w-full px-3 py-2 border border-white/10 bg-transparent rounded-xl text-[13px]" />
                   <button type="button" onClick={() => {
                     const newB = benefits.filter((_, i) => i !== idx);
                     setForm({...form, benefits_json: JSON.stringify(newB)});
                   }} className="text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ));
            })()}
          </div>`;

content = content.replace(benefitsTarget, newBenefits);

fs.writeFileSync('src/views/AdminBuyBoxManager.tsx', content);
