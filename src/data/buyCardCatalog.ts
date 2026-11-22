export interface BuyCardProduct {
  id: string;
  slug: string;
  name: string;
  tierLabel: string;
  audienceTag: 'individual' | 'executive' | 'business';
  category: 'pvc' | 'metal' | 'corporate' | 'accessory';
  priceNgn: number;
  priceRangeLabel?: string;
  upgradeHighlight?: string;
  shortDescription: string;
  features: string[];
  supportsCustomization: boolean;
  customizationNote: string;
  productionAndDelivery: string;
  images: string[];
  recommended?: boolean;
  cardCount?: number;
}

export interface ClientProofItem {
  id: string;
  image: string;
  tag: string;
  title: string;
  caption: string;
  location: string;
  featured?: boolean;
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
 * Verified Nigerian client WhatsApp reviews, delivered card checks, courier tracking,
 * and repeat corporate team orders from CHIPNG Lagos studio.
 */
export const CLIENT_PROOF_GALLERY: ClientProofItem[] = [
  {
    id: 'metal-5star-review',
    image: '/assets/aistudio/IMG_2654_22e94953.jpeg',
    tag: '5-Star Metal Card Review',
    title: '“Strong, premium finishing — far more luxurious than plastic.”',
    caption: 'Real client review after receiving his custom-engraved Gold Metal Card.',
    location: 'Kano · Custom Metal Card',
    featured: true,
  },
  {
    id: 'lagos-courier-delivery',
    image: '/assets/aistudio/IMG_4323_7e949315.png',
    tag: 'Live Lagos Courier Delivery',
    title: 'Star Capital — Live Rider Tracking to Hand-Delivery',
    caption: 'Real Lagos dispatch map tracking + client confirmation: “I just received it.”',
    location: 'Lagos · Same-Day Dispatch',
    featured: true,
  },
  {
    id: 'corporate-345k-proof',
    image: '/assets/aistudio/IMG_2648_4496ce96.jpeg',
    tag: '₦345,000 Corporate Order',
    title: 'Softcopy Design Proof Before Printing',
    caption: 'Corporate buyer after ₦345,000 payment: “please let me see softcopies before printing out.”',
    location: 'Lagos · Corporate Team',
    featured: true,
  },
  {
    id: 'corporate-md-200k',
    image: '/assets/aistudio/IMG_2647_cf6c75ad.jpeg',
    tag: 'Executive MD Card + ₦200k Order',
    title: 'Samirah Ade-Adebiyi · Managing Director',
    caption: 'Verified ₦200,000 team transfer paired with custom executive card layout & QR code.',
    location: 'Lagos · Executive Team',
    featured: true,
  },
  {
    id: 'gig-kano-waybill',
    image: '/assets/aistudio/IMG_2651_fe7a963a.jpeg',
    tag: 'Nationwide GIG Logistics',
    title: 'Insured Waybill Dispatched Lagos → Kano',
    caption: 'Packed GIG courier envelope + printed waybill sent to Tony Zola in Kano (“Looks okay. Thank you”).',
    location: 'Kano · GIG Logistics',
  },
  {
    id: 'repeat-corporate-25',
    image: '/assets/aistudio/IMG_2649_cb613fc1.jpeg',
    tag: 'Repeat Corporate Client',
    title: '25+ Staff Cards & Ongoing New-Hire Reorders',
    caption: 'Returning HR admin sending ID card List.xlsx: “Number 24 and 25. Please do an NFC for them.”',
    location: 'Lagos · Repeat Team Order',
  },
  {
    id: 'gold-metal-video-check',
    image: '/assets/aistudio/IMG_2653_62ea8f26.jpeg',
    tag: 'Pre-Dispatch Quality Check',
    title: 'Finished Gold Metal Card Video Inspection',
    caption: 'We send a quick video of your finished engraved card before dispatch (“Its cool”).',
    location: 'Lekki Studio · Quality Check',
  },
  {
    id: 'verified-opay-receipt',
    image: '/assets/aistudio/IMG_2650_c67016b3.jpeg',
    tag: 'Verified Custom Card Order',
    title: 'Tony Zola — ₦70,000 Custom Order Confirmed',
    caption: 'Verified Nigerian payment confirmation before engraving & Kano GIG dispatch.',
    location: 'Kano · Custom Order',
  },
];

/**
 * Canonical CHIPNG hardware catalog verified against live Supabase `public.products` records.
 * Uses plain-English buyer payoffs and crystal-clear ₦30,000 vs ₦35,000 PVC differentiation.
 */
export const CANONICAL_BUY_CARD_PRODUCTS: BuyCardProduct[] = [
  {
    id: '8d956503-24c6-4bc3-9337-81b1e543c8b3',
    slug: 'pvc-nfc-card',
    name: 'Standard White PVC NFC Card',
    tierLabel: 'Essential White · Everyday Smart Card',
    audienceTag: 'individual',
    category: 'pvc',
    priceNgn: 30000,
    upgradeHighlight: 'Clean ceramic white finish — ideal if your logo has bright colors on a white background.',
    shortDescription:
      'Crisp ceramic white waterproof PVC card with vibrant full-color front & back printing. Taps open your profile in 1 second on iPhone & Android—no app needed.',
    features: [
      'Works on every iPhone & Android in 1 second (no app needed)',
      'Clean ceramic white finish with full-color logo & name print',
      'Built-in QR code backup so older phones can scan with their camera',
      '12-month free chip replacement guarantee if NFC ever fails',
      'Lifetime digital profile hosting + 3 months free CHIP Pro',
    ],
    supportsCustomization: true,
    customizationNote: 'Front & back custom print · Free WhatsApp design proof before printing',
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
    name: 'Premium Matte Black PVC Card',
    tierLabel: 'Most Popular · +₦5,000 Finish Upgrade',
    audienceTag: 'individual',
    category: 'pvc',
    priceNgn: 35000,
    upgradeHighlight:
      'What +₦5,000 buys: Matte Black soft-touch body + raised waterproof UV print + anti-scratch coat (resists wallet scuffs & fingerprints).',
    shortDescription:
      'Sleek matte black soft-touch PVC upgraded with raised, scratch-proof waterproof UV printing on both sides. Built to stay sharp after years in your wallet.',
    features: [
      'Matte black anti-glare finish that stands out immediately',
      'Raised waterproof UV print that resists wallet scratches & fading',
      'Works on every iPhone & Android in 1 second + QR camera backup',
      '12-month free chip replacement guarantee if NFC ever fails',
      'Lifetime digital profile hosting + 3 months free CHIP Pro',
    ],
    supportsCustomization: true,
    customizationNote: 'Double-sided matte black custom design · Free WhatsApp proof before print',
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
    name: 'Executive Metal NFC Card',
    tierLabel: 'Executive Metal · Laser Engraved',
    audienceTag: 'executive',
    category: 'metal',
    priceNgn: 50000,
    upgradeHighlight: 'Heavy stainless steel weight with permanent laser engraving that never peels or rubs off.',
    shortDescription:
      'Solid weighted stainless steel smart card with scratch-proof laser engraving that never fades. Commands instant respect in boardrooms and client meetings.',
    features: [
      'Solid stainless steel weight that commands attention on any table',
      'Scratch-proof laser engraving that never peels or fades',
      'Works on every iPhone & Android in 1 second + engraved QR backup',
      '12-month free chip replacement guarantee if NFC ever fails',
      'Lifetime digital profile hosting + 3 months free CHIP Pro',
    ],
    supportsCustomization: true,
    customizationNote: 'Laser-engraved logo, name, title & QR · WhatsApp proof before engraving',
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
    tierLabel: 'Bespoke Metal · 1-on-1 Designer',
    audienceTag: 'executive',
    category: 'metal',
    priceNgn: 80000,
    priceRangeLabel: '₦80,000',
    upgradeHighlight: 'Includes a dedicated Lagos designer to engrave your custom emblem, signature, or full-bleed artwork.',
    shortDescription:
      'Heavy brushed metal card crafted 1-on-1 with our designer—featuring custom emblems, signatures, or intricate front-and-back artwork that never wears off.',
    features: [
      'Dedicated 1-on-1 Lagos designer for custom emblems & artwork',
      'Scratch-proof front & back engraving that never fades',
      'Works on every iPhone & Android in 1 second + QR backup',
      '12-month free chip replacement guarantee + video check before dispatch',
      'Lifetime digital profile hosting + 3 months free CHIP Pro',
    ],
    supportsCustomization: true,
    customizationNote: 'Full front & back bespoke artwork with unlimited pre-production proof revisions',
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
    tierLabel: 'VIP Flagship · Gold / Black / Brushed',
    audienceTag: 'executive',
    category: 'metal',
    priceNgn: 100000,
    priceRangeLabel: '₦100,000',
    upgradeHighlight: 'Our heaviest flagship metal edition in 24K Gold Mirror, Matte Black, or Brushed Steel with VIP handling.',
    shortDescription:
      'Our flagship heavy metal card built for founders and VIPs—available in 24K Gold Mirror, Matte Black, or Brushed Steel with bespoke front/back engraving and priority studio dispatch.',
    features: [
      'Heaviest luxury metal build (24K Gold Mirror, Matte Black, or Brushed)',
      'Scratch-proof bespoke front & back engraving that never fades',
      'Fast 1-second iPhone & Android NFC tap + camera QR backup',
      '12-month free chip replacement guarantee + priority Lagos dispatch',
      'Lifetime digital profile hosting + 3 months free CHIP Pro',
    ],
    supportsCustomization: true,
    customizationNote: 'VIP 1-on-1 design concierge, custom finish selection & video check before dispatch',
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
    name: 'Corporate Team Pack (10 PVC + 1 CEO Metal)',
    tierLabel: 'Best for Teams · Save ₦100,000',
    audienceTag: 'business',
    category: 'corporate',
    priceNgn: 300000,
    upgradeHighlight: 'Equip your entire sales or leadership team in one rollout—includes 1 free CEO Metal card.',
    shortDescription:
      'Complete company rollout kit: 10 custom-branded staff Matte PVC NFC cards plus 1 laser-engraved Executive Metal card for the MD/CEO, with centralized staff profile control.',
    features: [
      '10 custom-branded staff PVC cards + 1 complimentary CEO Metal card',
      'Update any staff member’s phone number or title remotely anytime',
      'Softcopy design proofs sent for every staff card before printing',
      '12-month free chip replacement warranty across all 11 cards',
      'Priority insured nationwide delivery via DHL & GIG Logistics',
    ],
    supportsCustomization: true,
    customizationNote: 'Upload your company logo; our onboarding team sets up all 11 staff profiles',
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
    feature: 'Price (One-Time)',
    pvc: '₦30,000',
    premiumPvc: '₦35,000 (+₦5,000)',
    metal: '₦50,000 – ₦100,000',
    corporate: '₦300,000 (11 cards)',
  },
  {
    feature: 'Look & Feel',
    pvc: 'Crisp Ceramic White PVC',
    premiumPvc: 'Matte Black Soft-Touch PVC',
    metal: 'Weighted Stainless Steel',
    corporate: '10 Staff PVC + 1 CEO Metal',
  },
  {
    feature: 'Print / Engraving Durability',
    pvc: 'Full-color waterproof print',
    premiumPvc: 'Raised UV print + anti-scratch coat',
    metal: 'Scratch-proof laser engraving (never fades)',
    corporate: 'Unified company brand print + laser CEO card',
  },
  {
    feature: 'Phone Compatibility',
    pvc: 'Every iPhone & Android (1s tap + QR)',
    premiumPvc: 'Every iPhone & Android (1s tap + QR)',
    metal: 'Every iPhone & Android (1s tap + QR)',
    corporate: 'Every iPhone & Android (All 11 cards)',
  },
  {
    feature: 'Softcopy Proof Before Print',
    pvc: 'Included on WhatsApp & Email',
    premiumPvc: 'Included on WhatsApp & Email',
    metal: 'Included + pre-dispatch video check',
    corporate: 'Individual staff proofs + onboarding',
  },
  {
    feature: 'Delivery Speed',
    pvc: 'Lagos 24–48h · Nationwide 2–4 days',
    premiumPvc: 'Lagos 24–48h · Nationwide 2–4 days',
    metal: 'Lagos 24–48h · Nationwide 2–4 days',
    corporate: 'Lagos 2–3 days · Nationwide 3–5 days',
  },
  {
    feature: 'Chip Replacement Warranty',
    pvc: '12-Month Free Replacement',
    premiumPvc: '12-Month Free Replacement',
    metal: '12-Month Free Replacement',
    corporate: '12-Month Free Replacement (All)',
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
    id: 'pvc-30k-vs-35k',
    question: 'What is the exact difference between the ₦30,000 White PVC and ₦35,000 Premium Matte Black PVC?',
    answer:
      'Both cards work identically on every iPhone and Android in 1 second and include a backup QR code, free design proof, and 12-month chip warranty. The ₦30,000 card has a crisp ceramic white finish (great for colorful logos). The extra ₦5,000 on the ₦35,000 card upgrades you to a sleek Matte Black soft-touch body with raised, waterproof, anti-scratch UV printing on both sides that resists wallet scuffs and fingerprints.',
  },
  {
    id: 'chip-warranty-fails',
    question: 'What happens if the NFC chip stops working or my card arrives damaged?',
    answer:
      'Every CHIPNG card is backed by our 12-Month Hardware & Chip Replacement Guarantee. If your NFC chip ever stops scanning on compatible phones under normal use, or if your card arrives with any transit damage or print defect (reported within 48 hours of delivery), we replace your card free of charge.',
  },
  {
    id: 'need-an-app',
    question: 'Do my clients need to download an app to view my card?',
    answer:
      'No. Anyone you meet simply taps your card against their iPhone or Android (or scans the backup QR code with their camera) and your digital business profile opens immediately in Safari or Chrome—zero downloads, zero sign-up.',
  },
  {
    id: 'custom-logo',
    question: 'Will I see how my card looks before you print or engrave it?',
    answer:
      'Yes—always. You upload your logo and details during checkout (or send them on WhatsApp afterward). Our Lagos studio designs your custom front-and-back softcopy proof and sends it to your WhatsApp and email. We never print or engrave until you say “approved.”',
  },
  {
    id: 'delivery-outside-lagos',
    question: 'How fast is delivery in Lagos and outside Lagos?',
    answer:
      'Once you approve your design proof, Lagos orders are produced and delivered in 24–48 hours with live rider tracking from Lekki Phase 1. Orders to Abuja, Port Harcourt, Kano, Ibadan, Enugu, and all 36 states arrive in 2–4 business days via insured DHL Express and GIG Logistics.',
  },
  {
    id: 'update-info-later',
    question: 'Can I change my phone number, role, or links after receiving the card?',
    answer:
      'Yes. Your physical card links to your live CHIPNG profile. Whenever you change your phone number, job title, company, website, or social media handles in your dashboard, your card updates instantly—you never have to reprint.',
  },
  {
    id: 'android-and-iphone',
    question: 'Does the card work on both iPhone and Android?',
    answer:
      'Yes. Every CHIPNG card uses a battery-free NXP NTAG216 contactless chip that works in 1 second on iPhone XR/XS and newer plus modern NFC-enabled Android phones. Every card also carries a built-in QR code on the back so older phones can scan with their normal camera.',
  },
  {
    id: 'subscription-based',
    question: 'Do I have to pay a monthly subscription fee?',
    answer:
      'No monthly fee is required. Your one-time card purchase includes lifetime hosting for your core digital business profile (unlimited taps, one-tap contact saving, links, and updates). You also get 3 months of optional CHIP Pro analytics free—if you skip Pro afterward, your card keeps working forever.',
  },
  {
    id: 'corporate-multiple-cards',
    question: 'Can I order multiple NFC cards for my company or staff?',
    answer:
      'Yes. You can order any quantity at checkout or pick our Corporate Team Pack (₦300,000 for 10 custom staff PVC cards + 1 complimentary CEO Metal card). We handle uniform branding, individual staff proofs, and ongoing new-hire reorders.',
  },
  {
    id: 'lost-card',
    question: 'What happens if I misplace my card?',
    answer:
      'Nothing private is stored on the physical card itself—your profile stays safe in your CHIPNG account. You can pause or edit your links anytime and message us on WhatsApp (08100764154) to print a replacement linked to your existing profile.',
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
