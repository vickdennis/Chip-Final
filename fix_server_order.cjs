const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const seoApiMatch = `// SEO Keywords API`;
const listenMatch = `app.listen(PORT, "0.0.0.0", () => {`;

if (code.indexOf(seoApiMatch) > code.indexOf('app.use(vite.middlewares)') || code.indexOf(seoApiMatch) > code.indexOf("app.get('*'")) {
  // Extract all the SEO endpoints block
  const seoEndpointsStr = code.substring(code.indexOf(seoApiMatch), code.indexOf(listenMatch));
  
  // Remove them from the bottom
  code = code.replace(seoEndpointsStr, "");
  
  // Insert them before Vite middleware
  const target = `if (process.env.NODE_ENV !== "production") {`;
  code = code.replace(target, seoEndpointsStr + "\n  " + target);
  
  fs.writeFileSync('server.ts', code);
  console.log("Fixed!");
} else {
  console.log("Already correct?");
}
