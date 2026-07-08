const fs = require('fs');
let file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    return;
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchProducts();
        setForm(defaultForm);
        setEditingProduct(null);
      }
    } catch (e) {
      console.error(e);
    }`;

content = content.replace(oldCode, "    return;");

fs.writeFileSync(file, content);
