const fs = require('fs');
let file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

// The alert in fetchProducts was incorrectly placed
content = content.replace(
  /console\.error\(e\);\s*alert\('Error saving product: ' \+ e\.message\);/g,
  "console.error(e);"
);

content = content.replace(
  "const handleSave = async (e: React.FormEvent) => {",
  `const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Product saved successfully!');
        fetchProducts();
        setForm(defaultForm);
        setEditingProduct(null);
      } else {
        const errorData = await res.json();
        alert('Error saving product: ' + (errorData.error || res.statusText));
      }
    } catch (e: any) {
      console.error(e);
      alert('Error saving product: ' + e.message);
    }
    return;
`
);

fs.writeFileSync(file, content);
