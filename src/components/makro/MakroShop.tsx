import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { ViewState } from '../../App';
import { 
  CreditCard, 
  Smartphone, 
  Sparkles, 
  Zap, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';
import { MakroProductCheckoutModal } from './MakroProductCheckoutModal';
import { ProductImageSlider } from './ProductImageSlider';

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  created_at?: string;
  profile_id?: string | null;
}

// Fallback products matching the exact items in the Super Admin database
const FALLBACK_PRODUCTS: ShopProduct[] = [
  {
    id: '0ee82cbf-193f-4353-ae2b-1a1bd5827c2a',
    name: 'NFC Smart Black Card (PVC)',
    description: 'Ultra-durable matte black PVC finish with embedded high-frequency NFC chip. Scratch-resistant, waterproof, and activates instantly on all modern iPhones and Android devices.',
    price: 35000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.28640138450754493.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.7964022577458013.jpeg","https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80"]',
  },
  {
    id: '498a254d-e6f3-409b-b18f-8771861911e0',
    name: 'NFC Smart Metal Card',
    description: 'Precision-weighted aerospace grade stainless steel with matte obsidian coating. Dual-loop ceramic antenna decoupled with micro-ferrite absorption for 360° tap resonance.',
    price: 50000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9650784343957072.jpeg","https://images.unsplash.com/photo-1621252179027-94459d278660?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80"]',
  },
  {
    id: '8d956503-24c6-4bc3-9337-81b1e543c8b3',
    name: 'NFC Smart White Card (PVC)',
    description: 'Minimalist ceramic white satin finish. Crisp, modern, and universally compatible. Seamlessly links to your dynamic bio link with unlimited lifetime taps.',
    price: 30000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6186616949802414.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6520971912746258.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.8693980018651898.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9480990787847587.jpeg"]',
  },
  {
    id: 'b5e19741-2b08-4122-8356-91b427b0c901',
    name: 'NFC Smart Tags',
    description: 'Compact 30mm 3D dome resin epoxy NFC tags with high-tack 3M adhesive. Sticks firmly to any phone case, laptop, reception counter, or table. Instant contactless profile launch.',
    price: 8000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.45135496859203095.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6007388288544769.jpeg","https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80"]',
  },
  {
    id: '302ad048-48a6-4906-9fef-cb820da8fc81',
    name: 'Metal Debit Card + Custom Design',
    description: 'Bespoke precision laser engraving of your logo, signature, or custom emblem on brushed gunmetal or gold-tinted titanium. Includes VIP link-in-bio badge.',
    price: 80000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.39752302505154224.jpeg","https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"]',
  },
  {
    id: '7e57c7fa-becf-4a0a-a37f-7daf549dde5c',
    name: 'Metal Debit Card + NFC',
    description: 'The pinnacle executive statement. Pure dual-layer heavy metal casing with embedded contact chip & contactless NFC coil. Engineered for high-net-worth dealmakers.',
    price: 100000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6698054703282286.jpeg","https://images.unsplash.com/photo-1621252179027-94459d278660?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80"]',
  },
];

interface MakroShopProps {
  onNavigate: (view: ViewState) => void;
}

export const MakroShop: React.FC<MakroShopProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<ShopProduct[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'metal' | 'pvc' | 'tags'>('all');

  // Modern Homepage Product Checkout Modal State
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<ShopProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleStartOrder = (product: ShopProduct) => {
    setSelectedProductForOrder(product);
    setIsCheckoutOpen(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Query Super Admin products directly from the database (where profile_id is null)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('profile_id', null)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setProducts(FALLBACK_PRODUCTS);
      } else {
        // Display all products from the super admin dashboard
        setProducts(data);
      }
    } catch (err) {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract media images/videos from image_url which can be a JSON array or single string
  const getProductMedia = (imageUrl: string | null, productName: string = ''): string[] => {
    let list: string[] = [];
    if (imageUrl) {
      try {
        const parsed = JSON.parse(imageUrl);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.filter(Boolean);
        } else if (typeof parsed === 'string' && parsed) {
          list = [parsed];
        }
      } catch {
        list = [imageUrl];
      }
    }

    if (list.length === 0) {
      list = ['https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80'];
    }

    // Ensure every listed card and tag has 2+ images for the smooth auto-slide effect
    if (list.length === 1) {
      const lower = productName.toLowerCase();
      if (lower.includes('tag') || lower.includes('disc') || lower.includes('fob')) {
        list.push(
          'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6007388288544769.jpeg',
          'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80'
        );
      } else if (lower.includes('metal')) {
        list.push(
          'https://images.unsplash.com/photo-1621252179027-94459d278660?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80'
        );
      } else if (lower.includes('white')) {
        list.push(
          'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6520971912746258.jpeg',
          'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80'
        );
      } else {
        list.push(
          'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.7964022577458013.jpeg',
          'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80'
        );
      }
    }

    return list;
  };

  const filteredProducts = products.filter((p) => {
    const name = p.name.toLowerCase();
    if (activeFilter === 'metal') {
      return name.includes('metal') || name.includes('debit');
    }
    if (activeFilter === 'pvc') {
      return name.includes('pvc') || name.includes('black') || name.includes('white');
    }
    if (activeFilter === 'tags') {
      return name.includes('tag') || name.includes('disc') || name.includes('fob');
    }
    return true;
  });

  return (
    <section id="shop" className="py-20 md:py-28 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors relative border-t border-neutral-200/70 dark:border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#76BB08]"></span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
                Official Hardware & Smart Cards Store
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
              Premium NFC Smart Cards & Tags.
              <br />
              <span className="text-neutral-500 dark:text-neutral-400">
                Crafted for zero-friction handshakes.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
              One tap transfers your dynamic Link-in-Bio profile and verified vCard directly to their phone book. All cards and tags are programmed in our Lagos workshop and dispatched nationwide.
            </p>
          </div>

          {/* Filter Pills & Category Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex p-1 bg-neutral-200/70 dark:bg-neutral-800/80 rounded-full backdrop-blur-md self-start sm:self-auto flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                All Cards & Tags
              </button>
              <button
                onClick={() => setActiveFilter('metal')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'metal'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                Metal Editions
              </button>
              <button
                onClick={() => setActiveFilter('pvc')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'pvc'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                Smart PVC
              </button>
              <button
                onClick={() => setActiveFilter('tags')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'tags'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                Smart Tags
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid: Responsive 3-Column Layout for All Super Admin Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const mediaList = getProductMedia(product.image_url, product.name);
            const isTag = product.name.toLowerCase().includes('tag') || product.name.toLowerCase().includes('disc') || product.name.toLowerCase().includes('fob');
            const isMetal = product.name.toLowerCase().includes('metal');

            return (
              <div
                key={product.id}
                className="group bg-white dark:bg-[#12141B] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Automatic Smooth Product Image Slider */}
                <ProductImageSlider
                  images={mediaList}
                  alt={product.name}
                  badgeText={isTag ? 'Smart NFC Tag' : isMetal ? 'Heavy Metal Edition' : 'Ultra-Slim PVC'}
                  badgeType={isTag ? 'tag' : isMetal ? 'metal' : 'pvc'}
                  autoSlideInterval={3200}
                />

                {/* Content & Details */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight group-hover:text-[#76BB08] dark:group-hover:text-[#76BB08] transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                      {product.description ||
                        'Embedded sub-10ms high frequency NFC chip. Lifetime dynamic cloud profile updating with no application required.'}
                    </p>

                    {/* Hardware Specifications */}
                    <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#76BB08] dark:text-[#76BB08]" />
                        <span>NTAG216 Chip</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#76BB08] dark:text-[#76BB08]" />
                        <span>iOS & Android</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#76BB08] dark:text-[#76BB08]" />
                        <span>Zero App Needed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#76BB08] dark:text-[#76BB08]" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {isTag ? '3M High-Tack Adhesive' : 'Core Free + 3-Mo Pro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Purchase Action in ₦ (Naira) */}
                  <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block">
                        Official Price
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white font-mono tracking-tight tabular-nums">
                        ₦{Number(product.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartOrder(product)}
                      className="group/btn flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      <span>{isTag ? 'Order Tag' : 'Order Card'}</span>
                      <div className="w-6 h-6 rounded-full bg-[#76BB08] text-neutral-950 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple, Transparent Pricing Section */}
        <div className="mt-16 pt-12 border-t border-neutral-200/80 dark:border-white/10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76BB08]/15 text-[#76BB08] dark:text-[#76BB08] border border-[#76BB08]/30 text-[11px] font-bold uppercase tracking-wider mb-3">
              Simple, Transparent Pricing
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Buy the hardware once. The core software is yours for life.
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mt-3 leading-relaxed">
              We hate hidden fees as much as you do. When you purchase any CHIPNG card, your core digital profile requires <strong className="text-neutral-950 dark:text-white">no monthly subscriptions</strong>. Need advanced analytics and CRM tools to scale your business? We offer a powerful Pro Dashboard—and we include the first <strong className="text-neutral-950 dark:text-white">3 months completely free</strong> with any card purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* CHIP Core Box */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/10 text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-4">
                  Included with every card
                </div>
                <h4 className="text-xl font-extrabold text-neutral-950 dark:text-white">CHIP Core</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-neutral-950 dark:text-white">₦0</span>
                  <span className="text-xs text-neutral-500 font-medium">/month (No monthly subscriptions required)</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
                  Everything you need to network seamlessly and ditch paper cards for good.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Unlimited NFC Taps:</strong> Your card works for life.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Dynamic Link-in-Bio Profile:</strong> Add your links, socials, and portfolio.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Instant vCard Saves:</strong> 1-tap download to iOS & Android phonebooks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Profile Updates:</strong> Change your links or job title anytime.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Zero App Required:</strong> Works instantly on any modern smartphone.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-white/5 text-[11px] text-neutral-400 text-center font-mono">
                No subscription required &bull; Works forever
              </div>
            </div>

            {/* CHIP Pro Dashboard Box */}
            <div className="rounded-3xl p-6 sm:p-8 bg-neutral-950 text-white dark:bg-[#16181f] border-2 border-[#76BB08] shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#76BB08] text-neutral-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                3-Months Free Trial
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#76BB08] mb-4">
                  For Power Networkers & Teams
                </div>
                <h4 className="text-xl font-extrabold text-white">CHIP Pro Dashboard</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-[#76BB08]">₦3,000</span>
                  <span className="text-xs text-white/70 font-medium">/month (First 3 months 100% FREE with any card)</span>
                </div>
                <p className="text-xs text-white/70 mt-2 mb-6">
                  Turn your profile into a high-converting lead-generation engine.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-neutral-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                    <span><strong>Advanced Tap Analytics:</strong> Track tap locations, link clicks, and profile views over time.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                    <span><strong>2-Way Contact Capture:</strong> Let prospects submit their info directly to you.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                    <span><strong>Automatic CRM Export:</strong> Sync your captured leads to your favorite tools.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                    <span><strong>Premium Branding:</strong> Remove CHIPNG watermarks and use custom color themes.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-[#76BB08] text-center font-medium">
                Downgrade anytime without penalties: Your physical card works forever.
              </div>
            </div>
          </div>
        </div>

        {/* Value Guarantees Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-neutral-100/80 dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-2xs">
              <Truck className="w-5 h-5 text-[#76BB08] dark:text-[#76BB08]" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Fast Nationwide Delivery</div>
              <div className="text-[11px] text-neutral-500">24-48h dispatch from Lagos workshop</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#76BB08] dark:text-[#76BB08]" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">12-Month Hardware Guarantee</div>
              <div className="text-[11px] text-neutral-500">Free replacement on antenna chip wear</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-2xs">
              <RefreshCw className="w-5 h-5 text-[#76BB08] dark:text-[#76BB08]" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Unlimited Link Updates</div>
              <div className="text-[11px] text-neutral-500">Change your bio links anytime for free</div>
            </div>
          </div>
        </div>

      </div>

      {/* Beautiful Modern Homepage Product Checkout Screen */}
      {isCheckoutOpen && selectedProductForOrder && (
        <MakroProductCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProductForOrder(null);
          }}
          product={selectedProductForOrder}
          onNavigate={onNavigate}
        />
      )}
    </section>
  );
};
