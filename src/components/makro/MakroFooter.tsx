import React from 'react';
import { ViewState } from '../../App';
import { ArrowUp, Star, Briefcase } from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { SocialMediaIconBadge } from '../social/SocialMediaIconBadge';

interface MakroFooterProps {
  onNavigate: (view: ViewState) => void;
}

export const MakroFooter: React.FC<MakroFooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    view: ViewState,
    scrollTargetId?: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(view);
    if (scrollTargetId) {
      setTimeout(() => {
        document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  const handlePathLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const regionalAndGuideLinks = [
    { label: 'Pricing (2026)', href: '/pricing', type: 'path' as const },
    { label: 'FAQ', href: '/faq', type: 'path' as const },
    { label: 'Shipping & Delivery', href: '/shipping', view: 'shipping' as ViewState },
    { label: 'Refund & Warranty', href: '/refund-policy', view: 'refund-policy' as ViewState },
    { label: 'NFC Cards Nigeria', href: '/nfc-business-card-nigeria', type: 'path' as const },
    { label: 'NFC Cards Lagos', href: '/nfc-business-card-lagos', type: 'path' as const },
    { label: 'NFC Cards Lekki', href: '/nfc-business-card-lekki', type: 'path' as const },
    { label: 'NFC Metal Card', href: '/nfc-metal-business-card', type: 'path' as const },
    { label: 'NFC Card Price', href: '/nfc-business-card-price-nigeria', type: 'path' as const },
    { label: 'Real Estate NFC Cards', href: '/nfc-business-card-for-real-estate', type: 'path' as const },
    { label: 'Sales Team Cards', href: '/nfc-business-card-for-sales-teams', type: 'path' as const },
    { label: 'Corporate Cards', href: '/nfc-business-card-for-corporate-teams', type: 'path' as const },
  ];

  return (
    <footer className="border-t border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#07080B] text-neutral-600 dark:text-neutral-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 lg:py-20">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-neutral-100 dark:border-neutral-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4 pr-4">
            <a
              href="/"
              onClick={(e) => handleLink(e, 'landing')}
              className="inline-flex items-center text-left focus:outline-none cursor-pointer"
              aria-label="CHIP NG Home"
            >
              <BrandLogo size="sm" />
            </a>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
              The premier contactless NFC smart business card and dynamic link-in-bio platform for founders, executives, creators, and modern teams. Designed for zero-friction networking.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                NFC Cloud active · Sub-10ms response
              </span>
            </div>

            {/* Official CHIP NG Verified Socials */}
            <div className="pt-3 flex items-center gap-2.5">
              <SocialMediaIconBadge platform="TikTok" style="color-circle" size="xs" href="https://www.tiktok.com/@chipng_nfc" title="TikTok @chipng_nfc" />
              <SocialMediaIconBadge platform="Instagram" style="color-circle" size="xs" href="https://www.instagram.com/chipng_nfc" title="Instagram @chipng_nfc" />
              <SocialMediaIconBadge platform="X (Twitter)" style="color-circle" size="xs" href="https://x.com/chipng_nfc" title="X @chipng_nfc" />
              <SocialMediaIconBadge platform="LinkedIn" style="color-circle" size="xs" href="https://linkedin.com/company/chipng" title="LinkedIn CHIP NG" />
              <SocialMediaIconBadge platform="WhatsApp" style="color-circle" size="xs" href="https://wa.me/2348100764154" title="WhatsApp Concierge" />
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              Hardware &amp; Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="/#shop"
                  onClick={(e) => handleLink(e, 'landing', 'shop')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Smart NFC Metal Cards
                </a>
              </li>
              <li>
                <a
                  href="/#shop"
                  onClick={(e) => handleLink(e, 'landing', 'shop')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Matte PVC Smart Cards
                </a>
              </li>
              <li>
                <a
                  href="/buy-card"
                  onClick={(e) => handleLink(e, 'nfc-sales')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Order Your NFC Card</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16a34a]/20 text-[#16a34a] dark:text-[#16a34a] font-bold">/buy-card</span>
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  onClick={(e) => handlePathLink(e, '/pricing')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  2026 Hardware &amp; Plan Pricing
                </a>
              </li>
              <li>
                <a
                  href="/corporate-bundle"
                  onClick={(e) => handleLink(e, 'corporate-bundle')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Corporate Fleet Bundle</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16a34a]/20 text-[#16a34a] font-bold">10+1 Free</span>
                </a>
              </li>
              <li>
                <a
                  href="/enterprise"
                  onClick={(e) => handleLink(e, 'enterprise-dashboard')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Enterprise Team Cards
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="/company"
                  onClick={(e) => handleLink(e, 'company' as ViewState)}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  About CHIPNG
                </a>
              </li>
              <li>
                <a
                  href="/portfolio"
                  onClick={(e) => handleLink(e, 'portfolio')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-200"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#16a34a] dark:text-[#16a34a]" />
                  <span>Portfolio</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-white dark:bg-[#16a34a] dark:text-neutral-950 font-bold">New</span>
                </a>
              </li>
              <li>
                <a
                  href="/updates"
                  onClick={(e) => handleLink(e, 'updates' as ViewState)}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Updates &amp; Releases
                </a>
              </li>
              <li>
                <a
                  href="/shipping"
                  onClick={(e) => handleLink(e, 'shipping')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Shipping &amp; Logistics
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleLink(e, 'contact' as ViewState)}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Support &amp; Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="/blog"
                  onClick={(e) => handleLink(e, 'blog-directory')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Engineering &amp; Pricing Blog
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  onClick={(e) => handlePathLink(e, '/faq')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Help &amp; FAQ
                </a>
              </li>
              <li>
                <a
                  href="https://g.page/r/CZGM0zQdEiY7EAE/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Drop A Review</span>
                </a>
              </li>
              <li>
                <a
                  href="/refund-policy"
                  onClick={(e) => handleLink(e, 'refund-policy')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Refund &amp; Warranty Policy
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  onClick={(e) => handleLink(e, 'privacy-policy')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-of-service"
                  onClick={(e) => handleLink(e, 'terms-of-service')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors inline-block"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Regional & Industry Solutions Internal Link Bar */}
        <nav aria-label="Regional solutions and discovery" className="py-6 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
            Solutions &amp; Guides:
          </span>
          {regionalAndGuideLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) =>
                item.view ? handleLink(e, item.view) : handlePathLink(e, item.href)
              }
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a href="/llms.txt" className="hover:text-neutral-950 dark:hover:text-white transition-colors font-mono">
            llms.txt
          </a>
          <a href="/sitemap.xml" className="hover:text-neutral-950 dark:hover:text-white transition-colors font-mono">
            sitemap.xml
          </a>
        </nav>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} CHIPNG Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/portfolio"
              onClick={(e) => handleLink(e, 'portfolio')}
              className="flex items-center gap-1.5 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer font-medium"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#16a34a] dark:text-[#16a34a]" />
              <span>Portfolio</span>
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
