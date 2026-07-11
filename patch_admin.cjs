const fs = require('fs');
const file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove required from some inputs
content = content.replace(/<input required type="number" step="0\.1" value=\{form\.rating\}/g, '<input type="number" step="0.1" value={form.rating}');
content = content.replace(/<input required type="number" value=\{form\.review_count\}/g, '<input type="number" value={form.review_count}');
content = content.replace(/<input required value=\{form\.whatsapp_link\}/g, '<input value={form.whatsapp_link}');
content = content.replace(/<input required value=\{form\.button_variant_a\}/g, '<input value={form.button_variant_a}');
content = content.replace(/<input required value=\{form\.button_variant_b\}/g, '<input value={form.button_variant_b}');

fs.writeFileSync(file, content);
