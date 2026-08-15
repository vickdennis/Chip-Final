const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const targetVcard = "`BEGIN:VCARD\\nVERSION:3.0\\nFN:${profile.full_name || ''}\\nTITLE:${profile.headline || ''}\\nEMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email || ''}\\nTEL;TYPE=CELL:${profile.phone_number || ''}\\nADR;TYPE=WORK:;;${profile.address || ''};;;;\\nURL:https://chipng.com/${profile.username}${photoStr}\\nEND:VCARD`;"

const replacementVcard = `(() => {
      let phonesStr = \`\\nTEL;TYPE=CELL:\${profile.phone_number || ''}\`;
      if (profile.phone_number) {
        let arr = [];
        try {
          const parsed = JSON.parse(profile.phone_number);
          if (Array.isArray(parsed)) arr = parsed;
          else if (profile.phone_number.includes(',')) arr = profile.phone_number.split(',').map(s=>s.trim());
          else arr = [profile.phone_number];
        } catch(e) {
          if (profile.phone_number.includes(',')) arr = profile.phone_number.split(',').map(s=>s.trim());
          else arr = [profile.phone_number];
        }
        if (arr.filter(Boolean).length > 0) {
          phonesStr = arr.filter(Boolean).map(p => \`\\nTEL;TYPE=CELL:\${p}\`).join('');
        }
      }
      return \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${profile.full_name || ''}\\nTITLE:\${profile.headline || ''}\\nEMAIL;TYPE=WORK,INTERNET:\${profile.contact_email || profile.email || ''}\${phonesStr}\\nADR;TYPE=WORK:;;\${profile.address || ''};;;;\\nURL:https://chipng.com/\${profile.username}\${photoStr}\\nEND:VCARD\`;
    })();`

if (content.includes(targetVcard)) {
  content = content.replace(targetVcard, replacementVcard);
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
  console.log("Patched vcard successfully.");
} else {
  console.log("Failed to patch vcard. Target not found.");
}
