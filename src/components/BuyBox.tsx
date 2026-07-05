import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, Star } from 'lucide-react';

interface BuyBoxProduct {
  id: number;
  name: string;
  price_ngn: string;
  image_url: string;
  benefits_json: string;
  rating: number;
  review_count: number;
  badge_text: string;
  whatsapp_link: string;
  button_variant_a: string;
  button_variant_b: string;
}

interface BuyBoxProps {
  postSlug: string;
  onVariantClicked?: (variant: 'A' | 'B') => void;
}

export function BuyBox({ postSlug, onVariantClicked }: BuyBoxProps) {
  const [product, setProduct] = useState<BuyBoxProduct | null>(null);
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // A/B test variant assignment
    setVariant(Math.random() > 0.5 ? 'A' : 'B');

    const fetchProduct = async () => {
      try {
        const mappingRes = await fetch('/api/post-product/' + postSlug);
        let productId = null;
        if (mappingRes.ok) {
          const mapping = await mappingRes.json();
          productId = mapping.product_id;
        }

        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          const products: BuyBoxProduct[] = await productsRes.json();
          if (products.length > 0) {
            const p = productId ? products.find(x => x.id === productId) : products[0];
            setProduct(p || products[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching buy box product:', e);
      }
    };
    fetchProduct();
  }, [postSlug]);

  if (!product) return null;

  let benefits: string[] = [];
  try { benefits = JSON.parse(product.benefits_json); } catch(e) {}

  const buttonText = variant === 'A' ? product.button_variant_a : product.button_variant_b;
  
  const handleOrder = () => {
    if (onVariantClicked) onVariantClicked(variant);
    
    fetch('/api/lead', {
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

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'buybox_click', postSlug, variant });
    }

    const url = new URL(product.whatsapp_link);
    url.searchParams.append('utm_source', 'blog_buybox');
    url.searchParams.append('utm_medium', postSlug);
    window.open(url.toString(), '_blank');
  };

  const schemaJSON = {
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
      <div className="bg-white dark:bg-[#111] border-2 border-black dark:border-[#333] rounded-2xl overflow-hidden shadow-lg mt-0 mb-12 flex flex-col">
        <div className="bg-[#f5f5f5] dark:bg-[#0a0a0a] flex items-center justify-center p-6 relative">
          {product.badge_text && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm z-10">
              {product.badge_text}
            </div>
          )}
          <img src={product.image_url} alt={product.name} className="w-full max-w-[200px] h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[#FFB800] mb-2 text-sm font-bold">
            <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            <span className="text-black dark:text-white ml-1">{product.rating} | {product.review_count} Realtors in Lagos</span>
          </div>
          <h3 className="font-sans font-bold text-2xl sm:text-3xl text-black dark:text-white mb-2 leading-tight">
            {product.name}
          </h3>
          <div className="text-3xl font-mono font-bold text-[#25D366] mb-4">
            ₦{product.price_ngn}
          </div>
          
          <ul className="space-y-2 mb-6">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={handleOrder}
            className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-lg py-4 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            {buttonText}
          </button>
        </div>
      </div>
    </>
  );
}
