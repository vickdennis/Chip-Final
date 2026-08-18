const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const profileViews = `
          {/* Right Column */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            {/* Profile Views */}
            <section className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl flex flex-col">
              <div className="border-b border-black/10 dark:border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Analytics</h3>
                <Activity className="w-[18px] h-[18px] text-black/60 dark:text-white/60" />
              </div>
              <div className="p-6">
                <div className="text-black/40 dark:text-white/40 font-mono text-[11px] font-bold uppercase tracking-widest mb-4">Total Profile Views</div>
                <div className="text-5xl font-sans font-bold flex items-center gap-2 text-black dark:text-white">
                  {profileViews} <Eye className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </section>
`;

let restoreRightCol = fs.readFileSync('restore_right_col.txt', 'utf-8');
// remove the last line {/* End of right column */} from restore_right_col
restoreRightCol = restoreRightCol.replace('            {/* End of right column */}', '');

const toInsert = profileViews + restoreRightCol;

const target = `            {/* End of right column */}`;

if (code.includes(target)) {
    code = code.replace(target, toInsert + '\n' + target);
    fs.writeFileSync('src/views/UserDashboard.tsx', code);
    console.log('Restored Right Column');
} else {
    console.log('Target not found');
}
