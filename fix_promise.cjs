const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /const base64data = await new Promise\(\(resolve\) => {/,
    'const base64data = await new Promise<string>((resolve) => {'
  );
  content = content.replace(
    /reader\.onloadend = \(\) => resolve\(reader\.result\);/,
    'reader.onloadend = () => resolve(reader.result as string);'
  );
  fs.writeFileSync(filePath, content);
}

patchFile('src/views/PublicProfileView.tsx');
patchFile('src/views/UserDashboard.tsx');

console.log("Fixed promise typings.");
