const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('<QRCodeSVG') && !content.includes('level="H"')) {
    content = content.replace(/<QRCodeSVG/g, '<QRCodeSVG level="H"');
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  } else {
    console.log(`No patch needed for ${file}`);
  }
}

patchFile('src/views/UserDashboard.tsx');
patchFile('src/views/PublicProfileView.tsx');
