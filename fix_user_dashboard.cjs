const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const target = `<button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 md:flex-none px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-[14px] hover:opacity-90 transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-black/10 dark:shadow-white/10"
              className="hidden"
            >`;

const replacement = `<button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 md:flex-none px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-[14px] hover:opacity-90 transition-all rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-black/5 dark:shadow-white/5 active:scale-[0.98]"
            >`;

content = content.replace(target, replacement);

const targetAdminBtn = `<button 
                onClick={() => onNavigate('admin-dashboard')}
                className="flex-1 md:flex-none px-5 py-2.5 bg-yellow-400 text-black dark:text-white font-mono text-[13px] font-medium hover:bg-yellow-500 transition-colors rounded-xl flex items-center justify-center gap-2"
              >`;
              
const replacementAdminBtn = `<button 
                onClick={() => onNavigate('admin-dashboard')}
                className="flex-1 md:flex-none px-5 py-2.5 bg-[#f4f4f5] dark:bg-[#1a1a1a] text-black dark:text-white font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-all rounded-[14px] flex items-center justify-center gap-2 border border-black/5 dark:border-white/5 active:scale-[0.98]"
              >`;

content = content.replace(targetAdminBtn, replacementAdminBtn);

const targetPreviewBtn = `<button 
              onClick={() => onNavigate('public-profile')}
              className="flex-1 md:flex-none px-5 py-2.5 border border-black/10 dark:border-white/10 text-black dark:text-white bg-white/40 dark:bg-black/40 backdrop-blur-xl font-mono text-[13px] font-medium hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors rounded-xl flex items-center justify-center gap-2"
            >`;
            
const replacementPreviewBtn = `<button 
              onClick={() => onNavigate('public-profile')}
              className="flex-1 md:flex-none px-5 py-2.5 border border-black/5 dark:border-white/5 text-black dark:text-white bg-white dark:bg-[#1a1a1a] shadow-sm shadow-black/5 font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-all rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98]"
            >`;
            
content = content.replace(targetPreviewBtn, replacementPreviewBtn);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
