import React, { useEffect } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { CorporateBundleSection } from '../components/makro/CorporateBundleSection';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ShieldCheck, ArrowLeft, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { SeoHead } from '../components/seo/SeoHead';
import {
  CHIPNG_PRODUCT_IMAGES,
  CHIPNG_PRODUCT_AGGREGATE_RATING,
  CHIPNG_PRODUCT_REVIEWS,
} from '../utils/productSchemaData';

interface CorporateBundleViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export const CorporateBundleView: React.FC<CorporateBundleViewProps> = ({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}) => {
  const { formatNgn } = useCurrency();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const corporateSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': 'https://www.chipng.com/corporate-bundle#product',
    name: 'CHIP NG Corporate Fleet NFC Smart Card Bundle (10 PVC + 1 Free CEO Metal)',
    image: CHIPNG_PRODUCT_IMAGES,
    description:
      'Equip your entire team with 10 custom printed PVC smart business cards plus 1 complimentary laser-engraved Stainless Steel CEO metal NFC card and unified analytics dashboard.',
    sku: 'CHIP-CORP-FLEET-11',
    mpn: 'NTAG216-CORP-11',
    brand: { '@type': 'Brand', name: 'CHIP NG' },
    aggregateRating: CHIPNG_PRODUCT_AGGREGATE_RATING,
    review: CHIPNG_PRODUCT_REVIEWS,
    offers: {
      '@type': 'Offer',
      price: '300000',
      priceCurrency: 'NGN',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: 'https://www.chipng.com/corporate-bundle',
      seller: { '@type': 'Organization', name: 'CHIP NG Technologies Ltd' },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#16a34a] selection:text-neutral-950">
      <SeoHead
        title="Corporate Fleet NFC Card Bundle (10 PVC + 1 Free CEO Metal — ₦300,000) | CHIP NG"
        description="Equip your Nigerian company or sales team with 10 custom printed NFC smart business cards plus 1 free Stainless Steel CEO Metal Card for ₦300,000. Zero recurring fees."
        canonicalPath="/corporate-bundle"
        ogType="product"
        keywords="corporate NFC business cards Nigeria, team smart business cards Lagos, bulk NFC cards Nigeria, enterprise digital business card"
        schemaJsonLd={corporateSchema}
      />
      {/* Global Makro Navigation Top Bar */}
      <MakroNavbar
        currentView="landing"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1 pt-4">
        {/* Breadcrumb & Navigation Anchor Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] font-bold">
                <Building2 className="w-3.5 h-3.5" /> B2B Corporate Offer
              </span>
              <span className="hidden sm:inline text-neutral-400">•</span>
              <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400">
                10 PVC + 1 Free CEO Metal ({formatNgn(300000)})
              </span>
            </div>
          </div>
        </div>

        {/* Corporate Bundle Interactive Section */}
        <CorporateBundleSection
          onNavigate={onNavigate}
          isStandalonePage={true}
        />
      </main>

      {/* Makro Footer */}
      <MakroFooter
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default CorporateBundleView;
