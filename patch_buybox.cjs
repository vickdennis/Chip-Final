const fs = require('fs');

let content = fs.readFileSync('src/components/BuyBox.tsx', 'utf8');

content = content.replace(
  '"ratingValue": product.rating.toString(),',
  '"ratingValue": (product.rating || 0).toString(),'
);

content = content.replace(
  '"reviewCount": product.review_count.toString()',
  '"reviewCount": (product.review_count || 0).toString()'
);

fs.writeFileSync('src/components/BuyBox.tsx', content);
