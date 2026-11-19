export interface BuyCardProduct {
  id: string;
  slug: string;
  name: string;
  tierLabel: string;
  audienceTag: 'individual' | 'executive' | 'business';
  category: 'pvc' | 'metal' | 'corporate' | 'accessory';
  priceNgn: number;
  priceRangeLabel?: string;
  shortDescription: string;
  features: string[];
  supportsCustomization: boolean;
  customizationNote: string;
  productionAndDelivery: string;
  images: string[];
  recommended?: boolean;
  cardCount?: number;
}

export const CHIPNG_WHATSAPP_NUMBER = '2348100764154';
export const CHIPNG_DISPLAY_PHONE = '08100764154';
export const CHIPNG_SUPPORT_EMAIL = 'hello@chipng.com';

export const CHIPNG_WHATSAPP_DEFAULT_MESSAGE =
  "Hello CHIPNG, I'm interested in ordering an NFC business card. Please help me choose the right option.";

export function buildChipngWhatsAppUrl(message: string = CHIPNG_WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${CHIPNG_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Canonical CHIPNG hardware catalog verified against live Supabase `public.products` records.
 * Used as an immediate zero-flash baseline and hydrated/verified live from `/api/buy-card/catalog`.
 */
export const CANONICAL_BUY_CARD_PRODUCTS: BuyCardProduct[] = [
  {
    id: '8d956503-24c6-4bc3-9337-81b1e543c8b3',
    slug: 'pvc-nfc-card',
    name: 'PVC NFC Card',
    tierLabel: 'Everyday Professional',
    audienceTag: 'individual',
    category: 'pvc',
    priceNgn: 30000,
    shortDescription:
      'Clean ceramic white PVC smart card with full-color custom printing, embedded NXP NTAG216 chip, and dynamic QR code backup.',
    features: [
      'Genuine NXP NTAG216 contactless chip',
      'Full-color custom branding with your name & logo',
      'Dynamic QR code backup for non-NFC phones',
      'Lifetime CHIP Core digital profile hosting',
      '3 months free CHIP Pro analytics & lead capture',
    ],
    supportsCustomization: true,
    customizationNote: 'Supports custom logo, name, role, brand colors & QR placement',
    productionAndDelivery: 'Lagos: 24–48 hrs · Nationwide (DHL/GIG): 2–4 business days',
    images: [
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6186616949802414.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6520971912746258.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.8693980018651898.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9480990787847587.jpeg',
    ],
    cardCount: 1,
  },
  {
    id: '0ee82cbf-193f-4353-ae2b-1a1bd5827c2a',
    slug: 'premium-pvc-nfc-card',
    name: 'Premium PVC NFC Card',
    tierLabel: 'Premium Business Identity',
    audienceTag: 'individual',
    category: 'pvc',
    priceNgn: 35000,
    shortDescription:
      'Industrial matte black PVC card finished with tactile high-definition UV cured printing. Scratch-resistant, waterproof, and built for daily networking.',
    features: [
      'Genuine NXP NTAG216 contactless chip',
      'Matte black finish with tactile HD UV print',
      'Waterproof & scratch-resistant polymer body',
      'Lifetime CHIP Core digital profile hosting',
      '3 months free CHIP Pro analytics & lead capture',
    ],
    supportsCustomization: true,
    customizationNote: 'Supports custom logo, name, role, brand colors & QR placement',
    productionAndDelivery: 'Lagos: 24–48 hrs · Nationwide (DHL/GIG): 2–4 business days',
    images: [
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.28640138450754493.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.7964022577458013.jpeg',
    ],
    recommended: true,
    cardCount: 1,
  },
  {
    id: '498a254d-e6f3-409b-b18f-8771861911e0',
    slug: 'metal-nfc-card',
    name: 'Metal NFC Card',
    tierLabel: 'Executive Metal Experience',
    audienceTag: 'executive',
    category: 'metal',
    priceNgn: 50000,
    shortDescription:
      'Precision-weighted stainless steel NFC card with crisp fiber-laser engraving. Built for founders, directors, and senior client-facing executives.',
    features: [
      'Weighted brushed metal construction with matte finish',
      'Precision fiber-laser logo & typography engraving',
      'Genuine NXP NTAG216 contactless chip + QR backup',
      'Lifetime CHIP Core digital profile hosting',
      '3 months free CHIP Pro analytics & lead capture',
    ],
    supportsCustomization: true,
    customizationNote: 'Laser-engraved logo, executive name, title & custom QR layout',
    productionAndDelivery: 'Lagos: 24–48 hrs after proof approval · Nationwide: 2–4 business days',
    images: [
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9650784343957072.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.16690376724888145.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.07021319146304483.jpeg',
    ],
    cardCount: 1,
  },
  {
    id: '302ad048-48a6-4906-9fef-cb820da8fc81',
    slug: 'custom-metal-card-design',
    name: 'Custom Metal Card (Bespoke Design)',
    tierLabel: 'Executive Metal Experience',
    audienceTag: 'executive',
    category: 'metal',
    priceNgn: 80000,
    priceRangeLabel: '₦80,000',
    shortDescription:
      'Bespoke custom-designed metal card with full emblem, signature, or brand artwork laser-engraved to your exact layout specifications.',
    features: [
      'Dedicated 1-on-1 custom layout & emblem engraving',
      'Heavy-gauge brushed metal finish with pre-production proof',
      'Genuine NXP NTAG216 chip + dynamic QR backup',
      'Lifetime CHIP Core digital profile hosting',
      '3 months free CHIP Pro analytics & lead capture',
    ],
    supportsCustomization: true,
    customizationNote: 'Full bespoke front & back engraving with designer proof review',
    productionAndDelivery: 'Lagos: 48 hrs after proof approval · Nationwide: 2–4 business days',
    images: [
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.39752302505154224.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9216644206704482.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.20724482588138737.jpeg',
    ],
    cardCount: 1,
  },
  {
    id: '7e57c7fa-becf-4a0a-a37f-7daf549dde5c',
    slug: 'custom-metal-card-nfc-flagship',
    name: 'Custom Metal Card + NFC Flagship',
    tierLabel: 'Executive Metal Experience',
    audienceTag: 'executive',
    category: 'metal',
    priceNgn: 100000,
    priceRangeLabel: '₦100,000',
    shortDescription:
      'Flagship dual-layer heavy metal card engineered with bespoke laser artwork, embedded NFC coil, and priority Lagos production handling.',
    features: [
      'Dual-layer flagship metal body with bespoke engraving',
      'Embedded high-sensitivity NFC coil + QR backup',
      'Dedicated design concierge & pre-production proof',
      'Lifetime CHIP Core digital profile hosting',
      '3 months free CHIP Pro analytics & lead capture',
    ],
    supportsCustomization: true,
    customizationNote: 'Full bespoke artwork, custom emblem, signature & finish options',
    productionAndDelivery: 'Lagos: 48 hrs after proof approval · Nationwide: 2–4 business days',
    images: [
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6698054703282286.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6685778945693243.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.3480821954309036.jpeg',
    ],
    cardCount: 1,
  },
  {
    id: 'corporate-package-11-cards',
    slug: 'corporate-package',
    name: 'Corporate Package (10 PVC + 1 CEO Metal)',
    tierLabel: 'Corporate Networking Solution',
    audienceTag: 'business',
    category: 'corporate',
    priceNgn: 300000,
    shortDescription:
      'Complete company rollout kit: 10 custom-branded staff PVC NFC cards plus 1 laser-engraved Executive Metal card and centralized team profile setup.',
    features: [
      '10 custom-branded staff PVC cards + 1 CEO Metal card',
      'Consistent company branding & pre-production team proofs',
      'Centralized team management & instant employee updates',
      'Lifetime CHIP Core hosting for all team profiles',
      'Priority insured delivery nationwide via DHL & GIG',
    ],
    supportsCustomization: true,
    customizationNote: 'Upload company logo; our onboarding team coordinates staff details',
    productionAndDelivery: 'Lagos: 2–3 business days after proof approval · Nationwide: 3–5 days',
    images: [
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.28640138450754493.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9650784343957072.jpeg',
      'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6186616949802414.jpeg',
    ],
    cardCount: 11,
  },
];

export const PRODUCT_COMPARISON_ROWS = [
  {
    feature: 'Best For',
    pvc: 'Everyday Professional',
    premiumPvc: 'Premium Business Identity',
    metal: 'Executive Metal Experience',
    corporate: 'Corporate Networking Solution',
  },
  {
    feature: 'Verified Price (NGN)',
    pvc: '₦30,000',
    premiumPvc: '₦35,000',
    metal: '₦50,000 – ₦100,000',
    corporate: '₦300,000 (11 cards)',
  },
  {
    feature: 'Material & Finish',
    pvc: 'Ceramic White PVC',
    premiumPvc: 'Matte Black UV PVC',
    metal: 'Weighted Stainless Steel',
    corporate: '10 Staff PVC + 1 CEO Metal',
  },
  {
    feature: 'Branding Method',
    pvc: 'Full-color custom print',
    premiumPvc: 'Tactile HD UV print',
    metal: 'Precision fiber-laser engraving',
    corporate: 'Unified company brand templates',
  },
  {
    feature: 'NFC Chip & Backup',
    pvc: 'NTAG216 + Dynamic QR',
    premiumPvc: 'NTAG216 + Dynamic QR',
    metal: 'NTAG216 + Dynamic QR',
    corporate: 'NTAG216 + Dynamic QR (All)',
  },
  {
    feature: 'Design Proof Before Print',
    pvc: 'Included via WhatsApp/Email',
    premiumPvc: 'Included via WhatsApp/Email',
    metal: 'Included via WhatsApp/Email',
    corporate: 'Dedicated team onboarding proof',
  },
  {
    feature: 'Digital Profile Hosting',
    pvc: 'Lifetime Core + 3-Mo Pro Trial',
    premiumPvc: 'Lifetime Core + 3-Mo Pro Trial',
    metal: 'Lifetime Core + 3-Mo Pro Trial',
    corporate: 'Lifetime Core + Enterprise Controls',
  },
];

export const NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Ogun',
  'Oyo',
  'Delta',
  'Edo',
  'Anambra',
  'Enugu',
  'Kaduna',
  'Kano',
  'Akwa Ibom',
  'Cross River',
  'Imo',
  'Kwara',
  'Ondo',
  'Osun',
  'Abia',
  'Plateau',
  'Benue',
  'Ekiti',
  'Kogi',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Bayelsa',
  'Ebonyi',
  'Adamawa',
  'Bauchi',
  'Borno',
  'Gombe',
  'Jigawa',
  'Katsina',
  'Kebbi',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
].filter((state, idx, arr) => arr.indexOf(state) === idx);

export interface BuyCardFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const BUY_CARD_FAQS: BuyCardFaqItem[] = [
  {
    id: 'what-is-nfc-card',
    question: 'What is an NFC business card?',
    answer:
      'An NFC (Near Field Communication) business card is a physical smart card embedded with a passive microchip. Instead of handing out disposable paper cards, you tap one CHIPNG card against a compatible smartphone to share your digital business profile, contact details, website, and social media immediately.',
  },
  {
    id: 'how-chipng-works',
    question: 'How does CHIPNG NFC technology work?',
    answer:
      'Every CHIPNG card uses a genuine NXP NTAG216 chip powered inductively by the recipient’s smartphone—so it never needs a battery or charging. When tapped near the phone’s NFC antenna, the phone automatically detects your unique CHIPNG profile link and opens it in the mobile browser, alongside a printed dynamic QR code as backup.',
  },
  {
    id: 'need-an-app',
    question: 'Do customers need an application?',
    answer:
      'No. Anyone you meet can tap your card or scan the backup QR code and view your digital business profile directly in Safari, Chrome, or their default mobile browser without downloading or installing any application.',
  },
  {
    id: 'custom-logo',
    question: 'Can I customize my card with my business logo?',
    answer:
      'Yes. You can upload your logo (PNG, JPG, SVG, WEBP, or PDF), specify your preferred card name, brand colors, and layout instructions during checkout. Before production starts, our Lagos design team sends a digital proof for your review and approval.',
  },
  {
    id: 'update-info-later',
    question: 'Can I change my information after receiving the card?',
    answer:
      'Yes. Your physical NFC card points to your live cloud-hosted CHIPNG digital profile. Whenever you change your phone number, job title, company, website, or social links in your CHIPNG dashboard, the updates reflect immediately—without reprinting your card.',
  },
  {
    id: 'android-and-iphone',
    question: 'Does the card work with Android and iPhone?',
    answer:
      'CHIPNG cards work with NFC-enabled smartphones, including iPhone XR/XS and newer (iOS 13+) and most modern Android devices with NFC enabled. For older phones or devices with NFC turned off, every card includes a dynamic QR code that scans with any smartphone camera.',
  },
  {
    id: 'production-time',
    question: 'How long does production take?',
    answer:
      'After payment verification and your approval of the custom card design proof, PVC and standard Metal cards are produced in our Lagos workshop within 24–48 business hours. Bespoke custom metal designs and corporate fleet batches typically complete within 2–3 business days after proof sign-off.',
  },
  {
    id: 'delivery-outside-lagos',
    question: 'Do you deliver outside Lagos?',
    answer:
      'Yes. We deliver across Lagos within 24–48 hours after production, and nationwide to Abuja, Port Harcourt, Ibadan, Enugu, Kano, and all 36 Nigerian states within 2–4 business days via insured DHL and GIG Logistics couriers.',
  },
  {
    id: 'corporate-multiple-cards',
    question: 'Can I order multiple cards for my company?',
    answer:
      'Yes. You can adjust the quantity directly on any card or select our Corporate Package (₦300,000 for 10 custom staff PVC cards + 1 CEO Metal card). Our team helps coordinate uniform company branding, individual proofs, and centralized profile onboarding.',
  },
  {
    id: 'post-purchase-support',
    question: 'How do I get support after purchasing?',
    answer:
      'After your payment is confirmed, our support team is available via WhatsApp on 08100764154 or email at hello@chipng.com for design proof approvals, delivery tracking, and digital profile setup assistance.',
  },
  {
    id: 'subscription-based',
    question: 'Is the digital profile subscription-based?',
    answer:
      'No subscription is required for core usage. Every card includes lifetime hosting of CHIP Core digital profile functionality (unlimited NFC taps, contact saving, links, and profile updates) subject to CHIPNG platform terms. Each purchase also includes 3 months of optional CHIP Pro analytics and CRM capture free; if you choose not to continue Pro afterward, your card and Core profile continue working.',
  },
  {
    id: 'lost-card',
    question: 'What happens if my card is lost?',
    answer:
      'Your digital profile data remains safely stored in your CHIPNG account—nothing sensitive is stored locally on the card hardware. You can update or pause your profile links from your dashboard and contact support on 08100764154 to order a replacement card linked to your existing profile.',
  },
];

export function parseProductImages(rawImageUrl: string | null | undefined, fallbackImages: string[] = []): string[] {
  let list: string[] = [];
  if (rawImageUrl) {
    try {
      const parsed = JSON.parse(rawImageUrl);
      if (Array.isArray(parsed)) {
        list = parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
      } else if (typeof parsed === 'string' && parsed.trim()) {
        list = [parsed.trim()];
      }
    } catch {
      if (typeof rawImageUrl === 'string' && rawImageUrl.trim()) {
        list = [rawImageUrl.trim()];
      }
    }
  }
  const merged = list.length > 0 ? list : fallbackImages;
  return merged.length > 0 ? merged : ['/chipng_3d_logo.jpg'];
}

export function formatNaira(amount: number): string {
  return `₦${Math.round(Number(amount) || 0).toLocaleString('en-NG')}`;
}
