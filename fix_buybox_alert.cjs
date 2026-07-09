const fs = require('fs');
let file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "      if (res.ok) {\n        alert('Product saved successfully!');\n        fetchProducts();\n        setForm(defaultForm);\n        setEditingProduct(null);\n      } else {\n        const errorData = await res.json();\n        alert('Error saving product: ' + (errorData.error || res.statusText));\n      }\n    } catch (e: any) {\n      console.error(e);\n      alert('Error saving product: ' + e.message);\n    }",
  `      if (res.ok) {
        alert('Product saved successfully!');
        fetchProducts();
        setForm(defaultForm);
        setEditingProduct(null);
      } else {
        const text = await res.text();
        let errorStr = res.statusText;
        try { errorStr = JSON.parse(text).error || errorStr; } catch(e) { errorStr = text.slice(0, 50) + "..."; }
        alert('Error saving product: ' + errorStr);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error saving product: ' + (e.message || e.toString()));
    }`
);

fs.writeFileSync(file, content);
