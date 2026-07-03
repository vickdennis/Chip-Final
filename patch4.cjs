const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const urlEffect = `
  useEffect(() => {
    if (currentLink.url && !currentLink.image_url && currentLink.use_link_icon) {
      try {
        const urlObj = new URL(currentLink.url.startsWith('http') ? currentLink.url : \`https://\${currentLink.url}\`);
        const hostname = urlObj.hostname;
        // Basic favicon grab
        // We won't automatically set image_url because that would upload/save it.
        // We can just rely on the UI to show it if image_url is empty.
      } catch(e) {}
    }
  }, [currentLink.url, currentLink.use_link_icon]);
`;

code = code.replace('  // Crop state', urlEffect + '\n  // Crop state');
fs.writeFileSync('src/views/UserDashboard.tsx', code);
