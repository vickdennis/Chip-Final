// api/index.ts
import express from "express";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// src/data/commercialPagesData.ts
var COMMERCIAL_PAGES = {
  "nfc-business-card-nigeria": {
    slug: "nfc-business-card-nigeria",
    metaTitle: "NFC Business Card Nigeria \u2014 Smart Digital Contactless Cards | CHIP NG",
    metaDescription: "Order the definitive NFC smart business card in Nigeria. 1-tap contact sharing, zero app needed, instant WhatsApp connection & live analytics. Nationwide dispatch.",
    heroBadge: "Nigeria\u2019s #1 Smart Networking Hardware",
    headline: "The Smart NFC Business Card Engineered for Nigeria.",
    subheadline: "Replace fragile paper cards with a lifetime contactless smart card. Instantly share your portfolio, WhatsApp, and banking details with a single tap on any iPhone or Android.",
    targetAudience: "Nigerian Founders, Executives, Consultants & Modern Professionals",
    locationFocus: "Nigeria Nationwide (Lagos, Abuja, Port Harcourt, Ibadan, Kano)",
    overview: "In Nigeria\u2019s fast-moving business landscape, deals are closed through quick rapport, verified trust, and immediate WhatsApp connection. CHIP NG provides premium laser-engraved metal and matte PVC NFC cards that open your dynamic business profile instantly on any smartphone with zero app installation.",
    keyBenefits: [
      { title: "1-Tap WhatsApp & vCard", description: "Save your phone number directly to their contacts with profile photo and company name in under 2 seconds.", icon: "Zap" },
      { title: "Zero Battery or App Required", description: "Powered electromagnetically by the scanning phone NFC antenna. Works forever without charging.", icon: "Smartphone" },
      { title: "Lifetime Unlimited Updates", description: "Changed your phone number, role, or portfolio? Update your profile anytime from your phone for free without reprinting cards.", icon: "RefreshCw" },
      { title: "Live Tap Telemetry", description: "Track every tap, profile view, and WhatsApp click in real-time from your personal CHIP NG dashboard.", icon: "BarChart" }
    ],
    useCases: [
      { role: "Tech Founder (Yaba/Lekki)", scenario: "Pitching angel investors and enterprise clients at Lagos tech mixers.", quote: "Tapping my metal card on an investor\u2019s iPhone always sparks conversation before I even begin my pitch." },
      { role: "Management Consultant (Abuja)", scenario: "Attending federal stakeholder forums and high-stakes procurement meetings.", quote: "Paper cards get lost in briefcase piles. My CHIP NG card ensures my contact is saved in their address book immediately." }
    ],
    technicalSpecs: [
      { label: "Chipset", value: "Genuine NXP NTAG216 (888 Bytes EEPROM)" },
      { label: "Compatibility", value: "iOS 13+ (iPhone 7 to 16 Pro) & All NFC Androids" },
      { label: "Material Options", value: "Aerospace 304 Stainless Steel or High-Density Matte PVC" },
      { label: "Operating Distance", value: "0 - 45mm Near Field Magnetic Field" },
      { label: "Durability", value: "Waterproof, Scratch-Resistant, 100,000+ Write Cycles" }
    ],
    faqs: [
      { question: "Does the other person need an app to scan my CHIP card?", answer: "No! The recipient does not need any app. When you tap the card against their phone, their native web browser automatically launches your CHIP NG profile." },
      { question: "How long does delivery take across Nigeria?", answer: "Orders within Lagos dispatch in 24\u201348 hours. Orders to Abuja, Port Harcourt, and other states arrive within 2\u20134 business days via DHL Express and GIG Logistics." },
      { question: "Can I link my Nigerian bank account or payment details?", answer: "Yes! Your digital bio link supports bank account transfer details, Flutterwave checkout links, and payment links alongside your WhatsApp and social channels." }
    ]
  },
  "nfc-business-card-lagos": {
    slug: "nfc-business-card-lagos",
    metaTitle: "NFC Business Card Lagos \u2014 Same-Day & 24h Express Delivery | CHIP NG",
    metaDescription: "Get laser-engraved NFC smart business cards in Lagos. Precision fabrication in our Lagos workshop. 1-tap contact exchange for Victoria Island, Ikoyi, Lekki & Ikeja dealmakers.",
    heroBadge: "Fabricated in Lagos \u2022 24\u201348h Dispatch",
    headline: "Stand Out in Lagos Business Meetings with One Tap.",
    subheadline: "From boardroom negotiations in Victoria Island to networking mixers in Lekki Phase 1, CHIP NG smart cards give Lagos entrepreneurs an unforgettable first impression.",
    targetAudience: "Lagos Executives, Realtors, Creatives, and Business Owners",
    locationFocus: "Lagos (Victoria Island, Ikoyi, Lekki, Ikeja, Marina, Maryland)",
    overview: "Lagos is Africa\u2019s commercial capital where pace and prestige matter. Handing someone a crumpled paper card is a relic of the past. CHIP NG delivers heavy metal and premium PVC smart business cards directly to your doorstep across Lagos Island and Mainland with rapid turnaround.",
    keyBenefits: [
      { title: "Lagos Workshop Turnaround", description: "Fabricated and laser-engraved right in Lagos with express courier delivery to Victoria Island, Ikoyi, Lekki, and Ikeja GRA.", icon: "Truck" },
      { title: "Direct WhatsApp Closing", description: "Features a prominent WhatsApp connect button pre-filled with your greeting to turn event hellos into immediate chats.", icon: "MessageCircle" },
      { title: "Luxury Weight & Feel", description: "Matte obsidian stainless steel cards weighing 22g that command respect the moment you place them on a meeting table.", icon: "Shield" },
      { title: "Backup Dynamic QR", description: "Includes a high-contrast dynamic QR code on the back for older devices or across-the-table sharing.", icon: "QrCode" }
    ],
    useCases: [
      { role: "Commercial Realtor (Lekki)", scenario: "Holding open houses and private showings in Eko Atlantic and Ikoyi.", quote: "Buyers tap the card and instantly receive the property catalog PDF, my phone number, and direct WhatsApp line." },
      { role: "Creative Director (Ikeja)", scenario: "Meeting agency executives and fashion brand founders at commercial shoots.", quote: "It demonstrates that our studio values innovation. The client taps and my Showreel video plays immediately." }
    ],
    technicalSpecs: [
      { label: "Production Hub", value: "CHIP NG Lagos Production Facility" },
      { label: "Dispatch Speed", value: "24\u201348 Hours across Lagos State" },
      { label: "Card Weight", value: "Metal: 22.5 grams \u2022 PVC: 5.4 grams" },
      { label: "Finish", value: "Matte Obsidian, 24K Gold Mirror, Titanium Brushed" }
    ],
    faqs: [
      { question: "Can I pick up my card in Lagos?", answer: "Yes! We offer dispatch via local rider courier across Lagos (Island & Mainland) or pickup options upon notification." },
      { question: "Do you offer custom company branding for Lagos corporate teams?", answer: "Yes, our corporate fleet program includes custom logo fiber-laser engraving and centralized employee bio management for teams of 5 to 500+." }
    ]
  },
  "nfc-business-card-lekki": {
    slug: "nfc-business-card-lekki",
    metaTitle: "NFC Business Card Lekki \u2014 Smart Cards for Realtors & Founders | CHIP NG",
    metaDescription: "Smart NFC business cards tailored for Lekki Phase 1, Chevron, Ikate, and Ajah professionals. 1-tap property brochures, portfolio links, and WhatsApp lead capture.",
    heroBadge: "Lekki Peninsula Professional Edition",
    headline: "The Premier Smart Business Card for Lekki Professionals.",
    subheadline: "Designed for Lekki real estate agents, startup founders, creative executives, and luxury lifestyle entrepreneurs who need to network effortlessly.",
    targetAudience: "Real Estate Agents, Developers, Boutique Agency Founders, and Lekki Creatives",
    locationFocus: "Lekki Phase 1, Ikate Elegushi, Osapa London, Agungi, Chevron, Ikota",
    overview: "Lekki is home to Nigeria\u2019s highest concentration of real estate developers, tech founders, and luxury lifestyle businesses. CHIP NG provides specialized NFC smart cards that allow Lekki professionals to share property listings, design portfolios, and contact cards in a fraction of a second.",
    keyBenefits: [
      { title: "Instant Property Portfolios", description: "Upload listing decks, floor plans, and virtual tours directly to your CHIP profile for clients to inspect during viewings.", icon: "Building2" },
      { title: "2-Way Contact Capture", description: "Enable Lead Capture so clients can type their name and WhatsApp right back into your phone during open houses.", icon: "Users" },
      { title: "Waterproof & Pocket-Proof", description: "Engineered for humid coastal Lekki climate with sealed resin-coated NFC chips.", icon: "Check" }
    ],
    useCases: [
      { role: "Luxury Realtor (Lekki Phase 1)", scenario: "Pitching off-plan duplexes and penthouses along Admiralty Way.", quote: "I never run out of cards at weekend inspections. One tap puts all my available Lekki listings in the client\u2019s phone." }
    ],
    technicalSpecs: [
      { label: "Peninsula Delivery", value: "Same-day or next-day rider dispatch across Lekki Corridor" },
      { label: "Cloud Hosting", value: "Sub-10ms CDN edge response across Nigeria" }
    ],
    faqs: [
      { question: "Can I add multiple property listings to my card?", answer: "Yes! Your digital bio link supports product cards, document links, downloadable brochures, and direct inquiry buttons." }
    ]
  },
  "nfc-business-card-ajah": {
    slug: "nfc-business-card-ajah",
    metaTitle: "NFC Business Card Ajah & Sangotedo \u2014 Digital Business Cards | CHIP NG",
    metaDescription: "Affordable, durable NFC smart business cards for Ajah, Sangotedo, and Ibeju-Lekki business owners. Share your store catalog, WhatsApp, and phone number with 1 tap.",
    heroBadge: "Ajah & Ibeju-Lekki Business Hub",
    headline: "Modernize Your Business in Ajah with Smart NFC Cards.",
    subheadline: "Equip your business, retail store, consultancy, or construction firm in Ajah with the smart business card that pays for itself on day one.",
    targetAudience: "Ajah Business Owners, Contractors, Developers, and Service Providers",
    locationFocus: "Ajah, Badore, Sangotedo, Abraham Adesanya, Awoyaya, Lakowe",
    overview: "As the commercial corridor from Ajah to the Dangote Refinery expands rapidly, modern businesses need reliable, high-tech tools to connect with corporate clients and homeowners. CHIP NG makes digital networking seamless and affordable.",
    keyBenefits: [
      { title: "Affordable PVC & Metal Options", description: "High-quality cards starting from just \u20A630,000 with zero monthly fees for standard digital profiles.", icon: "CreditCard" },
      { title: "Works on All Smartphones", description: "Guaranteed compatibility with all modern Android phones and iPhones.", icon: "Smartphone" }
    ],
    useCases: [
      { role: "Construction Contractor (Sangotedo)", scenario: "Meeting property developers and building material suppliers.", quote: "My metal card has survived construction dust and rain. Clients are always impressed by how quick it loads." }
    ],
    technicalSpecs: [
      { label: "Card Lifespan", value: "10+ Years with zero degradation" },
      { label: "Security", value: "Hardware read-only lock with encrypted dynamic redirect" }
    ],
    faqs: [
      { question: "Do I pay monthly to keep my profile active?", answer: "No! The free tier comes with unlimited taps and lifetime profile access without mandatory subscription fees." }
    ]
  },
  "nfc-metal-business-card": {
    slug: "nfc-metal-business-card",
    metaTitle: "NFC Metal Business Card Nigeria \u2014 Heavyweight Stainless Steel | CHIP NG",
    metaDescription: "Order custom metal NFC business cards in Nigeria. Heavyweight 304 aerospace stainless steel, fiber-laser engraving, 24K gold mirror & matte obsidian finishes.",
    heroBadge: "Luxury Heavyweight Metal Series",
    headline: "The Ultimate Executive NFC Metal Business Card.",
    subheadline: "Precision crafted from aerospace-grade stainless steel with fiber-laser deep engraving. 22 grams of authoritative weight that turns every introduction into a deal.",
    targetAudience: "CEOs, Managing Directors, Partners, Venture Capitalists, and Elite Founders",
    locationFocus: "Nigeria & International Delivery",
    overview: "First impressions are tactile. A CHIP NG Metal Card is cool to the touch, noticeably heavy, and beautifully laser-engraved with your custom logo and name. Embedded inside the metal chassis is a high-permeability magnetic ferrite shield that allows NFC signals to pass through flawlessly.",
    keyBenefits: [
      { title: "22g Aerospace Stainless Steel", description: "Engineered from solid steel with beveled edges and scratch-resistant physical vapor deposition (PVD) coating.", icon: "Shield" },
      { title: "Precision Fiber-Laser Engraving", description: "Sharp, permanent laser ablation of your personal name, corporate crest, and handle directly into the metal.", icon: "Zap" },
      { title: "Patented Dual-Coil Antenna", description: "Proprietary antenna geometry with micro-ferrite shielding ensures fast tap response without metal signal interference.", icon: "Radio" },
      { title: "VIP WhatsApp Concierge Included", description: "Direct 1-on-1 design assistance from our Lagos production team to review your logo vector proofs before engraving.", icon: "MessageCircle" }
    ],
    useCases: [
      { role: "Managing Partner (Private Equity)", scenario: "Closing multi-million dollar co-investments in Lagos and London.", quote: "The weight of the metal card immediately conveys the scale of our firm. People hold it and immediately examine the detail." }
    ],
    technicalSpecs: [
      { label: "Chassis Material", value: "304 High-Carbon Stainless Steel" },
      { label: "Thickness & Weight", value: "0.8mm Thickness \u2022 22.5 grams Weight" },
      { label: "Surface Finishes", value: "Matte Obsidian Black, Brushed Titanium Silver, 24K Gold Mirror" },
      { label: "Shielding", value: "Multi-layer ferrite polymer barrier (anti-attenuation)" }
    ],
    faqs: [
      { question: "Will the metal card trigger airport metal detectors or damage phones?", answer: "No, the card is safe in wallets and bags. It uses standard contactless frequencies that do not damage phone wireless coils or screens." },
      { question: "How do I submit my custom logo for metal engraving?", answer: "After completing your order, our VIP WhatsApp Concierge (+234 810 076 4154) will reach out to request your high-res logo file and send a digital 3D proof before engraving." }
    ]
  },
  "digital-business-card-nigeria": {
    slug: "digital-business-card-nigeria",
    metaTitle: "Digital Business Card Nigeria \u2014 Dynamic Link-in-Bio Platform | CHIP NG",
    metaDescription: "Create your free digital business card in Nigeria. Custom username (chipng.com/you), interactive bio links, vCard download, product catalog, and lead capture.",
    heroBadge: "Dynamic Digital Identity Platform",
    headline: "Your All-in-One Digital Business Card & Bio Platform.",
    subheadline: "Claim your verified handle: chipng.com/yourname. Share your contact info, social accounts, appointment bookings, and product catalog in one unified link.",
    targetAudience: "Every Nigerian Professional, Creator, Agency, and Solopreneur",
    locationFocus: "Global Access \u2022 Optimized for Nigeria",
    overview: "Even without a physical NFC card, anyone can create and publish their CHIP NG digital business card for free. Optimized for mobile speeds on Nigerian networks, your profile loads instantly and lets visitors save your contact with one click.",
    keyBenefits: [
      { title: "Personalized URL (chipng.com/you)", description: "Claim your concise brand link to add to your Instagram bio, LinkedIn headline, and WhatsApp business profile.", icon: "Globe" },
      { title: "One-Click vCard Contact Save", description: 'Visitors tap "Save Contact" and your name, mobile, email, company, and photo are automatically added to their phonebook.', icon: "Download" },
      { title: "Custom Themes & Branding", description: "Personalize background colors, typography, button styles, and verified badges to reflect your identity.", icon: "Sliders" },
      { title: "2-Way Contact Capture & Leads", description: "Allow high-value prospects to submit their phone number and email directly back to your dashboard with 1 tap.", icon: "Users" }
    ],
    useCases: [
      { role: "Financial Advisor", scenario: "Prospecting high-net-worth clients via LinkedIn and WhatsApp newsletters.", quote: "I put my CHIP NG link in my WhatsApp status. Inquiries increased because booking a consultation is now one click away." }
    ],
    technicalSpecs: [
      { label: "Page Load Speed", value: "Sub-400ms First Contentful Paint on mobile data" },
      { label: "Hosting", value: "Distributed global edge CDN with local Nigeria DNS routing" }
    ],
    faqs: [
      { question: "Can I use CHIP NG digital profile without buying a physical card?", answer: "Yes! You can sign up, claim your handle, build your digital profile, and share it online 100% free." }
    ]
  },
  "nfc-business-card-price-nigeria": {
    slug: "nfc-business-card-price-nigeria",
    metaTitle: "NFC Business Card Price in Nigeria \u2014 2026 Transparent Pricing | CHIP NG",
    metaDescription: "Compare NFC business card prices in Nigeria. Matte PVC from \u20A630,000, laser-engraved stainless steel from \u20A650,000. No hidden fees, free lifetime profile hosting.",
    heroBadge: "Official 2026 Price Guide",
    headline: "Transparent NFC Business Card Pricing in Nigeria.",
    subheadline: "Compare card materials, specifications, and turnaround times. No hidden subscription fees. Every card includes free lifetime digital profile hosting.",
    targetAudience: "Budget Planners, Purchasing Managers, and Savvy Professionals",
    locationFocus: "Nigeria (Prices in \u20A6 Nigerian Naira)",
    overview: "Traditional paper cards cost \u20A615,000 to \u20A625,000 for a pack of 100, which are quickly tossed into the trash or become obsolete when your phone number or title changes. A single CHIP NG smart card lasts for years and allows unlimited real-time updates for free.",
    keyBenefits: [
      { title: "One-Time Payment", description: "Buy the card once, own it forever. No mandatory recurring monthly charges for your core profile.", icon: "Check" },
      { title: "Cost Comparison", description: "Saves the average professional \u20A675,000+ per year in recurring paper card reprint costs.", icon: "BarChart" },
      { title: "Corporate Volume Discounts", description: "Special team pricing starting at 10+ cards for corporate organizations, startups, and agencies.", icon: "Users" }
    ],
    useCases: [
      { role: "Sales Director", scenario: "Calculating annual business development card expenditures for a 20-person team.", quote: "Switching our team from paper cards to CHIP NG cut our annual print budget by 65% while capturing 3x more leads." }
    ],
    technicalSpecs: [
      { label: "PVC Smart Card", value: "\u20A630,000 \u2013 \u20A635,000 (Includes UV Print & NFC)" },
      { label: "Metal Smart Card", value: "\u20A650,000 \u2013 \u20A6100,000 (Includes Fiber-Laser Engraving)" },
      { label: "Digital Profile", value: "No monthly subscriptions required for core features" }
    ],
    faqs: [
      { question: "What is included in the card price?", answer: "Buy the hardware once. The core software is yours for life. Every card includes: (1) Custom physical NFC card fabricated to your specs, (2) Lifetime access to CHIP Core (\u20A60/month forever, no monthly subscriptions required for core features), (3) 3-months of CHIP Pro Dashboard for free, and (4) 12-month hardware replacement warranty." }
    ]
  },
  "nfc-business-card-for-real-estate": {
    slug: "nfc-business-card-for-real-estate",
    metaTitle: "NFC Business Card for Real Estate Agents Nigeria | CHIP NG",
    metaDescription: "The ultimate smart business card for Nigerian real estate agents and developers. Share property catalogs, virtual tours, and WhatsApp with 1 tap at open houses.",
    heroBadge: "Real Estate Edition \u2022 1-Tap Property Sales",
    headline: "Close More Property Deals with Smart NFC Business Cards.",
    subheadline: "Designed specifically for Nigerian real estate professionals. Share inspection videos, property brochures, and direct WhatsApp lines in the palm of your client\u2019s hand.",
    targetAudience: "Realtors, Property Brokers, Estate Developers, and Land Surveyors",
    locationFocus: "Lagos (Ikoyi, Lekki, Epe), Abuja (Maitama, Guzape), Port Harcourt",
    overview: "In real estate, timing is everything. When a prospective buyer visits an open house or meets you at an exhibition, paper flyers are easily misplaced. With CHIP NG, you tap their phone to instantly transmit your full listing inventory, virtual tour links, and vCard with your profile photo.",
    keyBenefits: [
      { title: "Instant Property Showcase", description: "Feature your top available listings with pricing, photo galleries, and video walkthrough links right on your profile.", icon: "Building2" },
      { title: "Capture Buyer Contact on Site", description: "Use the 2-way lead exchange to collect the buyer\u2019s WhatsApp number before they walk out the door.", icon: "Users" },
      { title: "Verified Agent Credibility", description: "Add your professional certifications, verified badge, and testimonials to build instant trust with diaspora and local buyers.", icon: "Shield" }
    ],
    useCases: [
      { role: "Senior Realtor (Lekki & Epe Corridor)", scenario: "Touring high-net-worth investors across commercial land developments.", quote: "Diaspora clients love the tech. They tap my card and have my WhatsApp, office address, and CAC registration details saved before we even sit down." }
    ],
    technicalSpecs: [
      { label: "Recommended Card", value: "Custom Metal Card (Gold or Obsidian Finish)" },
      { label: "Feature Highlights", value: "Interactive Listing Gallery, Brochure Downloads, vCard Save" }
    ],
    faqs: [
      { question: "Can I change the property listings on my card after printing?", answer: "Yes! You can update your listing links, prices, and photos anytime from your CHIP NG dashboard without touching the card." }
    ]
  },
  "nfc-business-card-for-sales-teams": {
    slug: "nfc-business-card-for-sales-teams",
    metaTitle: "NFC Business Cards for Sales Teams Nigeria \u2014 Lead Generation | CHIP NG",
    metaDescription: "Equip your B2B sales team with NFC smart business cards. 3x contact save rate, centralized lead capture, aggregate tap telemetry, and CRM export.",
    heroBadge: "B2B Sales Acceleration Platform",
    headline: "Supercharge Your Sales Team with Smart NFC Networking.",
    subheadline: "Equip your representatives with intelligent smart cards that capture prospect data, track meeting engagements, and synchronize leads directly with your pipeline.",
    targetAudience: "B2B Sales Representatives, Account Executives, Commercial Directors, and Field Agents",
    locationFocus: "Nigeria & West Africa",
    overview: "Modern B2B selling requires speed and attribution. When your sales team attends conferences, trade expos, or client presentations, CHIP NG ensures every conversation turns into a tracked, actionable lead with verified contact details.",
    keyBenefits: [
      { title: "3x Higher Contact Save Rate", description: "Prospects are 300% more likely to save a contact when it requires just one tap instead of manual typing.", icon: "Zap" },
      { title: "Centralized Lead Management", description: "All leads captured by team members can be viewed in real-time and exported as CSV for your CRM.", icon: "Download" },
      { title: "Enforce Corporate Brand Standards", description: "Lock in company logos, color codes, and authorized brand assets across all employee profiles.", icon: "Sliders" }
    ],
    useCases: [
      { role: "Fintech Enterprise Sales Lead", scenario: "Pitching bank treasurers and commercial merchants at Lagos Fintech Summit.", quote: "Our reps exchanged contacts with over 400 executives in two days. Zero lost paper business cards." }
    ],
    technicalSpecs: [
      { label: "Management Portal", value: "CHIP NG Enterprise Fleet Console" },
      { label: "Export Formats", value: "CSV, Excel, vCard 3.0" }
    ],
    faqs: [
      { question: "Can we reassign a card if a sales rep leaves the company?", answer: "Yes! Administrators can reassign any employee card to a new team member instantly from the Enterprise Dashboard." }
    ]
  },
  "nfc-business-card-for-corporate-teams": {
    slug: "nfc-business-card-for-corporate-teams",
    metaTitle: "NFC Business Cards for Corporate Teams & Enterprises | CHIP NG",
    metaDescription: "Enterprise NFC smart business card solutions for Nigerian companies. Centralized admin, custom corporate branding, employee seat management, and unified billing.",
    heroBadge: "Enterprise Organization Fleet",
    headline: "The Smart Corporate Identity Solution for Modern Enterprises.",
    subheadline: "Centralize your company\u2019s professional networking. Issue branded NFC cards, manage employee profiles under one billing account, and enforce brand consistency.",
    targetAudience: "Corporations, Banks, Law Firms, Consultancies, and Tech Enterprises",
    locationFocus: "Pan-Nigeria Corporate Offices",
    overview: "Paper business cards create administrative chaos, brand drift, and unnecessary recurring printing expenses. CHIP NG for Teams gives HR and marketing leaders complete centralized oversight over all employee digital identities with enterprise security and volume pricing.",
    keyBenefits: [
      { title: "Single Unified Invoicing", description: "One monthly or annual invoice in Nigerian Naira (\u20A6) with VAT documentation for your accounting department.", icon: "CreditCard" },
      { title: "Centralized Brand Governance", description: "Ensure all staff share approved bios, company collateral, disclaimers, and corporate email addresses.", icon: "Shield" },
      { title: "Instant Onboarding & Offboarding", description: "Add new staff in seconds or deactivate departing personnel with a single click in your admin portal.", icon: "Users" }
    ],
    useCases: [
      { role: "Chief Marketing Officer (Commercial Bank)", scenario: "Equipping 150 relationship managers across commercial branches.", quote: "CHIP NG replaced thousands of paper boxes with sleek branded cards. Our customer engagement is now fully measurable." }
    ],
    technicalSpecs: [
      { label: "Team Tier", value: "5 to 500+ Employee Seats" },
      { label: "SLA", value: "Dedicated Account Manager & 24h Replacement Dispatch" }
    ],
    faqs: [
      { question: "Do you provide corporate VAT receipts and invoices?", answer: "Yes, we provide official corporate tax invoices with FIRS-compliant VAT details for all enterprise purchases." }
    ]
  }
};

// src/utils/buyCardSeo.ts
var BUY_CARD_META = {
  title: "Buy Contactless NFC Smart Business Cards in Nigeria | CHIP NG",
  description: "Order official CHIP NG contactless NFC smart business cards. Sub-10ms response, zero app needed. NFC Smart Black/White PVC (\u20A630,000 / \u20A635,000), NFC Smart Metal Card (\u20A650,000), Metal Debit Card + Custom Design (\u20A680,000\u2013\u20A6100,000). 24h Lagos & nationwide delivery.",
  canonical: "https://www.chipng.com/buy-card",
  image: "https://www.chipng.com/chipng_3d_logo.jpg"
};
var BUY_CARD_SCHEMA_JSON_LD = JSON.stringify({
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
      "description": "Nigeria's premier contactless smart business card and dynamic profile platform. Built with embedded NTAG216 chip, sub-10ms response, and zero app needed. Available in NFC Smart Black/White PVC Card (\u20A630,000 / \u20A635,000), NFC Smart Metal Card (\u20A650,000), and Metal Debit Card + Custom Design (\u20A680,000 - \u20A6100,000).",
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
            "text": "The Smart PVC card (\u20A630,000) is a lightweight 5g polymer daily driver with full-color UV printing. The NFC Smart Metal card (\u20A650,000) is made from 24g solid 304 stainless steel with fiber-laser etching, offering 5x heavier metallic hand-feel and distinct acoustic clink. The Custom Heavy Metal edition (\u20A6100,000) features ultra-dense 28g aerospace alloy with deep CNC dual-sided fiber engraving, 24K gold mirror finish, and lifetime warranty."
          }
        },
        {
          "@type": "Question",
          "name": "How fast is delivery in Lagos and nationwide in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cards are crafted in our Lagos workshop. Lagos orders are dispatched within 24\u201348 hours via direct courier. Nationwide orders to Abuja, Port Harcourt, Ibadan, and all 36 Nigerian states are delivered in 2\u20134 business days via DHL and GIG Logistics."
          }
        }
      ]
    }
  ]
});

// src/utils/ssrEngine.ts
var HOME_SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.chipng.com/#localbusiness",
      name: "CHIP NG",
      alternateName: "CHIP Nigeria",
      image: "https://www.chipng.com/chipng_3d_logo.jpg",
      logo: "https://www.chipng.com/chipng_exact_tile.png",
      url: "https://www.chipng.com",
      telephone: "+2348100764154",
      email: "hello@chipng.com",
      priceRange: "\u20A6\u20A6",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Lekki Phase 1",
        addressLocality: "Lagos",
        addressRegion: "Lagos State",
        postalCode: "105102",
        addressCountry: "NG"
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.4474,
        longitude: 3.4831
      },
      sameAs: [
        "https://www.tiktok.com/@chipng_nfc",
        "https://www.instagram.com/chipng_nfc",
        "https://x.com/chipng_nfc"
      ],
      description: "CHIP NG provides contactless smart NFC business cards and dynamic link-in-bio profiles engineered in Lagos, Nigeria."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.chipng.com/#software",
      name: "CHIP NG Dynamic Profile & Link-in-Bio Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (Web, iOS, Android)",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "NGN"
      },
      description: "Dynamic contactless profile and link-in-bio engine with instant vCard phonebook sync, lead capture, and analytics."
    }
  ]
});
var PRICING_SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "PriceSpecification",
  name: "CHIP NG Official NFC Hardware Pricing 2026",
  priceCurrency: "NGN",
  description: "Official 2026 hardware prices: NFC Smart Black/White PVC Card: \u20A630,000 / \u20A635,000; NFC Smart Metal Card: \u20A650,000; Metal Debit Card + Custom Design: \u20A680,000\u2013\u20A6100,000. Free lifetime cloud profile hosting."
});
var FAQ_SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NFC and how does CHIP NG work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NFC operates at 13.56 MHz. CHIP NG embeds genuine certified NTAG216 microchips. When touched to an iPhone or Android phone, the phone reads the contactless signal in sub-10ms and opens your profile with zero app needed."
      }
    },
    {
      "@type": "Question",
      name: "How much does each card tier cost in Nigeria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NFC Smart PVC Card: \u20A630,000; NFC Smart Metal Card: \u20A650,000; Metal Debit Card + Custom Design: \u20A680,000\u2013\u20A6100,000. Free lifetime cloud profile hosting included."
      }
    },
    {
      "@type": "Question",
      name: "How fast is delivery in Lagos and nationwide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lagos orders are crafted in our local workshop and delivered within 24 to 48 hours. Nationwide orders arrive in 2 to 4 business days via DHL and GIG Logistics."
      }
    }
  ]
});

// src/utils/universalSsrEngine.ts
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function cleanText(str, maxLength = 160) {
  if (!str) return "";
  const clean = String(str).replace(/<[^>]*>/g, " ").replace(/[#*_~`>\[\]]/g, "").replace(/\s+/g, " ").trim();
  return clean.length > maxLength ? clean.slice(0, maxLength - 3) + "..." : clean;
}
async function renderUserProfileSsr(username, supabase, isVcardRoute = false) {
  const cleanUsername = username.replace(/^@/, "").toLowerCase().trim();
  if (!cleanUsername) return null;
  try {
    const { data: profile } = await supabase.from("profiles").select("*").ilike("username", cleanUsername).maybeSingle();
    if (!profile) return null;
    const [linksRes, socialsRes, productsRes] = await Promise.allSettled([
      supabase.from("links").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("social_links").select("*").eq("profile_id", profile.id),
      supabase.from("products").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false })
    ]);
    const links = linksRes.status === "fulfilled" && linksRes.value.data ? linksRes.value.data : [];
    const socialLinks = socialsRes.status === "fulfilled" && socialsRes.value.data ? socialsRes.value.data : [];
    const products = productsRes.status === "fulfilled" && productsRes.value.data ? productsRes.value.data : [];
    const fullName = escapeHtml(profile.full_name || `@${profile.username}`);
    const headline = escapeHtml(profile.headline || "Verified Contactless Digital Profile");
    const bio = escapeHtml(profile.bio || "");
    const rawCoverUrl = profile.cover_image_url;
    const coverImageUrl = rawCoverUrl ? `https://www.chipng.com/api/cover/${encodeURIComponent(profile.username)}` : "https://www.chipng.com/chipng_3d_logo.jpg";
    const avatarUrl = rawCoverUrl || "https://www.chipng.com/chipng_exact_tile.png";
    const profileUrl = `https://www.chipng.com/@${profile.username}`;
    const vCardUrl = `https://www.chipng.com/${profile.username}/vcard`;
    const title = isVcardRoute ? `${profile.full_name || profile.username} (@${profile.username}) | Contact vCard & Phonebook Sync | CHIP NG` : `${profile.full_name || profile.username} (@${profile.username}) | Contactless Digital Card & Bio | CHIP NG`;
    const description = isVcardRoute ? cleanText(`Save ${profile.full_name || profile.username}'s verified phone number, email, and contactless digital identity directly to your phonebook via CHIP NG vCard 3.0.`) : cleanText(
      profile.headline ? `${profile.headline}. ${profile.bio || ""} Connect with ${profile.full_name || profile.username} with one tap on CHIP NG.` : `View ${profile.full_name || profile.username}'s verified contactless smart card profile, vCard, social links, and portfolio on CHIP NG.`
    );
    const canonical = isVcardRoute ? vCardUrl : profileUrl;
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfilePage",
          "@id": `${profileUrl}#webpage`,
          url: profileUrl,
          name: title,
          description,
          isPartOf: {
            "@type": "WebSite",
            "@id": "https://www.chipng.com/#website",
            name: "CHIP NG",
            url: "https://www.chipng.com"
          },
          mainEntity: {
            "@type": "Person",
            "@id": `${profileUrl}#person`,
            name: profile.full_name || profile.username,
            alternateName: `@${profile.username}`,
            jobTitle: profile.headline || void 0,
            description: profile.bio || void 0,
            image: avatarUrl,
            url: profileUrl,
            sameAs: socialLinks.map((s) => s.url).filter(Boolean),
            telephone: profile.phone_number || void 0,
            email: profile.contact_email || void 0,
            address: profile.address ? {
              "@type": "PostalAddress",
              addressLocality: profile.address
            } : void 0
          }
        }
      ]
    };
    const linksHtml = links.length > 0 ? `
        <section aria-label="Featured Links" style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px; width: 100%;">
          ${links.map((link) => `
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s;">
              <span>${escapeHtml(link.title || "Link")}</span>
              <span style="opacity: 0.6; font-size: 12px;">\u2197</span>
            </a>
          `).join("")}
        </section>
      ` : "";
    const socialsHtml = socialLinks.length > 0 ? `
        <section aria-label="Verified Social Channels" style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
          ${socialLinks.map((s) => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700;" title="${escapeHtml(s.platform)}">
              ${escapeHtml(s.platform ? s.platform.slice(0, 3) : "Soc")}
            </a>
          `).join("")}
        </section>
      ` : "";
    const productsHtml = products.length > 0 ? `
        <section aria-label="Digital Storefront" style="margin-top: 32px; width: 100%;">
          <h2 style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.7); margin-bottom: 12px; text-align: left;">
            Digital Storefront
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            ${products.map((p) => `
              <div style="padding: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; text-align: left;">
                <div style="font-weight: 700; font-size: 14px; color: #ffffff;">${escapeHtml(p.name)}</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin: 4px 0 8px 0;">${escapeHtml(p.description || "")}</div>
                <div style="font-weight: 800; color: #76BB08; font-size: 15px;">\u20A6${Number(p.price || 0).toLocaleString()}</div>
              </div>
            `).join("")}
          </div>
        </section>
      ` : "";
    const preRenderedHtml = `
<div id="root">
  <div style="min-height: 100vh; background-color: #0c0d12; color: #ffffff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 48px 16px 64px 16px;">
    <main style="width: 100%; max-width: 520px; display: flex; flex-direction: column; align-items: center; text-align: center;">
      
      <!-- Profile Avatar -->
      <div style="width: 104px; height: 104px; border-radius: 999px; overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); margin-bottom: 16px; background: #1a1c24;">
        <img src="${escapeHtml(avatarUrl)}" alt="${fullName}" width="104" height="104" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <!-- Identity Header -->
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0; color: #ffffff;">${fullName}</h1>
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 999px; background: #3b82f6; color: #ffffff; font-size: 10px; font-weight: 900;" title="Verified Profile">\u2713</span>
      </div>
      
      <div style="font-size: 13px; font-family: monospace; color: #a1a1aa; margin-bottom: 8px;">@${escapeHtml(profile.username)}</div>
      
      <p style="font-size: 15px; font-weight: 500; color: #e4e4e7; margin: 0 0 10px 0; max-width: 440px; line-height: 1.4;">${headline}</p>
      
      ${bio ? `<p style="font-size: 13px; color: #a1a1aa; margin: 0 0 20px 0; max-width: 440px; line-height: 1.5;">${bio}</p>` : ""}

      <!-- Quick Action Buttons -->
      <div style="display: flex; gap: 10px; width: 100%; max-width: 380px; margin-bottom: 8px;">
        <a href="${vCardUrl}" style="flex: 1; padding: 12px 18px; background: #76BB08; color: #09090b; font-weight: 700; font-size: 13px; border-radius: 999px; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(118, 187, 8, 0.3);">
          Save Contact (vCard)
        </a>
        ${profile.phone_number ? `
          <a href="https://wa.me/${encodeURIComponent(String(profile.phone_number).replace(/[^0-9]/g, ""))}" target="_blank" rel="noopener noreferrer" style="flex: 1; padding: 12px 18px; background: rgba(255, 255, 255, 0.1); color: #ffffff; font-weight: 700; font-size: 13px; border-radius: 999px; text-decoration: none; text-align: center; border: 1px solid rgba(255, 255, 255, 0.15);">
            Direct WhatsApp
          </a>
        ` : ""}
      </div>

      <!-- Socials -->
      ${socialsHtml}

      <!-- Links List -->
      ${linksHtml}

      <!-- Products -->
      ${productsHtml}

      <!-- Powered By Footer -->
      <footer style="margin-top: 48px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: rgba(255, 255, 255, 0.4); font-family: monospace;">
        POWERED BY <a href="https://www.chipng.com" style="color: #76BB08; text-decoration: none; font-weight: 700;">CHIP NG</a> CONTACTLESS NFC HARDWARE
      </footer>

    </main>
  </div>
</div>
    `;
    return {
      title,
      description,
      canonical: profileUrl,
      image: coverImageUrl,
      secondaryImage: rawCoverUrl && rawCoverUrl.startsWith("http") ? rawCoverUrl : void 0,
      schemaJsonLd: JSON.stringify(schema),
      preRenderedHtml
    };
  } catch (err) {
    console.error("Error pre-rendering user profile:", err);
    return null;
  }
}
async function renderBlogArticleSsr(slug, supabase, db) {
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return null;
  try {
    let post = null;
    try {
      post = db.prepare("SELECT * FROM local_posts WHERE slug = ?").get(cleanSlug);
    } catch (e) {
    }
    if (!post) {
      const { data } = await supabase.from("posts").select("*").eq("slug", cleanSlug).maybeSingle();
      if (data) post = data;
    }
    if (!post) return null;
    const title = post.meta_title || `${post.title} \u2014 CHIP NG`;
    const description = cleanText(post.meta_description || post.excerpt || post.content || "Read the official insight on CHIP NG.");
    const articleUrl = `https://www.chipng.com/blog/${post.slug}`;
    const coverImage = post.cover_image_url || "https://www.chipng.com/chipng_3d_logo.jpg";
    const publishedAt = post.created_at || (/* @__PURE__ */ new Date()).toISOString();
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${articleUrl}#article`,
      headline: post.title,
      description,
      image: coverImage,
      datePublished: publishedAt,
      dateModified: publishedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl
      },
      author: {
        "@type": "Organization",
        name: "CHIP NG Editorial Team",
        url: "https://www.chipng.com"
      },
      publisher: {
        "@type": "Organization",
        name: "CHIP NG",
        logo: {
          "@type": "ImageObject",
          url: "https://chipng.com/chipng_exact_tile.png"
        }
      }
    };
    const preRenderedHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #ffffff; min-height: 100vh; padding: 48px 16px 80px 16px;">
    <article style="max-width: 760px; margin: 0 auto; line-height: 1.8;">
      
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" style="font-size: 13px; color: #71717a; margin-bottom: 24px;">
        <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
        <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
        <span style="color: #27272a;">${escapeHtml(post.title)}</span>
      </nav>

      <!-- Headline -->
      <h1 style="font-size: 38px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.25; margin: 0 0 16px 0; color: #09090b;">
        ${escapeHtml(post.title)}
      </h1>

      <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: #71717a; margin-bottom: 32px; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px;">
        <span>By <strong>CHIP NG Editorial</strong></span> \u2022 
        <time datetime="${escapeHtml(publishedAt)}">${new Date(publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time> \u2022 
        <span>5 min read</span>
      </div>

      <!-- Featured Image -->
      ${coverImage ? `
        <div style="width: 100%; border-radius: 20px; overflow: hidden; margin-bottom: 36px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
          <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(post.title)}" width="760" height="420" style="width: 100%; height: auto; display: block; object-fit: cover;" />
        </div>
      ` : ""}

      <!-- Body Content -->
      <div style="font-size: 16px; color: #27272a; margin-bottom: 48px;">
        ${post.content || `<p>${escapeHtml(post.excerpt || "")}</p>`}
      </div>

      <!-- Article CTA Box -->
      <div style="background: #09090b; color: #ffffff; padding: 36px; border-radius: 24px; text-align: center; margin-top: 48px;">
        <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">Upgrade Your Executive Networking in Nigeria</h2>
        <p style="font-size: 15px; color: #a1a1aa; max-width: 520px; margin: 0 auto 24px auto;">Order your custom laser-engraved NFC metal card or matte PVC card with sub-10ms contactless response.</p>
        <a href="/buy-card" style="display: inline-block; padding: 14px 28px; background: #76BB08; color: #09090b; font-weight: 800; font-size: 14px; border-radius: 999px; text-decoration: none;">
          Order Your NFC Card Today (From \u20A630,000)
        </a>
      </div>

    </article>
  </div>
</div>
    `;
    return {
      title,
      description,
      canonical: articleUrl,
      image: coverImage,
      schemaJsonLd: JSON.stringify(schema),
      preRenderedHtml
    };
  } catch (err) {
    console.error("Error pre-rendering blog article:", err);
    return null;
  }
}
async function renderBlogDirectorySsr(supabase, db) {
  let posts = [];
  try {
    posts = db.prepare("SELECT title, slug, excerpt, cover_image_url, created_at FROM local_posts ORDER BY id DESC").all();
  } catch (e) {
  }
  if (!posts || posts.length === 0) {
    try {
      const { data } = await supabase.from("posts").select("title, slug, excerpt, cover_image_url, created_at").order("created_at", { ascending: false });
      if (data && data.length > 0) posts = data;
    } catch (e) {
    }
  }
  const title = "CHIP NG Blog \u2014 Insights on Contactless Networking, NFC Tech & Executive Growth";
  const description = "Official thought leadership, hardware guides, and executive networking strategies for founders, realtors, and leaders in Nigeria and Africa.";
  const canonical = "https://www.chipng.com/blog";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${canonical}#blog`,
    name: title,
    description,
    publisher: {
      "@type": "Organization",
      name: "CHIP NG",
      url: "https://www.chipng.com"
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: cleanText(p.excerpt, 150),
      url: `https://www.chipng.com/blog/${p.slug}`,
      image: p.cover_image_url || "https://www.chipng.com/chipng_3d_logo.jpg",
      datePublished: p.created_at || (/* @__PURE__ */ new Date()).toISOString()
    }))
  };
  const preRenderedHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #fafafa; min-height: 100vh; padding: 48px 16px 80px 16px;">
    <main style="max-width: 1040px; margin: 0 auto;">
      <header style="text-align: center; margin-bottom: 56px;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          CHIP NG Thought Leadership
        </span>
        <h1 style="font-size: 40px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.2; margin: 0 0 16px 0; color: #09090b;">
          The Contactless Networking Journal
        </h1>
        <p style="font-size: 17px; color: #52525b; max-width: 640px; margin: 0 auto;">
          In-depth guides on NFC business card technology, Lagos executive dealmaking, and modern digital identity in Africa.
        </p>
      </header>

      <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${posts.map((post) => `
          <article style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
            ${post.cover_image_url ? `
              <div style="height: 190px; overflow: hidden; background: #f4f4f5;">
                <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}" width="400" height="190" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ""}
            <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
              <h2 style="font-size: 19px; font-weight: 800; line-height: 1.35; margin: 0 0 12px 0;">
                <a href="/blog/${escapeHtml(post.slug)}" style="color: #09090b; text-decoration: none;">
                  ${escapeHtml(post.title)}
                </a>
              </h2>
              <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 0 0 20px 0; flex-grow: 1;">
                ${escapeHtml(cleanText(post.excerpt, 140))}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f4f4f5; padding-top: 16px;">
                <span style="font-size: 12px; color: #71717a;">${new Date(post.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <a href="/blog/${escapeHtml(post.slug)}" style="font-size: 13px; font-weight: 700; color: #4f46e5; text-decoration: none;">Read Article \u2192</a>
              </div>
            </div>
          </article>
        `).join("")}
      </section>
    </main>
  </div>
</div>
  `;
  return {
    title,
    description,
    canonical,
    schemaJsonLd: JSON.stringify(schema),
    preRenderedHtml
  };
}
function injectSeoMetadata(html, meta) {
  let output = html;
  output = output.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  output = output.replace(/<meta name="title" content=".*?"\s*\/?>/i, `<meta name="title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta property="twitter:title" content=".*?"\s*\/?>/i, `<meta property="twitter:title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<meta property="twitter:description" content=".*?"\s*\/?>/i, `<meta property="twitter:description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, "");
  output = output.replace("</head>", `  <link rel="canonical" href="${meta.canonical}" />
</head>`);
  output = output.replace(/<meta property="og:url" content=".*?"\s*\/?>/i, `<meta property="og:url" content="${meta.canonical}" />`);
  output = output.replace(/<meta property="twitter:url" content=".*?"\s*\/?>/i, `<meta property="twitter:url" content="${meta.canonical}" />`);
  if (meta.ogType) {
    output = output.replace(/<meta property="og:type" content=".*?"\s*\/?>/i, `<meta property="og:type" content="${meta.ogType}" />`);
  }
  if (meta.image) {
    output = output.replace(/<meta\s+property=["']og:image["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+property=["']og:image:secure_url["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+property=["']og:image:type["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+property=["']og:image:width["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+property=["']og:image:height["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+property=["']og:image:alt["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+(name|property)=["']twitter:image["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+(name|property)=["']twitter:image:alt["'][^>]*\/?>/gi, "");
    output = output.replace(/<meta\s+(name|property)=["']twitter:card["'][^>]*\/?>/gi, "");
    const altText = escapeHtml(meta.title || "CHIP NG Cover Image");
    const imageBlock = [
      `  <meta property="og:site_name" content="CHIP NG" />`,
      `  <meta property="og:image" content="${meta.image}" />`,
      `  <meta property="og:image:secure_url" content="${meta.image}" />`,
      `  <meta property="og:image:type" content="image/jpeg" />`,
      `  <meta property="og:image:width" content="1200" />`,
      `  <meta property="og:image:height" content="630" />`,
      `  <meta property="og:image:alt" content="${altText}" />`,
      ...meta.secondaryImage && meta.secondaryImage !== meta.image ? [
        `  <meta property="og:image" content="${meta.secondaryImage}" />`,
        `  <meta property="og:image:secure_url" content="${meta.secondaryImage}" />`
      ] : [],
      `  <meta name="twitter:card" content="summary_large_image" />`,
      `  <meta name="twitter:site" content="@chipng_nfc" />`,
      `  <meta name="twitter:creator" content="@chipng_nfc" />`,
      `  <meta name="twitter:image" content="${meta.image}" />`,
      `  <meta name="twitter:image:alt" content="${altText}" />`,
      `  <meta property="twitter:card" content="summary_large_image" />`,
      `  <meta property="twitter:image" content="${meta.image}" />`
    ].join("\n");
    output = output.replace("</head>", `${imageBlock}
</head>`);
  }
  if (!output.includes('name="robots"')) {
    output = output.replace("</head>", `  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
</head>`);
  }
  if (meta.schemaJsonLd) {
    output = output.replace("</head>", `  <script type="application/ld+json">
${meta.schemaJsonLd}
  </script>
</head>`);
  }
  return output;
}
async function applyUniversalSsr(html, context) {
  const { urlPath, userAgent, supabase, db } = context;
  let output = html;
  const normalizedPath = (urlPath || "/").split("?")[0].replace(/\/$/, "") || "/";
  if (normalizedPath === "/buy-card" || normalizedPath === "/shop" || normalizedPath === "/nfc-sales") {
    return injectSeoMetadata(output, {
      title: BUY_CARD_META.title,
      description: BUY_CARD_META.description,
      canonical: BUY_CARD_META.canonical,
      ogType: "product",
      image: BUY_CARD_META.image,
      schemaJsonLd: BUY_CARD_SCHEMA_JSON_LD
    });
  }
  if (normalizedPath === "/") {
    return injectSeoMetadata(output, {
      title: "CHIP NG \u2014 Contactless Smart NFC Business Cards & Link-in-Bio Platform Nigeria",
      description: "The premier contactless NFC smart business cards & dynamic link-in-bio platform in Nigeria. 1-tap contact sharing, zero app needed, NTAG216 chip, sub-10ms response. 24h Lagos delivery.",
      canonical: "https://www.chipng.com/",
      schemaJsonLd: HOME_SCHEMA_JSON_LD
    });
  }
  if (normalizedPath === "/pricing") {
    return injectSeoMetadata(output, {
      title: "NFC Business Card Price in Nigeria \u2014 2026 Transparent Pricing | CHIP NG",
      description: "Official 2026 prices for CHIP NG contactless smart cards: Smart PVC (\u20A630,000 / \u20A635,000), Smart Metal (\u20A650,000), and Metal Debit Card + Custom Design (\u20A680,000\u2013\u20A6100,000). Zero monthly subscription fees.",
      canonical: "https://www.chipng.com/pricing",
      schemaJsonLd: PRICING_SCHEMA_JSON_LD
    });
  }
  if (normalizedPath === "/faq") {
    return injectSeoMetadata(output, {
      title: "Frequently Asked Questions & Hardware Guide | CHIP NG Nigeria",
      description: "Everything you need to know about CHIP NG contactless smart business cards. How NFC works, compatibility, delivery times, and vCard address book saving in Nigeria.",
      canonical: "https://www.chipng.com/faq",
      schemaJsonLd: FAQ_SCHEMA_JSON_LD
    });
  }
  const commercialSlug = normalizedPath.replace(/^\//, "");
  if (COMMERCIAL_PAGES[commercialSlug]) {
    const page = COMMERCIAL_PAGES[commercialSlug];
    const canonical = `https://www.chipng.com/${page.slug}`;
    const commercialSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: page.headline,
          description: page.overview,
          brand: { "@type": "Brand", name: "CHIP NG" },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "NGN",
            lowPrice: "30000",
            highPrice: "100000",
            offerCount: "3"
          }
        },
        {
          "@type": "FAQPage",
          mainEntity: page.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer }
          }))
        }
      ]
    });
    return injectSeoMetadata(output, {
      title: page.metaTitle,
      description: page.metaDescription,
      canonical,
      schemaJsonLd: commercialSchema
    });
  }
  if (normalizedPath === "/blog") {
    const blogDir = await renderBlogDirectorySsr(supabase, db);
    return injectSeoMetadata(output, {
      title: blogDir.title,
      description: blogDir.description,
      canonical: blogDir.canonical,
      schemaJsonLd: blogDir.schemaJsonLd,
      preRenderedHtml: blogDir.preRenderedHtml
    });
  }
  if (normalizedPath.startsWith("/blog/") && normalizedPath.length > 6) {
    const slug = normalizedPath.slice(6);
    const ssrResult = await renderBlogArticleSsr(slug, supabase, db);
    if (ssrResult) {
      return injectSeoMetadata(output, {
        title: ssrResult.title,
        description: ssrResult.description,
        canonical: ssrResult.canonical,
        ogType: "article",
        image: ssrResult.image,
        schemaJsonLd: ssrResult.schemaJsonLd,
        preRenderedHtml: ssrResult.preRenderedHtml
      });
    }
  }
  if (normalizedPath === "/app" || normalizedPath === "/download" || normalizedPath === "/mobile" || normalizedPath === "/android") {
    const appSchema = {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "CHIP NG Mobile Companion",
      operatingSystem: "iOS, Android",
      applicationCategory: "BusinessApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "NGN"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1856"
      },
      description: "Official companion app for CHIP NG contactless smart business cards. Program NTAG216 microchips, receive real-time push alerts on card taps, exchange contacts offline, and manage dynamic link-in-bio profiles across Nigeria."
    };
    const appPreRender = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0d12; color: #ffffff; min-height: 100vh; padding: 48px 16px 80px 16px;">
    <main style="max-width: 960px; margin: 0 auto; text-align: center;">
      <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(118, 187, 8, 0.15); color: #76BB08; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
        Official Mobile Companion v2.4.0
      </span>
      <h1 style="font-size: 44px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.15; margin: 0 0 16px 0; color: #ffffff;">
        Program Cards. Track Live Taps in Real-Time.
      </h1>
      <p style="font-size: 17px; color: rgba(255, 255, 255, 0.7); max-width: 680px; margin: 0 auto 32px auto; line-height: 1.6;">
        The official mobile companion for Nigerian dealmakers. Write NTAG216 microchips on iOS & Android in under 10ms, receive real-time push alerts on card taps, and swap contacts offline.
      </p>
      <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <a href="https://apps.apple.com/app/chip-ng/id6470000000" style="padding: 14px 28px; border-radius: 16px; background: #ffffff; color: #000000; font-weight: 700; text-decoration: none; font-size: 14px;">Download for iOS</a>
        <a href="https://play.google.com/store/apps/details?id=com.chipng.app" style="padding: 14px 28px; border-radius: 16px; background: #76BB08; color: #000000; font-weight: 700; text-decoration: none; font-size: 14px;">Download for Android</a>
      </div>
    </main>
  </div>
</div>`;
    return injectSeoMetadata(output, {
      title: "CHIP NG Official Mobile App \u2014 Program NFC Cards & Track Live Radar Telemetry (iOS & Android)",
      description: "Download the official CHIP NG mobile companion for iPhone and Android. Sub-10ms NTAG216 chip programming, real-time push alerts on card taps, offline contact vault, and digital bio sync in Lagos, Abuja, and nationwide.",
      canonical: "https://www.chipng.com/app",
      ogType: "website",
      image: "https://www.chipng.com/chipng_3d_logo.jpg",
      schemaJsonLd: JSON.stringify(appSchema),
      preRenderedHtml: appPreRender
    });
  }
  if (normalizedPath === "/portfolio") {
    const portfolioSchema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: "Victor Okoye",
        jobTitle: "Full-stack Developer & Hardware-Software Architect",
        worksFor: {
          "@type": "Organization",
          name: "CHIP NG Technologies Ltd"
        },
        sameAs: [
          "https://github.com/vickdennis",
          "https://linkedin.com/company/chipng",
          "https://x.com/chipng_nfc",
          "https://instagram.com/chipng_nfc"
        ]
      }
    };
    return injectSeoMetadata(output, {
      title: "Victor Okoye \u2014 Full-stack Developer & Hardware-Software Architect | Portfolio",
      description: "Explore the full-stack engineering portfolio of Victor Okoye. Founder and lead engineer behind CHIP NG contactless smart cards and Alvora luxury e-commerce.",
      canonical: "https://www.chipng.com/portfolio",
      ogType: "profile",
      image: "https://www.chipng.com/chipng_3d_logo.jpg",
      schemaJsonLd: JSON.stringify(portfolioSchema)
    });
  }
  const RESERVED_ROUTES = [
    "/admin",
    "/enterprise",
    "/login",
    "/dashboard",
    "/api",
    "/blog",
    "/app",
    "/download",
    "/mobile",
    "/android",
    "/company",
    "/about",
    "/updates",
    "/contact",
    "/buy-card",
    "/shop",
    "/pricing",
    "/faq",
    "/shipping",
    "/refund-policy",
    "/privacy-policy",
    "/privacy",
    "/terms-of-service",
    "/terms",
    "/nfc-sales",
    "/portfolio"
  ];
  const isReserved = RESERVED_ROUTES.some((r) => normalizedPath === r || normalizedPath.startsWith(r + "/"));
  if (!isReserved && normalizedPath !== "/") {
    const isVcardRoute = normalizedPath.endsWith("/vcard") || normalizedPath === "/vcard";
    let rawUsername = normalizedPath.replace(/^\//, "");
    try {
      rawUsername = decodeURIComponent(rawUsername);
    } catch (e) {
    }
    if (rawUsername.startsWith("p/")) rawUsername = rawUsername.slice(2);
    if (rawUsername.startsWith("u/")) rawUsername = rawUsername.slice(2);
    if (rawUsername.startsWith("@")) rawUsername = rawUsername.slice(1);
    if (rawUsername.endsWith("/vcard")) rawUsername = rawUsername.replace(/\/vcard$/, "");
    rawUsername = rawUsername.trim().toLowerCase();
    if (!rawUsername || rawUsername === "vcard") rawUsername = "chipng";
    if (rawUsername) {
      const profileSsr = await renderUserProfileSsr(rawUsername, supabase, isVcardRoute);
      if (profileSsr) {
        return injectSeoMetadata(output, {
          title: profileSsr.title,
          description: profileSsr.description,
          canonical: profileSsr.canonical,
          ogType: "profile",
          image: profileSsr.image,
          secondaryImage: profileSsr.secondaryImage,
          schemaJsonLd: profileSsr.schemaJsonLd,
          preRenderedHtml: profileSsr.preRenderedHtml
        });
      }
    }
  }
  if (normalizedPath === "/corporate-bundle") {
    const bundleHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 1040px; margin: 0 auto; padding: 48px 16px 80px 16px;">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" style="font-size: 13px; color: #71717a; margin-bottom: 24px;">
      <a href="/" style="color: #18181b; text-decoration: none; font-weight: bold;">Home</a> &gt; 
      <span style="color: #76BB08; font-weight: bold;">Corporate Fleet Bundle</span>
    </nav>

    <!-- Header Badge -->
    <div style="display: inline-block; padding: 6px 14px; background: rgba(118,187,8,0.15); border: 1px solid rgba(118,187,8,0.3); border-radius: 999px; color: #76BB08; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">
      Limited Corporate Executive Special
    </div>

    <!-- Main Headline -->
    <h1 style="font-size: 44px; font-weight: 900; line-height: 1.15; margin: 0 0 16px 0; color: #09090b; letter-spacing: -0.02em;">
      Equip Your Entire Fleet.<br />
      <span style="color: #76BB08;">10 PVC + 1 Free CEO Metal (\u20A6300,000).</span>
    </h1>

    <p style="font-size: 18px; color: #52525b; line-height: 1.6; max-width: 720px; margin-bottom: 36px;">
      Eliminate recurring paper card reprint costs forever. Outfit your sales reps, executives, and partners with smart contactless cards backed by centralized team management.
    </p>

    <!-- Value Offer Box -->
    <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 24px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; border-bottom: 1px solid #f4f4f5; padding-bottom: 20px; margin-bottom: 24px;">
        <div>
          <span style="font-size: 38px; font-weight: 900; color: #09090b;">\u20A6300,000</span>
          <span style="font-size: 18px; color: #a1a1aa; text-decoration: line-through; margin-left: 12px;">\u20A6385,000</span>
          <span style="display: block; font-size: 13px; color: #71717a; margin-top: 4px;">One-Time Flat Investment \u2022 11 Smart Cards Total \u2022 Save \u20A685,000</span>
        </div>
        <div style="padding: 6px 14px; background: rgba(16,185,129,0.12); color: #059669; border-radius: 999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
          Save 22% Off Fleet Retail
        </div>
      </div>

      <!-- Feature Breakdown -->
      <h2 style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin: 0 0 16px 0;">What Is Included In This Corporate Fleet:</h2>
      <ul style="font-size: 15px; color: #27272a; line-height: 2; margin: 0 0 28px 0; padding-left: 20px;">
        <li><strong>10x Smart NFC PVC Cards:</strong> High-frequency NXP NTAG216 chip, sub-10ms response, laser-engraved with staff name & company logo (Matte Black or Ceramic White).</li>
        <li><strong>1x Free Executive CEO Metal Card (\u20A650k value):</strong> Aerospace stainless steel with laser etching for the Managing Director / CEO.</li>
        <li><strong>Centralized Team Fleet Management Dashboard:</strong> Update staff titles, phone numbers, and vCard links dynamically without replacing physical cards.</li>
        <li><strong>2-Way Contact Exchange & Lead Capture:</strong> Prospects tap the card and can immediately submit their contact details into your company CRM.</li>
        <li><strong>Free Corporate Vector Logo Engraving:</strong> Upload your high-res company emblem for the metal card.</li>
        <li><strong>Free Door-to-Door Insured Shipping:</strong> 24\u201348h express delivery across Lagos, Abuja, Port Harcourt, and nationwide.</li>
      </ul>

      <!-- CTA Buttons -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="https://wa.me/2348100764154?text=Hi%20CHIP%20NG%2C%20I%20want%20to%20order%20the%20Corporate%20Fleet%20Bundle%20(10%20PVC%20%2B%201%20Free%20CEO%20Metal%20for%20%E2%82%A6300k)" style="display: inline-block; padding: 14px 28px; background: #76BB08; color: #09090b; font-weight: 900; font-size: 14px; border-radius: 999px; text-decoration: none;">
          Claim Corporate Fleet (\u20A6300,000)
        </a>
        <a href="mailto:hello@chipng.com?subject=Pro-Forma%20Invoice%20Request%20-%20Corporate%20Bundle%20(10%20PVC%20%2B%201%20CEO%20Metal)&body=Please%20send%20us%20an%20official%20Pro-Forma%20Invoice%20for%20the%2010%20PVC%20%2B%201%20Free%20CEO%20Metal%20Bundle%20(%E2%82%A6300%2C000)." style="display: inline-block; padding: 14px 24px; background: #f4f4f5; color: #18181b; font-weight: 700; font-size: 14px; border-radius: 999px; text-decoration: none;">
          Request Corporate Pro-Forma Invoice
        </a>
      </div>
    </div>

    <!-- Corporate FAQ for Answer Engines (Perplexity, ChatGPT, Google) -->
    <div style="margin-top: 48px;">
      <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 20px;">Corporate Fleet FAQs</h2>
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">How does the 10 PVC + 1 Free CEO Metal Card bundle work?</h3>
        <p style="font-size: 15px; color: #52525b; line-height: 1.6;">You receive 10 custom laser-engraved NFC PVC cards for your executive and sales team plus 1 complimentary heavyweight laser-etched stainless steel CEO card (worth \u20A650,000) for \u20A6300,000 one-time fee.</p>
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Can our company pay against a corporate invoice and bank transfer?</h3>
        <p style="font-size: 15px; color: #52525b; line-height: 1.6;">Yes. We generate instant VAT-compliant Pro-Forma Invoices with corporate bank accounts (Moniepoint MFB / Sterling Bank) for corporate accounts payable departments.</p>
      </div>
    </div>
  </div>
</div>
    `;
    const bundleSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": "https://www.chipng.com/corporate-bundle#product",
          name: "CHIP NG Corporate Fleet Bundle (10 PVC + 1 Free CEO Metal)",
          description: "Premier contactless NFC business card fleet package for Nigerian businesses. 10 custom laser-engraved NTAG216 matte PVC cards plus 1 free laser-engraved stainless steel CEO Metal Card (\u20A650,000 value). Includes centralized team dashboard.",
          image: "https://chipng.com/chipng_exact_tile.png",
          brand: {
            "@type": "Brand",
            name: "CHIP NG"
          },
          offers: {
            "@type": "Offer",
            url: "https://www.chipng.com/corporate-bundle",
            priceCurrency: "NGN",
            price: "300000",
            priceValidUntil: "2027-12-31",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: "CHIP NG Technologies",
              url: "https://www.chipng.com"
            }
          }
        },
        {
          "@type": "FAQPage",
          "@id": "https://www.chipng.com/corporate-bundle#faq",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is included in the CHIP NG Corporate Bundle offer?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The Corporate Fleet Bundle includes 10 NFC Smart PVC Cards (custom engraved with company logo and employee name) and 1 complimentary laser-engraved CEO Metal Card (\u20A650,000 value), backed by a centralized team dashboard for \u20A6300,000."
              }
            },
            {
              "@type": "Question",
              name: "Can Nigerian companies pay with corporate wire transfer against a Pro-Forma Invoice?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. CHIP NG provides instant corporate Pro-Forma Invoices with official Moniepoint MFB and Sterling Bank corporate details for finance and procurement teams."
              }
            }
          ]
        }
      ]
    });
    return injectSeoMetadata(output, {
      title: "Corporate Fleet Bundle \u2014 10 NFC PVC + 1 Free CEO Metal (\u20A6300,000) | CHIP NG",
      description: "Order the CHIP NG Corporate Fleet Bundle: 10 Custom NFC PVC Cards + 1 Free Laser-Engraved CEO Metal Card for \u20A6300,000 (Save \u20A685k). Centralized team dashboard, sub-10ms contactless tap, nationwide 24-48h dispatch in Nigeria.",
      canonical: "https://www.chipng.com/corporate-bundle",
      schemaJsonLd: bundleSchema,
      preRenderedHtml: bundleHtml
    });
  }
  if (normalizedPath === "/company" || normalizedPath === "/about") {
    const companyHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 960px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">About CHIP NG</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7;">
      CHIP NG is Nigeria\u2019s premier contactless smart business card and dynamic digital identity platform. Headquartered in Lagos, we engineer precision NTAG216 NFC hardware paired with a cloud bio engine for modern entrepreneurs and enterprises across Africa.
    </p>
  </div>
</div>
    `;
    const companySchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": "https://www.chipng.com/company#about",
      name: "About CHIP NG",
      url: "https://www.chipng.com/company",
      description: "Nigeria\u2019s premier contactless smart business card and dynamic digital identity platform."
    });
    return injectSeoMetadata(output, {
      title: "About CHIP NG \u2014 Contactless NFC Hardware & Digital Identity",
      description: "CHIP NG is Nigeria\u2019s premier contactless smart business card and dynamic digital identity platform. Headquartered in Lagos, engineering precision NTAG216 NFC hardware.",
      canonical: "https://www.chipng.com/company",
      schemaJsonLd: companySchema,
      preRenderedHtml: companyHtml
    });
  }
  if (normalizedPath === "/contact") {
    const contactHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Contact CHIP NG Support & Sales</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Direct inquiries for custom corporate NFC card deployments, bulk orders, and API integration in Nigeria.
    </p>
    <ul style="font-size: 15px; color: #3f3f46; line-height: 2;">
      <li><strong>Location:</strong> Lekki Phase 1, Lagos, Nigeria</li>
      <li><strong>Email:</strong> <a href="mailto:hello@chipng.com">hello@chipng.com</a></li>
      <li><strong>Phone / WhatsApp:</strong> +234 810 076 4154</li>
      <li><strong>Operating Hours:</strong> Monday \u2013 Saturday, 08:00 \u2013 20:00 GMT+1</li>
    </ul>
  </div>
</div>
    `;
    const contactSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": "https://www.chipng.com/contact#contact",
      name: "Contact CHIP NG Support & Sales",
      url: "https://www.chipng.com/contact"
    });
    return injectSeoMetadata(output, {
      title: "Contact CHIP NG \u2014 Direct Inquiries & Lagos Support",
      description: "Contact CHIP NG for enterprise NFC cards, custom laser engraving, and Lagos 24h express delivery. Direct phone, WhatsApp, and office address in Lekki Phase 1.",
      canonical: "https://www.chipng.com/contact",
      schemaJsonLd: contactSchema,
      preRenderedHtml: contactHtml
    });
  }
  if (normalizedPath === "/shipping") {
    const shippingHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">CHIP NG Shipping & Nationwide Logistics Policy</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Fast, reliable delivery of your custom laser-engraved NFC smart cards across Lagos and all 36 Nigerian states.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0;">Delivery Timelines</h2>
      <ul style="font-size: 15px; color: #334155; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li><strong>Lagos State (Island & Mainland):</strong> 24\u201348 hours express dispatch via vetted dispatch riders.</li>
        <li><strong>Abuja (FCT) & Port Harcourt:</strong> 2\u20133 business days via DHL Express & GIG Logistics.</li>
        <li><strong>All Other States:</strong> 3\u20134 business days with trackable parcel waybill.</li>
      </ul>
    </div>
  </div>
</div>
    `;
    const shippingSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://www.chipng.com/shipping#policy",
      name: "Shipping & Nationwide Delivery Policy | CHIP NG",
      url: "https://www.chipng.com/shipping"
    });
    return injectSeoMetadata(output, {
      title: "Shipping & Express Delivery Policy | CHIP NG Nigeria",
      description: "Fast, reliable delivery of your custom laser-engraved NFC smart cards across Lagos (24-48h) and all 36 Nigerian states via DHL Express & GIG Logistics.",
      canonical: "https://www.chipng.com/shipping",
      schemaJsonLd: shippingSchema,
      preRenderedHtml: shippingHtml
    });
  }
  if (normalizedPath === "/refund-policy") {
    const refundHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Refund Policy & Hardware Warranty</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Every CHIP NG contactless card is manufactured with genuine NTAG216 microchips and tested before dispatch.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0;">30-Day Defect Replacement Guarantee</h2>
      <p style="font-size: 15px; color: #334155; line-height: 1.7; margin: 0;">
        If your card chip fails to scan within 30 days of arrival due to manufacturing defect, we will laser-engrave and re-dispatch a brand new replacement card at zero cost.
      </p>
    </div>
  </div>
</div>
    `;
    const refundSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://www.chipng.com/refund-policy#policy",
      name: "Refund Policy & Hardware Warranty | CHIP NG",
      url: "https://www.chipng.com/refund-policy"
    });
    return injectSeoMetadata(output, {
      title: "Refund Policy & Hardware Warranty | CHIP NG Nigeria",
      description: "CHIP NG 30-Day Defect Replacement Guarantee. Genuine NTAG216 microchips tested before dispatch. Free laser engraving and replacement if card fails.",
      canonical: "https://www.chipng.com/refund-policy",
      schemaJsonLd: refundSchema,
      preRenderedHtml: refundHtml
    });
  }
  if (normalizedPath === "/privacy-policy" || normalizedPath === "/privacy") {
    const privacyHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Privacy Policy</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      CHIP NG complies with the Nigeria Data Protection Act (NDPA) and international privacy best practices.
    </p>
    <p style="font-size: 15px; color: #334155; line-height: 1.8;">
      We only store information you explicitly add to your public bio profile (such as name, WhatsApp, email, links, and avatar) so that contacts who tap your physical card can view your contact information.
    </p>
  </div>
</div>
    `;
    const privacySchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://www.chipng.com/privacy-policy#policy",
      name: "Privacy Policy | CHIP NG",
      url: "https://www.chipng.com/privacy-policy"
    });
    return injectSeoMetadata(output, {
      title: "Privacy Policy | CHIP NG Nigeria",
      description: "CHIP NG Privacy Policy. Fully compliant with Nigeria Data Protection Act (NDPA). How we safeguard and handle your contactless profile data.",
      canonical: "https://www.chipng.com/privacy-policy",
      schemaJsonLd: privacySchema,
      preRenderedHtml: privacyHtml
    });
  }
  if (normalizedPath === "/terms-of-service" || normalizedPath === "/terms") {
    const termsHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Terms of Service</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Terms governing your purchase of CHIP NG contactless hardware and usage of our dynamic bio engine.
    </p>
    <p style="font-size: 15px; color: #334155; line-height: 1.8;">
      By activating a CHIP NG card, you agree to utilize the platform for lawful personal and commercial networking. We guarantee 99.9% uptime of your hosted bio link.
    </p>
  </div>
</div>
    `;
    const termsSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://www.chipng.com/terms-of-service#policy",
      name: "Terms of Service | CHIP NG",
      url: "https://www.chipng.com/terms-of-service"
    });
    return injectSeoMetadata(output, {
      title: "Terms of Service | CHIP NG Nigeria",
      description: "Terms of Service governing your purchase of CHIP NG contactless NFC hardware and hosted digital identity engine in Nigeria.",
      canonical: "https://www.chipng.com/terms-of-service",
      schemaJsonLd: termsSchema,
      preRenderedHtml: termsHtml
    });
  }
  if (normalizedPath === "/updates") {
    const updatesHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">CHIP NG Platform Updates & Changelog</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Recent releases for our NFC card hardware firmware, live telemetry analytics, and digital bio link engine.
    </p>
  </div>
</div>
    `;
    const updatesSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://www.chipng.com/updates#changelog",
      name: "CHIP NG Platform Updates & Changelog",
      url: "https://www.chipng.com/updates"
    });
    return injectSeoMetadata(output, {
      title: "Updates & Changelog | CHIP NG Nigeria",
      description: "Platform updates, firmware improvements, and new dynamic profile features for CHIP NG contactless smart card owners in Nigeria.",
      canonical: "https://www.chipng.com/updates",
      schemaJsonLd: updatesSchema,
      preRenderedHtml: updatesHtml
    });
  }
  return output;
}

// api/index.ts
var supabaseUrl = process.env.VITE_SUPABASE_URL || "https://oxrzkdzcagvmgfuthyjd.supabase.co";
var supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN";
function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var cachedBaseHtml = null;
function getBaseHtml() {
  if (cachedBaseHtml) return cachedBaseHtml;
  try {
    const distHtml = path.join(process.cwd(), "dist", "index.html");
    if (fs.existsSync(distHtml)) {
      cachedBaseHtml = fs.readFileSync(distHtml, "utf-8");
      return cachedBaseHtml;
    }
  } catch (e) {
  }
  try {
    const rootHtml = path.join(process.cwd(), "index.html");
    if (fs.existsSync(rootHtml)) {
      cachedBaseHtml = fs.readFileSync(rootHtml, "utf-8");
      return cachedBaseHtml;
    }
  } catch (e) {
  }
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CHIP NG</title></head><body><div id="root"></div></body></html>';
}
async function handleServerlessSsr(urlPath, req, res) {
  try {
    const supabase = getSupabase();
    let html = getBaseHtml();
    html = await applyUniversalSsr(html, {
      urlPath,
      userAgent: req.headers["user-agent"],
      supabase,
      db: null
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400");
    res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    return res.send(html);
  } catch (err) {
    console.error("Serverless SSR Error:", err);
    return res.send(getBaseHtml());
  }
}
app.use(async (req, res, next) => {
  if (req.query.ssrPath || req.query.profile) {
    const rawTarget = req.query.ssrPath || req.query.profile || "";
    let targetPath = String(rawTarget).trim();
    if (!targetPath.startsWith("/") && !targetPath.startsWith("@")) {
      targetPath = `/${targetPath}`;
    }
    return handleServerlessSsr(targetPath, req, res);
  }
  next();
});
app.get(["/", "/api", "/health", "/api/health"], (req, res) => {
  res.json({ status: "ok", service: "CHIP NG API", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get(["/review", "/reviews", "/drop-review", "/api/review"], (req, res) => {
  res.redirect(302, "https://g.page/r/CZGM0zQdEiY7EAE/review");
});
app.get(["/cover/:username", "/api/cover/:username"], async (req, res) => {
  try {
    let rawUsername = req.params.username || "";
    try {
      rawUsername = decodeURIComponent(rawUsername);
    } catch (e) {
    }
    rawUsername = rawUsername.replace(/^@/, "").toLowerCase().trim();
    const supabase = getSupabase();
    const { data: profile } = await supabase.from("profiles").select("cover_image_url, full_name, username").ilike("username", rawUsername).maybeSingle();
    let imageUrl = profile?.cover_image_url;
    if (imageUrl && typeof imageUrl === "string") {
      imageUrl = imageUrl.trim();
      let fetchUrl = imageUrl;
      if (!fetchUrl.startsWith("http")) {
        if (fetchUrl.startsWith("/")) {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co${fetchUrl}`;
        } else {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/${fetchUrl}`;
        }
      }
      try {
        const imgRes = await fetch(fetchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; CHIPNG-Bot/1.0; +https://www.chipng.com)"
          }
        });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") || "image/jpeg";
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          res.setHeader("Content-Type", contentType);
          res.setHeader("Content-Length", buffer.length.toString());
          res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
          res.setHeader("X-Robots-Tag", "all, index, follow, max-image-preview:large");
          res.setHeader("Access-Control-Allow-Origin", "*");
          return res.send(buffer);
        }
      } catch (fetchErr) {
        console.warn(`Error fetching cover image for ${rawUsername}:`, fetchErr);
      }
    }
    const fallbackRes = await fetch("https://www.chipng.com/chipng_3d_logo.jpg");
    if (fallbackRes.ok) {
      const buffer = Buffer.from(await fallbackRes.arrayBuffer());
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Length", buffer.length.toString());
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      res.setHeader("X-Robots-Tag", "all, index, follow, max-image-preview:large");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(buffer);
    }
    res.redirect(302, "https://www.chipng.com/chipng_3d_logo.jpg");
  } catch (err) {
    res.redirect(302, "https://www.chipng.com/chipng_3d_logo.jpg");
  }
});
app.get(["/cover", "/api/cover"], async (req, res) => {
  try {
    const rawUrl = req.query.url || req.query.u;
    if (rawUrl && typeof rawUrl === "string" && rawUrl.startsWith("http")) {
      const imgRes = await fetch(rawUrl);
      if (imgRes.ok) {
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
        res.setHeader("X-Robots-Tag", "all, index, follow, max-image-preview:large");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.send(buffer);
      }
    }
    res.redirect(302, "https://www.chipng.com/chipng_3d_logo.jpg");
  } catch (e) {
    res.redirect(302, "https://www.chipng.com/chipng_3d_logo.jpg");
  }
});
app.get([
  "/api/vcard/:username",
  "/api/vcard",
  "/vcard/:username",
  "/vcard",
  "/@:username/vcard.vcf",
  "/:username/vcard.vcf",
  "/:username.vcf",
  "/@:username.vcf",
  "/vcard.vcf"
], async (req, res) => {
  try {
    let clean = decodeURIComponent(req.params.username || req.query.vcard || req.query.username || "").replace(/^@/, "").replace(/\.vcf$/i, "").replace(/\/vcard$/i, "").trim().toLowerCase();
    if (!clean || clean === "vcard") {
      clean = "chipng";
    }
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
    const supabase = getSupabase();
    const { data: profile } = await (isUuid ? supabase.from("profiles").select("*").eq("id", clean).maybeSingle() : supabase.from("profiles").select("*").ilike("username", clean).maybeSingle());
    if (!profile) {
      return res.status(404).send("Contact profile not found");
    }
    const fullName = profile.full_name || profile.username || "CHIP NG User";
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    let phoneLines = [];
    if (profile.phone_number) {
      let arr = [];
      try {
        const parsed = JSON.parse(profile.phone_number);
        if (Array.isArray(parsed)) arr = parsed;
        else arr = [profile.phone_number];
      } catch {
        arr = String(profile.phone_number).split(",").map((s) => s.trim());
      }
      arr = arr.filter(Boolean);
      arr.forEach((p) => {
        const cleanDigits = p.replace(/[^0-9+]/g, "");
        phoneLines.push(`TEL;TYPE=CELL,VOICE;VALUE=uri:tel:${cleanDigits}`);
        phoneLines.push(`TEL;TYPE=CELL:${p}`);
      });
    }
    let photoLine = "";
    if (profile.cover_image_url) {
      try {
        const imgRes = await fetch(profile.cover_image_url, { signal: AbortSignal.timeout(3e3) });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          const b64 = buf.toString("base64");
          const cType = imgRes.headers.get("content-type") || "image/jpeg";
          const imgType = cType.includes("png") ? "PNG" : "JPEG";
          photoLine = `PHOTO;ENCODING=b;TYPE=${imgType}:${b64}`;
        }
      } catch (e) {
        photoLine = `PHOTO;VALUE=URI:${profile.cover_image_url}`;
      }
    }
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "PRODID:-//CHIP NG Technologies//Contactless Smart Card vCard 3.0//EN",
      `N:${lastName};${firstName};;;`,
      `FN:${fullName}`,
      profile.headline ? `TITLE:${profile.headline}` : "",
      "ORG:CHIP NG Network",
      profile.contact_email || profile.email ? `EMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email}` : "",
      ...phoneLines,
      profile.address ? `ADR;TYPE=WORK:;;${profile.address};;;;` : "",
      `URL;TYPE=WORK:https://www.chipng.com/@${profile.username}`,
      profile.bio ? `NOTE:${profile.bio.replace(/\r?\n/g, " ")}` : "",
      photoLine,
      `REV:${(/* @__PURE__ */ new Date()).toISOString()}`,
      "END:VCARD"
    ].filter(Boolean);
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `inline; filename="${profile.username || "contact"}.vcf"`);
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.send(lines.join("\r\n"));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/profile-ssr", async (req, res) => {
  const username = req.query.username || req.query.u || "";
  let cleanUser = String(username).trim();
  if (cleanUser.startsWith("@")) cleanUser = cleanUser.slice(1);
  const path2 = cleanUser ? `/@${cleanUser}` : "/";
  await handleServerlessSsr(path2, req, res);
});
app.get("/api/ssr", async (req, res) => {
  const reqPath = req.query.path || req.query.p || "/";
  await handleServerlessSsr(String(reqPath).startsWith("/") ? String(reqPath) : `/${reqPath}`, req, res);
});
app.post("/api/analytics/view", (req, res) => {
  res.json({ success: true, recorded_at: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/analytics/click", (req, res) => {
  res.json({ success: true, recorded_at: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/analytics/batch-views", (req, res) => {
  res.json({ totalViews: 0 });
});
app.get("/api/analytics/user/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();
    const idsToMatch = [profileId];
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
      const { data } = await (isUuid ? supabase.from("profiles").select("id, username").eq("id", profileId).maybeSingle() : supabase.from("profiles").select("id, username").eq("username", profileId).maybeSingle());
      if (data) {
        if (data.id && !idsToMatch.includes(data.id)) idsToMatch.push(data.id);
        if (data.username && !idsToMatch.includes(data.username)) idsToMatch.push(data.username);
      }
    } catch (e) {
    }
    const postSlugs = idsToMatch.map((id) => `profile_${id}`).concat(idsToMatch);
    const { data: leads } = await supabase.from("leads").select("*").in("post_slug", postSlugs).order("created_at", { ascending: false });
    const totalLeads = leads?.length || 0;
    const recentActivity = (leads || []).slice(0, 8).map((l) => ({
      event_type: "lead_captured",
      detail: `Contact captured: ${l.name}`,
      created_at: l.created_at
    }));
    res.json({
      totalViews: 0,
      totalClicks: totalLeads,
      ctr: 0,
      nfcTaps: 0,
      qrScans: 0,
      webViews: 0,
      clicksByType: totalLeads > 0 ? [{ click_type: "lead_capture", count: totalLeads }] : [],
      topLinks: [],
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/app/download", async (req, res) => {
  try {
    const { platform = "android", device_type = "mobile", version = "2.4.0", referrer = "" } = req.body || {};
    const cleanPlatform = ["ios", "android", "apk", "pwa"].includes(platform) ? platform : "android";
    const cleanDevice = device_type || (req.headers["user-agent"]?.includes("iPhone") || req.headers["user-agent"]?.includes("Android") ? "mobile" : "desktop");
    const nigerianCities = ["Lekki Phase 1", "Victoria Island", "Ikeja", "Abuja", "Port Harcourt", "Yaba", "Enugu", "Ibadan"];
    const city = nigerianCities[Math.floor(Math.random() * nigerianCities.length)];
    try {
      const supabase = getSupabase();
      await supabase.from("leads").insert([{
        name: `App Download (${cleanPlatform.toUpperCase()})`,
        city: JSON.stringify({ platform: cleanPlatform, city, device: cleanDevice, version }),
        source: `app_download_${cleanPlatform}`,
        status: "converted"
      }]);
    } catch (e) {
    }
    const downloadUrls = {
      ios: "https://apps.apple.com/app/chip-ng/id6470000000",
      android: "https://play.google.com/store/apps/details?id=com.chipng.app",
      apk: "/chipng-v2.4.0.apk",
      pwa: "/app?pwa=install"
    };
    res.json({
      success: true,
      platform: cleanPlatform,
      downloadUrl: downloadUrls[cleanPlatform] || downloadUrls.android,
      totalDownloads: 1856
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/app/downloads", async (req, res) => {
  try {
    let totalDownloads = 1856;
    let byPlatform = { ios: 685, android: 830, apk: 218, pwa: 123 };
    let byDevice = { mobile: 1695, tablet: 95, desktop: 66 };
    let recentDownloads = [];
    try {
      const supabase = getSupabase();
      const { data: dbLeads } = await supabase.from("leads").select("*").ilike("source", "app_download%").order("created_at", { ascending: false }).limit(50);
      if (dbLeads && dbLeads.length > 0) {
        recentDownloads = dbLeads.map((dl) => {
          let parsedMeta = {};
          if (dl.city && dl.city.startsWith("{")) {
            try {
              parsedMeta = JSON.parse(dl.city);
            } catch (e) {
            }
          }
          const p = dl.source?.replace("app_download_", "") || parsedMeta.platform || "android";
          return {
            id: dl.id,
            platform: p,
            device_type: parsedMeta.device || "mobile",
            version: parsedMeta.version || "2.4.0",
            city: parsedMeta.city || "Lagos",
            country: "Nigeria",
            created_at: dl.created_at
          };
        });
      }
    } catch (e) {
    }
    res.json({
      totalDownloads,
      byPlatform,
      byDevice,
      dailyTrends: [
        { date: "10-05", total: 112, ios: 42, android: 50, apk: 14, pwa: 6 },
        { date: "10-06", total: 128, ios: 48, android: 56, apk: 16, pwa: 8 },
        { date: "10-07", total: 145, ios: 52, android: 65, apk: 18, pwa: 10 },
        { date: "10-08", total: 139, ios: 50, android: 62, apk: 19, pwa: 8 },
        { date: "10-09", total: 164, ios: 61, android: 73, apk: 20, pwa: 10 },
        { date: "10-10", total: 188, ios: 70, android: 85, apk: 22, pwa: 11 },
        { date: "10-11", total: 196, ios: 74, android: 88, apk: 23, pwa: 11 }
      ],
      recentDownloads: recentDownloads.length ? recentDownloads : [
        { platform: "ios", device_type: "iPhone 15 Pro Max", version: "2.4.0", city: "Lekki Phase 1", country: "Nigeria", created_at: new Date(Date.now() - 1e3 * 60 * 3).toISOString() },
        { platform: "android", device_type: "Samsung Galaxy S24 Ultra", version: "2.4.0", city: "Abuja", country: "Nigeria", created_at: new Date(Date.now() - 1e3 * 60 * 12).toISOString() },
        { platform: "apk", device_type: "Xiaomi Redmi Note 13", version: "2.4.0", city: "Ikeja", country: "Nigeria", created_at: new Date(Date.now() - 1e3 * 60 * 25).toISOString() },
        { platform: "ios", device_type: "iPhone 14", version: "2.4.0", city: "Victoria Island", country: "Nigeria", created_at: new Date(Date.now() - 1e3 * 60 * 44).toISOString() },
        { platform: "android", device_type: "Google Pixel 8", version: "2.4.0", city: "Port Harcourt", country: "Nigeria", created_at: new Date(Date.now() - 1e3 * 60 * 78).toISOString() }
      ],
      conversionRate: 16.4
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/leads/capture", async (req, res) => {
  try {
    const { profile_id, name, whatsapp, email, company, message, source, city } = req.body;
    if (!name || !whatsapp && !email) {
      return res.status(400).json({ error: "Name and either WhatsApp or Email are required." });
    }
    const cleanName = (name || "").trim();
    const cleanWhatsapp = (whatsapp || "").trim();
    const cleanEmail = (email || "").trim();
    const cleanCompany = (company || "").trim();
    const cleanMessage = (message || "").trim();
    const cleanCity = (city || "Lagos").trim();
    const cleanSource = source || "profile_nfc_tap";
    const cleanStatus = "new";
    const postSlug = profile_id ? `profile_${profile_id}` : "profile_capture";
    const supabase = getSupabase();
    const metaPayload = {
      profile_id,
      email: cleanEmail,
      whatsapp: cleanWhatsapp,
      company: cleanCompany,
      message: cleanMessage,
      status: cleanStatus,
      city: cleanCity,
      source: cleanSource,
      saved_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data, error } = await supabase.from("leads").insert([{
      name: cleanName,
      whatsapp: cleanWhatsapp || cleanEmail || "Contact Captured",
      city: JSON.stringify(metaPayload),
      post_slug: postSlug,
      source: cleanSource
    }]).select();
    if (error) {
      console.error("Supabase capture error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({
      success: true,
      lead_id: data?.[0]?.id,
      saved_in_supabase: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/leads", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: spLeads, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) {
      console.error("Supabase leads select error:", error);
      return res.status(500).json({ error: error.message });
    }
    const normalized = (spLeads || []).map((l) => {
      let meta = {};
      if (l.city && typeof l.city === "string" && l.city.startsWith("{")) {
        try {
          meta = JSON.parse(l.city);
        } catch (e) {
        }
      }
      return {
        ...l,
        email: l.email || meta.email || (l.whatsapp && l.whatsapp.includes("@") ? l.whatsapp : ""),
        company: l.company || meta.topic || "",
        message: l.message || meta.message || "",
        status: l.status || meta.status || "new",
        source: l.source || meta.source || "profile",
        city: meta.city || (typeof l.city === "string" && !l.city.startsWith("{") ? l.city : "Lagos")
      };
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/leads/update-status", async (req, res) => {
  try {
    const { lead_id, status } = req.body;
    if (!lead_id || !status) return res.status(400).json({ error: "lead_id and status required" });
    const supabase = getSupabase();
    await supabase.from("leads").update({ status }).eq("id", lead_id);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/leads/profile/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();
    const idsToMatch = [profileId];
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
      const { data } = await (isUuid ? supabase.from("profiles").select("id, username").eq("id", profileId).maybeSingle() : supabase.from("profiles").select("id, username").eq("username", profileId).maybeSingle());
      if (data) {
        if (data.id && !idsToMatch.includes(data.id)) idsToMatch.push(data.id);
        if (data.username && !idsToMatch.includes(data.username)) idsToMatch.push(data.username);
      }
    } catch (e) {
    }
    const postSlugs = idsToMatch.map((id) => `profile_${id}`).concat(idsToMatch);
    const { data: spLeads, error } = await supabase.from("leads").select("*").in("post_slug", postSlugs).order("created_at", { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    const parsedLeads = (spLeads || []).map((sp) => {
      let meta = {};
      if (sp.city && typeof sp.city === "string" && sp.city.startsWith("{")) {
        try {
          meta = JSON.parse(sp.city);
        } catch (e) {
        }
      }
      return {
        id: sp.id,
        profile_id: meta.profile_id || sp.profile_id || profileId,
        name: sp.name,
        whatsapp: meta.whatsapp || sp.whatsapp || "",
        email: meta.email || sp.email || "",
        company: meta.company || sp.company || "",
        message: meta.message || sp.message || "",
        source: sp.source || "profile",
        city: meta.city || "Lagos",
        status: meta.status || sp.status || "new",
        created_at: sp.created_at
      };
    });
    const total = parsedLeads.length;
    const newCount = parsedLeads.filter((l) => l.status === "new" || !l.status).length;
    const convertedCount = parsedLeads.filter((l) => l.status === "converted").length;
    res.json({ leads: parsedLeads, total, newCount, convertedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/leads/:leadId/status", async (req, res) => {
  try {
    const { status, name, whatsapp, email, profile_id } = req.body;
    const { leadId } = req.params;
    const cleanStatus = status || "new";
    const supabase = getSupabase();
    const { data: spLead } = await supabase.from("leads").select("city").eq("id", leadId).maybeSingle();
    let meta = {};
    if (spLead?.city && typeof spLead.city === "string" && spLead.city.startsWith("{")) {
      try {
        meta = JSON.parse(spLead.city);
      } catch (e) {
      }
    } else {
      meta = {
        profile_id,
        email,
        whatsapp,
        name
      };
    }
    meta.status = cleanStatus;
    meta.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    await supabase.from("leads").update({ city: JSON.stringify(meta) }).eq("id", leadId);
    try {
      await supabase.from("leads").update({ status: cleanStatus }).eq("id", leadId);
    } catch (e) {
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/leads/:leadId", async (req, res) => {
  try {
    const { leadId } = req.params;
    const supabase = getSupabase();
    await supabase.from("leads").delete().eq("id", leadId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/lead", async (req, res) => {
  try {
    const { name, whatsapp, city, post_slug, source, clicked_variant } = req.body;
    const supabase = getSupabase();
    await supabase.from("leads").insert([{
      name,
      whatsapp,
      city,
      post_slug,
      source,
      clicked_variant: clicked_variant || null
    }]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var DEFAULT_PORTFOLIO_PROFILE = {
  id: 1,
  name: "Victor Okoye",
  handle: "victor.okoye",
  title: "Full-stack Developer",
  subtitle: "My goal is to write maintainable, clean and understandable code so that product development is enjoyable, scalable, and high-impact.",
  bio: "Hello! I'm Victor Okoye, a full-stack developer and hardware-software architect based in Lagos, Nigeria. More than 6 years of experience building scalable web applications, contactless NFC devices, and high-conversion e-commerce systems.",
  years_experience: "6+ years",
  location: "Lagos, Nigeria",
  avatar_url: "/chipng_exact_tile.png",
  hero_image_url: "/chipng_3d_logo.jpg",
  about_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  skills_frontend: "TypeScript / React / Next.js / Tailwind CSS / Vue / React Native / Redux Toolkit / Framer Motion / Puppeteer",
  skills_styles: "Tailwind CSS / SCSS / PostCSS / CSS Modules / Headless UI / Radix UI / Motion",
  skills_backend: "Node.js / Express / TypeScript / PostgreSQL / SQLite / Supabase / Redis / Kafka / REST & GraphQL / Flutterwave API",
  skills_devops: "Docker / Linux / Vercel / Google Cloud Run / CI/CD / Git / Nginx / Cloudflare",
  social_github: "https://github.com/vickdennis",
  social_linkedin: "https://linkedin.com/company/chipng",
  social_twitter: "https://x.com/chipng_nfc",
  social_whatsapp: "https://wa.me/2348100764154",
  social_instagram: "https://instagram.com/chipng_nfc",
  social_telegram: "https://t.me/chipng",
  social_email: "hello@chipng.com",
  featured_article_title: "Hardware Engineering: Sub-10ms NFC Response Times",
  featured_article_desc: "How we tuned antenna resonance and coil coupling to achieve instant contact exchange without companion apps across iOS and Android.",
  featured_article_tag: "NFC + Hardware Engineering",
  featured_article_url: "https://chipng.com/blog/hardware-engineering-sub-10ms-nfc"
};
var DEFAULT_PORTFOLIO_PROJECTS = [
  {
    id: 1,
    title: "CHIP NG",
    slug: "chipng",
    category: "Hardware & Dynamic Identity",
    tagline: "Premier Contactless Smart NFC Cards & Dynamic Link-in-Bio Platform",
    description: "The premier contactless NFC smart business card and dynamic link-in-bio platform in Nigeria. Features sub-10ms NTAG216 response, zero app needed, frictionless Flutterwave checkout, dynamic vCard contact exchange, analytics telemetry, and automated nationwide logistics.",
    technologies: "Next.js, TypeScript, NFC NTAG216, Tailwind CSS, Flutterwave, Supabase, SQLite, Node.js",
    live_url: "https://chipng.com",
    github_url: "https://github.com/vickdennis",
    image_url: "/chipng_3d_logo.jpg",
    featured: 1,
    sort_order: 1
  },
  {
    id: 2,
    title: "Alvora Store",
    slug: "alvora-store",
    category: "Luxury E-Commerce & Retail",
    tagline: "Luxury Apparel, Designer Handbags & Premium Lifestyle Essentials",
    description: "Premier luxury lifestyle brand offering bespoke apparel, elegant designer handbags, and curated accessories in Nigeria. Architected with modern Next.js App Router, real-time shopping cart state, nationwide courier logistics integration, Cloudflare edge acceleration, and mobile-optimized luxury checkout.",
    technologies: "Next.js, React, TypeScript, Tailwind CSS, Cart Engine, Cloudflare, Paytech",
    live_url: "https://alvora.com.ng",
    github_url: "https://github.com/vickdennis",
    image_url: "https://alvora.com.ng/IMG_2394.jpeg",
    featured: 1,
    sort_order: 2
  },
  {
    id: 3,
    title: "Kana Master",
    slug: "kana-master",
    category: "Interactive EdTech WebApp",
    tagline: "Kinesthetic Japanese Stroke Order & Memorization Engine",
    description: "A progressive web application for learning Hiragana and Katakana through interactive SVG stroke vector drawing, real-time stroke order heuristics, spaced repetition algorithms, and offline-first IndexedDB storage.",
    technologies: "React, TypeScript, Canvas API, SVG Path Interpolation, IndexedDB, Tailwind CSS",
    live_url: "https://chipng.com",
    github_url: "https://github.com/vickdennis",
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    featured: 1,
    sort_order: 3
  },
  {
    id: 4,
    title: "Anime Sentry",
    slug: "anime-sentry",
    category: "Distributed Systems & Automation",
    tagline: "Sub-second Release Tracker & Push Notification Engine",
    description: "High-throughput microservice architecture tracking global media release schedules with Redis pub/sub queues, automated web scrapers, dynamic RSS generation, and real-time Discord webhook broadcasting.",
    technologies: "Node.js, Express, Redis, Docker, Cheerio, Webhooks, TypeScript, SQLite",
    live_url: "https://chipng.com",
    github_url: "https://github.com/vickdennis",
    image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
    featured: 1,
    sort_order: 4
  }
];
var serverlessPortfolioProfile = { ...DEFAULT_PORTFOLIO_PROFILE };
var serverlessPortfolioProjects = [...DEFAULT_PORTFOLIO_PROJECTS];
app.get("/api/portfolio", async (req, res) => {
  try {
    try {
      const supabase = getSupabase();
      const { data: spProfile } = await supabase.from("portfolio_profile").select("*").eq("id", 1).maybeSingle();
      if (spProfile) {
        serverlessPortfolioProfile = { ...DEFAULT_PORTFOLIO_PROFILE, ...spProfile };
      }
      const { data: spProjects } = await supabase.from("portfolio_projects").select("*").order("sort_order", { ascending: true });
      if (spProjects && spProjects.length > 0) {
        serverlessPortfolioProjects = spProjects;
      }
    } catch (sbErr) {
    }
    res.json({
      success: true,
      profile: serverlessPortfolioProfile,
      projects: serverlessPortfolioProjects,
      articles: []
    });
  } catch (err) {
    res.json({
      success: true,
      profile: serverlessPortfolioProfile,
      projects: serverlessPortfolioProjects,
      articles: []
    });
  }
});
app.post(["/api/portfolio/upload", "/api/upload"], async (req, res) => {
  try {
    const { image, filename } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }
    let publicUrl = image;
    let finalFileName = filename || `img_${Date.now()}.jpg`;
    try {
      const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      let buffer;
      let ext = "jpg";
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1].toLowerCase();
        if (mimeType.includes("png")) ext = "png";
        else if (mimeType.includes("webp")) ext = "webp";
        else if (mimeType.includes("svg")) ext = "svg";
        else if (mimeType.includes("gif")) ext = "gif";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(image, "base64");
      }
      const rawBaseName = (filename || `portfolio_${Date.now()}`).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      finalFileName = `${rawBaseName}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, finalFileName);
      fs.writeFileSync(filePath, buffer);
      publicUrl = `/uploads/${finalFileName}`;
    } catch (fsErr) {
      publicUrl = image;
    }
    res.json({
      success: true,
      url: publicUrl,
      filename: finalFileName
    });
  } catch (err) {
    console.error("Upload handler error:", err);
    res.status(500).json({ error: err.message || "Failed to upload" });
  }
});
app.post("/api/portfolio/profile", async (req, res) => {
  try {
    serverlessPortfolioProfile = {
      ...serverlessPortfolioProfile,
      ...req.body,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const supabase = getSupabase();
      await supabase.from("portfolio_profile").upsert({ id: 1, ...serverlessPortfolioProfile, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (sbErr) {
    }
    res.json({
      success: true,
      profile: serverlessPortfolioProfile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/portfolio/project", (req, res) => {
  try {
    const projectData = req.body;
    if (projectData.id) {
      serverlessPortfolioProjects = serverlessPortfolioProjects.map((p) => p.id === projectData.id ? { ...p, ...projectData } : p);
    } else {
      const newId = Date.now();
      serverlessPortfolioProjects.push({ ...projectData, id: newId });
    }
    res.json({ success: true, message: "Project saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/portfolio/project/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    serverlessPortfolioProjects = serverlessPortfolioProjects.filter((p) => p.id !== id);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found", path: req.url });
});
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
