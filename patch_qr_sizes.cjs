const fs = require('fs');

function patchPublicProfile() {
  let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');
  content = content.replace(/size=\{130\}/g, 'size={100} marginSize={1}');
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
}

function patchUserDashboard() {
  let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');
  content = content.replace(/size=\{40\}/g, 'size={32} marginSize={1}');
  // Update image settings to fit smaller size
  content = content.replace(/height: 12,\s*width: 12/g, 'height: 10, width: 10');
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
}

patchPublicProfile();
patchUserDashboard();
console.log("Sizes patched");
