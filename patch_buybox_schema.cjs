const fs = require('fs');
let code = fs.readFileSync('src/components/BuyBox.tsx', 'utf8');

const returnStart = `return (
    <div className="bg-white dark:bg-[#111]`;

const returnNew = `const schemaJSON = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": benefits.join(' '),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.review_count.toString()
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "NGN",
      "price": product.price_ngn,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJSON) }} />
    <div className="bg-white dark:bg-[#111]`;

code = code.replace(returnStart, returnNew);
fs.writeFileSync('src/components/BuyBox.tsx', code);
