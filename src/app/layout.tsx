import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from './components/seo/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL('https://chipng.com'),
  title: {
    default: 'CHIP NG — Contactless Smart NFC Business Cards & Link-in-Bio Platform',
    template: '%s | CHIP NG'
  },
  description:
    'The premier Nigerian contactless smart business card and dynamic link-in-bio platform. Sub-10ms NTAG216 response, zero app needed. Matte PVC (₦30,000–₦35,000), Smart Metal (₦50,000), and Custom Metal Debit Cards (₦80,000–₦100,000). Express Lagos & nationwide delivery.',
  keywords: [
    'NFC business card Nigeria',
    'smart business card Lagos',
    'contactless business card',
    'digital business card Nigeria',
    'metal NFC card Nigeria',
    'metal debit card conversion Nigeria',
    'link in bio Nigeria',
    'vCard contact sharing',
    'NTAG216 chip card',
    'CHIP NG',
    'chipng'
  ],
  authors: [{ name: 'CHIP NG Technologies Ltd', url: 'https://chipng.com' }],
  creator: 'CHIP NG',
  publisher: 'CHIP NG Technologies Ltd',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://chipng.com',
    siteName: 'CHIP NG',
    title: 'CHIP NG — Contactless Smart NFC Business Cards & Link-in-Bio Platform',
    description:
      'The definitive contactless NFC smart business card and dynamic link-in-bio platform in Nigeria. 1-tap contact sharing, sub-10ms response, zero app needed.',
    images: [
      {
        url: 'https://chipng.com/chipng_3d_logo.jpg',
        width: 1200,
        height: 1200,
        alt: 'CHIP NG 3D Emblem'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHIP NG — NFC Smart Business Cards & Digital Profiles',
    description:
      'CHIP NG provides premium NFC smart business cards and the definitive link-in-bio platform for Nigerian founders, executives, and creators.',
    creator: '@chipng_nfc',
    images: ['https://www.chipng.com/chipng_3d_logo.jpg']
  },
  alternates: {
    canonical: 'https://www.chipng.com'
  },
  other: {
    'geo.region': 'NG-LA',
    'geo.placename': 'Lekki Phase 1, Lagos, Nigeria',
    'geo.position': '6.4474;3.4831',
    'ICBM': '6.4474, 3.4831',
    'google-site-verification': 'googleb62d8b4d981ee167'
  }
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CHIP NG',
  legalName: 'CHIP NG Technologies Ltd',
  url: 'https://www.chipng.com',
  logo: 'https://www.chipng.com/chipng_exact_tile.png',
  image: 'https://www.chipng.com/chipng_3d_logo.jpg',
  description:
    'Nigeria premier contactless smart NFC business cards and dynamic link-in-bio platform for executives, founders, and creators.',
  foundingDate: '2023',
  foundingLocation: {
    '@type': 'Place',
    name: 'Lagos, Nigeria'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+2348100764154',
    contactType: 'customer service',
    areaServed: ['NG', 'GH', 'KE', 'GB', 'US'],
    availableLanguage: ['en']
  },
  sameAs: [
    'https://www.tiktok.com/@chipng_nfc',
    'https://www.instagram.com/chipng_nfc',
    'https://x.com/chipng_nfc'
  ]
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'CHIP NG',
  alternateName: 'CHIP Nigeria Smart Cards',
  image: 'https://www.chipng.com/chipng_3d_logo.jpg',
  logo: 'https://www.chipng.com/chipng_exact_tile.png',
  url: 'https://www.chipng.com',
  telephone: '+2348100764154',
  email: 'hello@chipng.com',
  priceRange: '₦₦',
  currenciesAccepted: 'NGN, USD, GBP',
  paymentAccepted: 'Cash, Credit Card, Debit Card, Paystack, Bank Transfer',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lekki Phase 1',
    addressLocality: 'Lagos',
    addressRegion: 'Lagos State',
    postalCode: '105102',
    addressCountry: 'NG'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 6.4474,
    longitude: 3.4831
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00'
    }
  ],
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Nigeria'
  }
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CHIP NG',
  url: 'https://chipng.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://chipng.com/blog?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <JsonLd data={organizationSchema} id="schema-org" />
        <JsonLd data={localBusinessSchema} id="schema-local-business" />
        <JsonLd data={websiteSchema} id="schema-website" />
      </head>
      <body className="min-h-screen bg-[#07080A] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
