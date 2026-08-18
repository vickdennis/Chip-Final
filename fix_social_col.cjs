const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const oldStr = `        ) : profile && activeTab === 'social' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
            {/* Social Media */}`;
const newStr = `        ) : profile && activeTab === 'social' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
            {/* Social Media */}`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
