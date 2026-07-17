const fs = require('fs');

function patchFile(filePath, searchRegex, replaceFn) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = replaceFn(content);
  fs.writeFileSync(filePath, content);
}

patchFile('src/views/PublicProfileView.tsx', null, (content) => {
  return content.replace(
    /const downloadVCard = \(\) => {[\s\S]*?END:VCARD`;\s*const blob = new Blob/,
    `const downloadVCard = async () => {
    if (!profile) return;
    
    let photoStr = "";
    if (profile.cover_image_url) {
      try {
        const response = await fetch(profile.cover_image_url);
        const blob = await response.blob();
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const parts = base64data.split(',');
        if (parts.length === 2) {
          const mimeTypeMatch = parts[0].match(/:(.*?);/);
          const type = mimeTypeMatch ? mimeTypeMatch[1].split('/')[1].toUpperCase() : 'JPEG';
          photoStr = \`\\nPHOTO;ENCODING=b;TYPE=\${type}:\${parts[1]}\`;
        }
      } catch (err) {
        console.warn("Failed to fetch profile image for vCard", err);
        // Fallback to URI method if fetch fails (e.g., due to CORS)
        photoStr = \`\\nPHOTO;VALUE=URI:\${profile.cover_image_url}\`;
      }
    }

    const vcard = \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${profile.full_name || ''}\\nTITLE:\${profile.headline || ''}\\nEMAIL;TYPE=WORK,INTERNET:\${profile.contact_email || profile.email || ''}\\nTEL;TYPE=CELL:\${profile.phone_number || ''}\\nADR;TYPE=WORK:;;\${profile.address || ''};;;;\\nURL:https://chipng.com/\${profile.username}\${photoStr}\\nEND:VCARD\`;
    
    const blob = new Blob`
  );
});

patchFile('src/views/UserDashboard.tsx', null, (content) => {
  return content.replace(
    /const handleDownloadVCard = \(\) => {[\s\S]*?END:VCARD`;\s*const blob = new Blob/,
    `const handleDownloadVCard = async () => {
    if (!profile) return;
    
    let photoStr = "";
    if (profile.cover_image_url) {
      try {
        const response = await fetch(profile.cover_image_url);
        const blob = await response.blob();
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const parts = base64data.split(',');
        if (parts.length === 2) {
          const mimeTypeMatch = parts[0].match(/:(.*?);/);
          const type = mimeTypeMatch ? mimeTypeMatch[1].split('/')[1].toUpperCase() : 'JPEG';
          photoStr = \`\\nPHOTO;ENCODING=b;TYPE=\${type}:\${parts[1]}\`;
        }
      } catch (err) {
        console.warn("Failed to fetch profile image for vCard", err);
        photoStr = \`\\nPHOTO;VALUE=URI:\${profile.cover_image_url}\`;
      }
    }

    const vcard = \`BEGIN:VCARD\\nVERSION:3.0\\nN:\${profile.full_name}\\nFN:\${profile.full_name}\\nTITLE:\${profile.headline}\\nEMAIL;TYPE=WORK,INTERNET:\${profile.contact_email || profile.email}\\nTEL;TYPE=CELL:\${profile.phone_number || ''}\\nADR;TYPE=WORK:;;\${profile.address || ''};;;;\\nURL:https://chipng.com/\${profile.username}\${photoStr}\\nEND:VCARD\`;
    
    const blob = new Blob`
  );
});

console.log("Patched!");
