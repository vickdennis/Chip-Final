const fs = require('fs');
let code = fs.readFileSync('src/views/EnterpriseDashboard.tsx', 'utf8');

let navOld = '<nav className="flex flex-col gap-2">';
let navNew = '<nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide [&::-webkit-scrollbar]:hidden pb-2 md:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>';
code = code.replace(navOld, navNew);

let btnOld = "className={`flex items-center gap-3 px-4 py-3 text-left w-full font-mono text-[12px] uppercase font-bold tracking-widest rounded-sm transition-colors ${activeTab === item.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-[#f3f3f4] dark:hover:bg-[#111] text-[#4c4546] dark:text-[#a0a0a0]'}`}";
let btnNew = "className={`flex items-center gap-3 px-4 py-3 text-left w-auto md:w-full shrink-0 md:shrink font-mono text-[12px] uppercase font-bold tracking-widest rounded-sm transition-colors ${activeTab === item.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-[#f3f3f4] dark:hover:bg-[#111] text-[#4c4546] dark:text-[#a0a0a0]'}`}";
code = code.replace(btnOld, btnNew);

fs.writeFileSync('src/views/EnterpriseDashboard.tsx', code);
