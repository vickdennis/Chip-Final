const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

const oldTabs = '<div className="flex gap-4 mb-6 border-b border-[#cfc4c5] dark:border-[#333]">';
const newTabs = '<div className="flex gap-4 mb-6 border-b border-[#cfc4c5] dark:border-[#333] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>';
code = code.replace(oldTabs, newTabs);

fs.writeFileSync('src/views/AdminDashboard.tsx', code);
