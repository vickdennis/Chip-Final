const fs = require('fs');
const file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("if (res.ok) {",
`if (res.ok) {
        alert('Product saved successfully!');`);

content = content.replace("console.error(e);",
`console.error(e);
      alert('Error saving product: ' + e.message);`);

fs.writeFileSync(file, content);
