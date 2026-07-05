const fs = require('fs');
let code = fs.readFileSync('src/components/BuyBox.tsx', 'utf8');

const trackStart = `if (typeof window !== 'undefined' && (window as any).dataLayer) {`;
const trackNew = `fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'BuyBox Click',
        whatsapp: 'N/A',
        city: 'N/A',
        post_slug: postSlug,
        source: 'buybox',
        clicked_variant: variant
      })
    }).catch(console.error);

    if (typeof window !== 'undefined' && (window as any).dataLayer) {`;

code = code.replace(trackStart, trackNew);
fs.writeFileSync('src/components/BuyBox.tsx', code);
