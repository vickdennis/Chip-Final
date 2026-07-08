const fs = require('fs');
let file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const newContent = content.replace(/    return;\n    e\.preventDefault\(\);\n    try \{\n      const res = await fetch\('\/api\/products', \{\n        method: 'POST',\n        headers: \{ 'Content-Type': 'application\/json' \},\n        body: JSON\.stringify\(form\)\n      \}\);\n      if \(res\.ok\) \{\n        fetchProducts\(\);\n        setForm\(defaultForm\);\n        setEditingProduct\(null\);\n      \}\n    \} catch \(e\) \{\n      console\.error\(e\);\n    \}/, '    // End of handleSave');

fs.writeFileSync(file, newContent);
