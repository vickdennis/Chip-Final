/**
 * SEO & Static Pre-Rendering Engine for CHIP NG Buy Card / Checkout Route (/buy-card & /shop)
 * Eliminates the empty <div id="root"></div> problem for search crawlers, AEO agents, and social cards.
 */

export const BUY_CARD_META = {
  title: 'Buy Contactless NFC Smart Business Cards in Nigeria | CHIP NG',
  description: 'Order official CHIP NG contactless NFC smart business cards. Sub-10ms response, zero app needed. NFC Smart Black/White PVC (₦30,000 / ₦35,000), NFC Smart Metal Card (₦50,000), Metal Debit Card + Custom Design (₦80,000–₦100,000). 24h Lagos & nationwide delivery.',
  canonical: 'https://www.chipng.com/buy-card',
  image: 'https://www.chipng.com/chipng_3d_logo.jpg'
};

export const BUY_CARD_SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": "https://www.chipng.com/buy-card#product",
      "name": "CHIP NG Contactless Smart NFC Business Card",
      "image": [
        "https://www.chipng.com/chipng_3d_logo.jpg",
        "https://www.chipng.com/chipng_exact_tile.png"
      ],
      "description": "Nigeria's premier contactless smart business card and dynamic profile platform. Built with embedded NTAG216 chip, sub-10ms response, and zero app needed. Available in NFC Smart Black/White PVC Card (₦30,000 / ₦35,000), NFC Smart Metal Card (₦50,000), and Metal Debit Card + Custom Design (₦80,000 - ₦100,000).",
      "brand": {
        "@type": "Brand",
        "name": "CHIP NG"
      },
      "sku": "CHIP-NFC-NG-01",
      "mpn": "NTAG216-NG",
      "category": "Smart Business Cards",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "NGN",
        "lowPrice": "30000",
        "highPrice": "100000",
        "offerCount": "3",
        "offers": [
          {
            "@type": "Offer",
            "name": "NFC Smart Black/White PVC Card",
            "sku": "CHIP-PVC-30K",
            "price": "30000",
            "priceCurrency": "NGN",
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "url": "https://www.chipng.com/buy-card",
            "seller": {
              "@type": "Organization",
              "name": "CHIP NG Technologies Ltd"
            }
          },
          {
            "@type": "Offer",
            "name": "NFC Smart Metal Card",
            "sku": "CHIP-METAL-50K",
            "price": "50000",
            "priceCurrency": "NGN",
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "url": "https://www.chipng.com/buy-card",
            "seller": {
              "@type": "Organization",
              "name": "CHIP NG Technologies Ltd"
            }
          },
          {
            "@type": "Offer",
            "name": "Metal Debit Card + Custom Design",
            "sku": "CHIP-DEBIT-CUSTOM-100K",
            "price": "80000",
            "priceCurrency": "NGN",
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "url": "https://www.chipng.com/buy-card",
            "seller": {
              "@type": "Organization",
              "name": "CHIP NG Technologies Ltd"
            }
          }
        ]
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://chipng.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Buy Smart NFC Card",
          "item": "https://chipng.com/buy-card"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does the person receiving my card need an app?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No app is required! When you tap your CHIP card against an iPhone or Android phone, their browser opens your profile instantly in 0.2 seconds. From there, they can click 'Save Contact' to directly download your vCard into their phone contacts."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between Smart PVC and Metal cards?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Smart PVC card (₦30,000) is a lightweight 5g polymer daily driver with full-color UV printing. The NFC Smart Metal card (₦50,000) is made from 24g solid 304 stainless steel with fiber-laser etching, offering 5x heavier metallic hand-feel and distinct acoustic clink. The Custom Heavy Metal edition (₦100,000) features ultra-dense 28g aerospace alloy with deep CNC dual-sided fiber engraving, 24K gold mirror finish, and lifetime warranty."
          }
        },
        {
          "@type": "Question",
          "name": "How fast is delivery in Lagos and nationwide in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cards are crafted in our Lagos workshop. Lagos orders are dispatched within 24–48 hours via direct courier. Nationwide orders to Abuja, Port Harcourt, Ibadan, and all 36 Nigerian states are delivered in 2–4 business days via DHL and GIG Logistics."
          }
        }
      ]
    }
  ]
});

export const BUY_CARD_PRE_RENDER_HTML = `
<div id="root">
  <!-- Server Pre-Rendered Fallback for Search Crawlers & AEO Bots (React mounts and hydrates seamlessly) -->
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; max-width: 1200px; margin: 0 auto; padding: 24px 16px;">
    
    <header style="text-align: center; margin-bottom: 40px;">
      <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4f46e5; margin-bottom: 8px;">Official CHIP NG Hardware Shop</p>
      <h1 style="font-size: 36px; font-weight: 900; line-height: 1.2; margin: 0 0 16px 0; color: #0a0a0a;">
        Contactless Smart NFC Business Cards in Nigeria
      </h1>
      <p style="font-size: 18px; color: #525252; max-width: 720px; margin: 0 auto; line-height: 1.6;">
        Tap your card on any modern iPhone or Android to instantly share your phonebook contact, portfolio, and social links. No app required. Sub-10ms contactless response.
      </p>
    </header>

    <section aria-labelledby="hardware-tiers-heading" style="margin-bottom: 48px;">
      <h2 id="hardware-tiers-heading" style="font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 28px;">
        Choose Your Hardware Build
      </h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        
        <!-- Tier 1 -->
        <article style="border: 1px solid #e5e5e5; border-radius: 20px; padding: 24px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f3f4f6; color: #1f2937; padding: 4px 10px; border-radius: 999px;">
            Starter Utility • 5g PVC
          </span>
          <h3 style="font-size: 22px; font-weight: 800; margin: 14px 0 8px 0;">Smart PVC Card</h3>
          <p style="font-size: 14px; color: #666; line-height: 1.5; margin-bottom: 18px;">
            Featherlight scratch-resistant polymer PVC engineered for daily high-volume networking. Replace thousands of paper business cards forever.
          </p>
          <div style="font-size: 32px; font-weight: 900; color: #000; margin-bottom: 18px;">
            ₦30,000 <span style="font-size: 14px; font-weight: 500; color: #888;">(Was ₦45,000)</span>
          </div>
          <ul style="font-size: 13px; line-height: 1.7; color: #374151; padding-left: 20px;">
            <li>Sub-10ms NTAG216 High-Speed Contactless Chip</li>
            <li>5g Scratch-Resistant Polymer in Glacier White & Matte Obsidian</li>
            <li>Full-Color HD Edge-to-Edge UV Protective Printing</li>
            <li>Instant 0.2s Phonebook vCard Sync (iOS & Android)</li>
            <li>High-Contrast Dynamic Vector QR Backup</li>
            <li>Lifetime CHIP Core Cloud Hosting (₦0 Monthly Fee)</li>
            <li>12-Month Contactless Hardware Guarantee</li>
          </ul>
        </article>

        <!-- Tier 2 -->
        <article style="border: 1px solid #d4d4d4; border-radius: 20px; padding: 24px; background: #171717; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
          <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; background: rgba(255,255,255,0.15); color: #fff; padding: 4px 10px; border-radius: 999px;">
            Professional Metal • 24g Steel
          </span>
          <h3 style="font-size: 22px; font-weight: 800; margin: 14px 0 8px 0; color: #fff;">NFC Smart Metal</h3>
          <p style="font-size: 14px; color: #d4d4d4; line-height: 1.5; margin-bottom: 18px;">
            Precision-milled 24g solid 304 stainless steel with single-sided fiber laser etching. Five times heavier than PVC with an undeniable acoustic table presence.
          </p>
          <div style="font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 18px;">
            ₦50,000 <span style="font-size: 14px; font-weight: 500; color: #a3a3a3;">(Was ₦75,000)</span>
          </div>
          <ul style="font-size: 13px; line-height: 1.7; color: #e5e5e5; padding-left: 20px;">
            <li>24g Solid 304 Stainless Steel Core (5x Weight of Plastic)</li>
            <li>Permanent High-Precision Fiber-Laser Front Etching</li>
            <li>Ferrite-Shielded Contactless NFC Antenna (<10ms)</li>
            <li>Crisp Acoustic "Metallic Clink" on Meeting Tables</li>
            <li>Brushed Space Gray & Matte Executive Finishes</li>
            <li>Priority 24h Lagos Workshop Fabrication Queue</li>
            <li>12-Month Full Hardware Replacement Warranty</li>
          </ul>
        </article>

        <!-- Tier 3 -->
        <article style="border: 2px solid #a3e635; border-radius: 20px; padding: 24px; background: #0a0a0a; color: #fff; box-shadow: 0 8px 24px rgba(163,230,53,0.15);">
          <span style="display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #a3e635; color: #0a0a0a; padding: 4px 10px; border-radius: 999px;">
            ★ Bespoke Luxury • 28g Alloy
          </span>
          <h3 style="font-size: 22px; font-weight: 800; margin: 14px 0 8px 0; color: #fff;">Metal Debit Card + Custom Design</h3>
          <p style="font-size: 14px; color: #d4d4d4; line-height: 1.5; margin-bottom: 18px;">
            Functional bank debit EMV chip transplant + custom aerospace metal card with 1-on-1 designer proofing. The definitive status symbol for closing eight-figure high-ticket contracts.
          </p>
          <div style="font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 18px;">
            ₦80,000 – ₦100,000
          </div>
          <ul style="font-size: 13px; line-height: 1.7; color: #f5f5f5; padding-left: 20px;">
            <li>Deep CNC Dual-Sided Fiber-Laser Relief Engraving</li>
            <li>28g Ultra-Dense Aerospace-Grade Stainless Alloy</li>
            <li>24K Matte Mirror Gold or Obsidian Black PVD Coating</li>
            <li>Tuned 360° Ceramic Radio-Frequency Induction Loop</li>
            <li>Optional Functional EMV Debit Chip Transplant Ready</li>
            <li>1-on-1 Bespoke Concierge Digital Designer Proof Review</li>
            <li>VIP Same-Day Lagos Bench Queue & Express Delivery</li>
            <li>Lifetime Indestructible Hardware & Engraving Warranty</li>
          </ul>
        </article>

      </div>
    </section>

    <!-- Comparison Matrix Section -->
    <section aria-labelledby="matrix-heading" style="margin-bottom: 48px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 20px; padding: 24px;">
      <h2 id="matrix-heading" style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">
        Hardware Tier Comparison Matrix
      </h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e5e5; text-align: left;">
              <th style="padding: 10px;">Feature</th>
              <th style="padding: 10px;">Smart PVC (₦30,000)</th>
              <th style="padding: 10px;">Smart Metal (₦50,000)</th>
              <th style="padding: 10px;">Custom Heavy Metal (₦100,000)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: 600;">Weight</td>
              <td style="padding: 10px;">5g Featherlight</td>
              <td style="padding: 10px;">24g Solid Steel</td>
              <td style="padding: 10px; font-weight: bold;">28g Aerospace Alloy</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: 600;">Branding</td>
              <td style="padding: 10px;">HD Full-Color UV Print</td>
              <td style="padding: 10px;">Single-Sided Fiber Laser</td>
              <td style="padding: 10px; font-weight: bold;">Deep CNC Dual-Sided Fiber Relief</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: 600;">Table Presence</td>
              <td style="padding: 10px;">Composite tap</td>
              <td style="padding: 10px;">Metallic thud</td>
              <td style="padding: 10px; font-weight: bold;">Resonant executive table clink</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: 600;">EMV Debit Option</td>
              <td style="padding: 10px;">No</td>
              <td style="padding: 10px;">Available (+₦15,000)</td>
              <td style="padding: 10px; font-weight: bold;">Fully compatible & supported</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: 600;">Hardware Guarantee</td>
              <td style="padding: 10px;">12 Months</td>
              <td style="padding: 10px;">12 Months</td>
              <td style="padding: 10px; font-weight: bold;">Lifetime Indestructible Warranty</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ -->
    <section aria-labelledby="faq-heading" style="margin-bottom: 40px;">
      <h2 id="faq-heading" style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">
        Frequently Asked Questions
      </h2>
      <div style="font-size: 14px; line-height: 1.6; color: #404040;">
        <p><strong>Does the person receiving my card need an app?</strong><br />No app is needed. When you tap your CHIP card against an iPhone or Android phone, their browser opens your profile instantly in 0.2 seconds. From there, they can click "Save Contact" to directly download your vCard into their phone contacts.</p>
        <p><strong>How fast is delivery in Lagos and nationwide?</strong><br />Cards are fabricated in our Lagos workshop. Lagos orders are delivered in 24–48 hours via direct courier. Nationwide orders to Abuja, Port Harcourt, and other states arrive in 2–4 business days via DHL and GIG Logistics.</p>
      </div>
    </section>

  </div>
</div>
`;

/**
 * Transforms an HTML document string (from Vite or dist/index.html) to inject
 * full SEO metadata, Schema.org JSON-LD, OpenGraph tags, and the static HTML fallback.
 */
export function applyBuyCardSeo(html: string): string {
  let output = html;

  // 1. Replace Title
  output = output.replace(/<title>.*?<\/title>/i, `<title>${BUY_CARD_META.title}</title>`);
  output = output.replace(/<meta name="title" content=".*?"\s*\/?>/i, `<meta name="title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${BUY_CARD_META.title}" />`);
  output = output.replace(/<meta property="twitter:title" content=".*?"\s*\/?>/i, `<meta property="twitter:title" content="${BUY_CARD_META.title}" />`);

  // 2. Replace Description
  output = output.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${BUY_CARD_META.description}" />`);
  output = output.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${BUY_CARD_META.description}" />`);
  output = output.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${BUY_CARD_META.description}" />`);

  // 3. Ensure Canonical Tag
  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link rel="canonical" href=".*?"\s*\/?>/i, `<link rel="canonical" href="${BUY_CARD_META.canonical}" />`);
  } else {
    output = output.replace('</head>', `  <link rel="canonical" href="${BUY_CARD_META.canonical}" />\n</head>`);
  }

  // 4. OpenGraph Product & Pricing meta tags
  const ogProductTags = `
    <!-- E-Commerce Product OpenGraph & Price Signals -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${BUY_CARD_META.canonical}" />
    <meta property="product:price:amount" content="30000" />
    <meta property="product:price:currency" content="NGN" />
    <meta property="product:availability" content="in stock" />
    <meta property="product:condition" content="new" />
    <!-- Structured Data (E-Commerce Product & FAQ Schema) -->
    <script type="application/ld+json">
${BUY_CARD_SCHEMA_JSON_LD}
    </script>
  `;

  output = output.replace('</head>', `${ogProductTags}\n</head>`);

  // 5. Replace empty <div id="root"></div> with crawlable pre-rendered HTML fallback
  output = output.replace(/<div id="root"><\/div>/i, BUY_CARD_PRE_RENDER_HTML);

  return output;
}
