const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}/g, 'overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}');
  fs.writeFileSync(file, code);
}

fixFile('src/views/UserDashboard.tsx');
fixFile('src/views/AdminDashboard.tsx');
