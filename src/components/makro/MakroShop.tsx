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
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.28640138450754493.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.7964022577458013.jpeg"]',
  },
  {
    id: '498a254d-e6f3-409b-b18f-8771861911e0',
    name: 'NFC Smart Metal Card',
    description: 'Precision-weighted aerospace grade stainless steel with matte obsidian coating. Dual-loop ceramic antenna decoupled with micro-ferrite absorption for 360° tap resonance.',
    price: 50000,
    image_url: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9650784343957072.jpeg',
  },
  {
    id: '302ad048-48a6-4906-9fef-cb820da8fc81',
    name: 'Metal Debit Card + Custom Design',
    description: 'Bespoke precision laser engraving of your logo, signature, or custom emblem on brushed gunmetal or gold-tinted titanium. Includes VIP link-in-bio badge.',
    price: 80000,
    image_url: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.39752302505154224.jpeg',
  },
  {
    id: '7e57c7fa-becf-4a0a-a37f-7daf549dde5c',
    name: 'Metal Debit Card + NFC',
    description: 'The pinnacle executive statement. Pure dual-layer heavy metal casing with embedded contact chip & contactless NFC coil. Engineered for high-net-worth dealmakers.',
    price: 100000,
    image_url: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6698054703282286.jpeg',
  },
  {
    id: '8d956503-24c6-4bc3-9337-81b1e543c8b3',
    name: 'NFC Smart White Card (PVC)',
    description: 'Minimalist ceramic white satin finish. Crisp, modern, and universally compatible. Seamlessly links to your dynamic bio link with unlimited lifetime taps.',
    price: 30000,
    image_url: '["https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6186616949802414.jpeg","https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.6520971912746258.jpeg"]',
  },
];

interface MakroShopProps {
  onNavigate: (view: ViewState) => void;
}

export const MakroShop: React.FC<MakroShopProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<ShopProduct[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'metal' | 'pvc'>('all');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<{ [productId: string]: number }>({});

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
        setProducts(data);
      }
    } catch (err) {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract media images/videos from image_url which can be a JSON array or single string
  const getProductMedia = (imageUrl: string | null): string[] => {
    if (!imageUrl) {
      return ['https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80'];
    }
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Not JSON, return as single string
    }
    return [imageUrl];
  };

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'metal') {
      return p.name.toLowerCase().includes('metal');
    }
    if (activeFilter === 'pvc') {
      return p.name.toLowerCase().includes('pvc') || !p.name.toLowerCase().includes('metal');
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
              <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
                Official Hardware & Smart Cards Store
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
              Premium NFC Smart Cards.
              <br />
              <span className="text-neutral-500 dark:text-neutral-400">
                Crafted for zero-friction handshakes.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
              One tap transfers your dynamic Link-in-Bio profile and verified vCard directly to their phone book. All cards are laser-engraved in our Lagos workshop and dispatched nationwide.
            </p>
          </div>

          {/* Filter Pills & Live Sync Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex p-1 bg-neutral-200/70 dark:bg-neutral-800/80 rounded-full backdrop-blur-md self-start sm:self-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                All Cards
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
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const mediaList = getProductMedia(product.image_url);
            const activeIndex = selectedMediaIndex[product.id] || 0;
            const currentMedia = mediaList[activeIndex] || mediaList[0];
            const isVideo = currentMedia?.match(/\.(mp4|webm)$/i);
            const isMetal = product.name.toLowerCase().includes('metal');

            return (
              <div
                key={product.id}
                className="group bg-white dark:bg-[#12141B] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Media Showcase */}
                <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  {isVideo ? (
                    <video
                      src={currentMedia}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={currentMedia}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md text-white text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-[#D2F843]" />
                      <span>{isMetal ? 'Heavy Metal Edition' : 'Ultra-Slim PVC'}</span>
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                    In Stock
                  </div>

                  {/* Multi-image thumbnail pills */}
                  {mediaList.length > 1 && (
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 px-2">
                      {mediaList.map((_, mIdx) => (
                        <button
                          key={mIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMediaIndex((prev) => ({ ...prev, [product.id]: mIdx }));
                          }}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            activeIndex === mIdx ? 'bg-[#D2F843] w-6' : 'bg-white/60 hover:bg-white'
                          }`}
                          aria-label={`View image ${mIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Content & Details */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight group-hover:text-[#84A900] dark:group-hover:text-[#D2F843] transition-colors leading-snug">
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
                        <Check className="w-3 h-3 text-[#84A900] dark:text-[#D2F843]" />
                        <span>NTAG216 Chip</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#84A900] dark:text-[#D2F843]" />
                        <span>iOS & Android</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#84A900] dark:text-[#D2F843]" />
                        <span>Zero App Needed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#84A900] dark:text-[#D2F843]" />
                        <span>Free vCard Profile</span>
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
                      onClick={() => onNavigate('nfc-sales')}
                      className="group/btn flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      <span>Order Card</span>
                      <div className="w-6 h-6 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Guarantees Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-neutral-100/80 dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-2xs">
              <Truck className="w-5 h-5 text-[#84A900] dark:text-[#D2F843]" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Fast Nationwide Delivery</div>
              <div className="text-[11px] text-neutral-500">24-48h dispatch from Lagos workshop</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#84A900] dark:text-[#D2F843]" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">12-Month Hardware Guarantee</div>
              <div className="text-[11px] text-neutral-500">Free replacement on antenna chip wear</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-2xs">
              <RefreshCw className="w-5 h-5 text-[#84A900] dark:text-[#D2F843]" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Unlimited Link Updates</div>
              <div className="text-[11px] text-neutral-500">Change your bio links anytime for free</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
