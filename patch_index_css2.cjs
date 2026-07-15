const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf-8');

const targetCSS = `.hero-heading {
  background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`;

const newCSS = `.hero-heading {
  background: linear-gradient(180deg, #111111 0%, #555555 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark .hero-heading {
  background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`;

if (content.includes(targetCSS)) {
  content = content.replace(targetCSS, newCSS);
  fs.writeFileSync('src/index.css', content);
  console.log("Patched index.css");
} else {
  console.log("Not found in index.css");
}
