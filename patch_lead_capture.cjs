const fs = require('fs');
let code = fs.readFileSync('src/components/LeadCapture.tsx', 'utf8');

// Replace Supabase insert with fetch to our Express endpoint
const oldInsert = `const { error } = await supabase.from('leads').insert([{
        name: formData.name,
        whatsapp: formattedWa,
        city: formData.city,
        post_slug: postSlug,
        source: source
      }]);

      if (error) {
         console.error('Lead save error:', error);
         // Even if it fails (e.g., table not created yet), we will still open WhatsApp to not block the user.
      }`;

const newInsert = `const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formattedWa,
          city: formData.city,
          post_slug: postSlug,
          source: source
        })
      });

      if (!res.ok) {
         console.error('Lead save error:', await res.text());
      }`;

code = code.replace(oldInsert, newInsert);
fs.writeFileSync('src/components/LeadCapture.tsx', code);
