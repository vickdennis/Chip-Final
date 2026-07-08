const fs = require('fs');
let file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "      if (res.ok) {\n        alert('Product saved successfully!');\n        setProducts(await res.json());\n      }",
  "      if (res.ok) {\n        setProducts(await res.json());\n      }"
);

fs.writeFileSync(file, content);
