const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const target1 = `{showQR ? (`;
const replace1 = `{qrMode !== 'none' ? (`;

const target2 = `value={\`https://chipng.com/\${profile.username || ''}\`}`;
const replace2 = `value={qrMode === 'bio' ? \`https://chipng.com/\${profile.username || ''}\` : \`https://chipng.com/\${profile.username || ''}/vcard\`}`;

let changed = false;

if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replace1);
  content = content.replace(target2, replace2);
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
  console.log("Patched successfully");
} else {
  console.log("Could not find targets");
}
