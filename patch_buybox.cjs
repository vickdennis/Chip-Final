const fs = require('fs');
const file = 'src/components/BuyBox.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  const schemaJSON: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": benefits.join(' '),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "NGN",
      "price": product.price_ngn ? product.price_ngn.toString().replace(/,/g, '') : "0",
      "availability": "https://schema.org/InStock"
    }
  };
  
  if (product.rating && product.rating > 0 && product.review_count && product.review_count > 0) {
    schemaJSON.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.review_count.toString()
    };
  }`;

content = content.replace(/const schemaJSON = \{[\s\S]*?\};\n/, replacement + '\n');
fs.writeFileSync(file, content);
