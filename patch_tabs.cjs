const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldTabs = '<div className="flex border-b border-[#cfc4c5] dark:border-[#333] mb-8">';
const newTabs = '<div className="flex border-b border-[#cfc4c5] dark:border-[#333] mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>';
code = code.replace(oldTabs, newTabs);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
