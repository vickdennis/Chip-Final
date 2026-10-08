import React, { useState } from 'react';
import { Check, Minus, Zap, Sparkles, ArrowRight, LayoutGrid, Table } from 'lucide-react';

interface ProductComparisonMatrixProps {
  onSelectTier?: (tier: 'plastic' | 'metal' | 'heavy_metal') => void;
}

export const ProductComparisonMatrix: React.FC<ProductComparisonMatrixProps> = ({
  onSelectTier,
}) => {
  const [activeMobileTier, setActiveMobileTier] = useState<'plastic' | 'metal' | 'heavy_metal'>('metal');
  const [mobileViewMode, setMobileViewMode] = useState<'card' | 'table'>('card');

  const comparisonData = [
    {
      category: 'Hardware & Material Engineering',
      rows: [
        {
          feature: 'Card Core Material',
          pvc: 'High-Density Polymer PVC',
          metal: '304 Solid Stainless Steel',
          customMetal: 'Aerospace-Grade Alloy',
        },
        {
          feature: 'Physical Weight',
          pvc: '5g (Featherlight daily driver)',
          metal: '24g (Substantial metallic presence)',
          customMetal: '28g (Ultra-dense executive weight)',
        },
        {
          feature: 'Surface Finish',
          pvc: 'Matte Obsidian or Glacier White',
          metal: 'Brushed Space Gray or Matte Gold',
          customMetal: '24K Mirror Gold or Obsidian Black PVD',
        },
        {
          feature: 'Acoustic Table Presence',
          pvc: 'Silent composite tap',
          metal: 'Crisp metallic thud',
          customMetal: 'Resonant boardroom table clink',
        },
      ],
    },
    {
      category: 'Fabrication & Personalization',
      rows: [
        {
          feature: 'Branding Technique',
          pvc: 'Full-Color HD UV Printing',
          metal: 'Single-Sided Fiber-Laser Etch',
          customMetal: 'Dual-Sided Deep CNC Fiber-Laser',
        },
        {
          feature: 'Wear & Fade Resistance',
          pvc: 'Scratch-resistant UV cure coating',
          metal: 'Permanent, unscratchable laser etching',
          customMetal: 'Indestructible deep-relief engraving',
        },
        {
          feature: 'Design Assistance',
          pvc: 'Standard self-serve preview',
          metal: 'Pre-production digital mockup',
          customMetal: '1-on-1 Senior Graphic Designer review',
        },
        {
          feature: 'Optional EMV Debit Transplant',
          pvc: false,
          metal: 'Available (+₦15,000 add-on)',
          customMetal: 'Fully compatible & supported',
        },
      ],
    },
    {
      category: 'Contactless & Network Technology',
      rows: [
        {
          feature: 'NFC Response Latency',
          pvc: '< 10ms (NTAG216 chip)',
          metal: '< 10ms (Ferrite-shielded)',
          customMetal: '< 10ms (Tuned 360° ceramic induction)',
        },
        {
          feature: 'Through-Case Transmission',
          pvc: 'Up to 3cm through thick phone cases',
          metal: 'High-gain induction across iOS & Android',
          customMetal: 'Maximum RF penetration technology',
        },
        {
          feature: 'Backup QR Code',
          pvc: 'High-contrast printed vector QR',
          metal: 'High-precision laser etched QR',
          customMetal: 'Laser-annealed permanent QR',
        },
      ],
    },
    {
      category: 'Software, Telemetry & Guarantees',
      rows: [
        {
          feature: 'CHIP Core Software',
          pvc: 'Lifetime access (₦0/month)',
          metal: 'Lifetime access (₦0/month)',
          customMetal: 'Lifetime access (₦0/month)',
        },
        {
          feature: 'CHIP Pro Trial',
          pvc: '3 Months Free Trial included',
          metal: '3 Months Free Trial included',
          customMetal: '12 Months Free Pro Dashboard included',
        },
        {
          feature: 'Production Priority',
          pvc: 'Standard queue (24-48h dispatch)',
          metal: 'Priority queue (24h Lagos dispatch)',
          customMetal: 'VIP expedited bench queue (Same-day)',
        },
        {
          feature: 'Hardware Guarantee',
          pvc: '12-Month chip replacement',
          metal: '12-Month full replacement',
          customMetal: 'Lifetime hardware & engraving warranty',
        },
      ],
    },
  ];

  const tiersConfig = {
    plastic: {
      id: 'plastic' as const,
      name: 'Smart PVC',
      price: '₦30,000',
      badge: 'Starter Utility',
      desc: 'Featherlight, waterproof daily driver for modern networking.',
      btnLabel: 'Select Smart PVC (₦30,000)',
      btnStyle: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950',
    },
    metal: {
      id: 'metal' as const,
      name: 'Smart Metal',
      price: '₦50,000',
      badge: 'Professional First Impression',
      desc: '24g solid 304 stainless steel with fiber-laser precision.',
      btnLabel: 'Select Smart Metal (₦50,000)',
      btnStyle: 'bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950',
    },
    heavy_metal: {
      id: 'heavy_metal' as const,
      name: 'Custom Heavy Metal',
      price: '₦100,000',
      badge: '★ Executive Bestseller',
      desc: '28g aerospace alloy with deep CNC dual-sided engraving.',
      btnLabel: 'Select Heavy Metal (10% Off)',
      btnStyle: 'bg-[#D2F843] hover:bg-[#c2e833] text-neutral-950 font-black',
    },
  };

  return (
    <div className="w-full my-10 sm:my-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 px-2 sm:px-4">
        <div className="inline-flex items-center gap-2 bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          Hardware & Feature Transparency
        </div>
        <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          Compare CHIP NG Hardware Tiers
        </h3>
        <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 max-w-xl mx-auto leading-relaxed">
          From reliable daily utilities to boardroom-dominating metal heavyweights. See exactly what you get at every price point.
        </p>

        {/* Mobile View Mode Switcher (Card View vs Full Table) */}
        <div className="mt-5 flex md:hidden items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setMobileViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all min-h-[36px] ${
                mobileViewMode === 'card'
                  ? 'bg-white dark:bg-[#1a1c23] text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all min-h-[36px] ${
                mobileViewMode === 'table'
                  ? 'bg-white dark:bg-[#1a1c23] text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Side-by-Side Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE CARD VIEW (Optimized for small screens) ================= */}
      {mobileViewMode === 'card' && (
        <div className="block md:hidden">
          {/* Mobile Tier Segmented Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 mb-4">
            {(['plastic', 'metal', 'heavy_metal'] as const).map((tierKey) => {
              const tier = tiersConfig[tierKey];
              const isSelected = activeMobileTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setActiveMobileTier(tierKey)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all min-h-[48px] text-center ${
                    isSelected
                      ? tierKey === 'heavy_metal'
                        ? 'bg-[#D2F843] text-neutral-950 shadow-sm'
                        : 'bg-white dark:bg-[#161821] text-neutral-950 dark:text-white shadow-sm font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight truncate w-full px-0.5">
                    {tier.name}
                  </span>
                  <span className={`text-[10px] font-mono leading-tight mt-0.5 ${
                    isSelected && tierKey === 'heavy_metal'
                      ? 'text-neutral-950 font-black'
                      : isSelected
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}>
                    {tier.price}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tier Mobile Card */}
          <div className={`rounded-3xl border p-5 sm:p-6 transition-all ${
            activeMobileTier === 'heavy_metal'
              ? 'bg-neutral-950 text-white dark:bg-[#151821] border-[#D2F843] shadow-[0_10px_30px_rgba(210,248,67,0.12)]'
              : activeMobileTier === 'metal'
              ? 'bg-neutral-900 text-white dark:bg-[#14161f] border-neutral-700 shadow-md'
              : 'bg-white dark:bg-[#111318] text-neutral-950 dark:text-white border-neutral-200/80 dark:border-white/10 shadow-sm'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                activeMobileTier === 'heavy_metal'
                  ? 'bg-[#D2F843] text-neutral-950'
                  : activeMobileTier === 'metal'
                  ? 'bg-white/10 text-white'
                  : 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white/80'
              }`}>
                {tiersConfig[activeMobileTier].badge}
              </span>
              <span className="text-xl font-black font-mono">
                {tiersConfig[activeMobileTier].price}
              </span>
            </div>

            <h4 className="text-lg font-bold mt-1">
              {tiersConfig[activeMobileTier].name}
            </h4>
            <p className="text-xs opacity-75 mt-1 leading-relaxed">
              {tiersConfig[activeMobileTier].desc}
            </p>

            {/* Spec breakdown by category */}
            <div className="mt-5 space-y-4">
              {comparisonData.map((cat) => (
                <div key={cat.category} className="border-t border-white/10 dark:border-white/10 pt-3">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-60 mb-2">
                    {cat.category}
                  </h5>
                  <div className="space-y-2">
                    {cat.rows.map((row) => {
                      const val =
                        activeMobileTier === 'plastic'
                          ? row.pvc
                          : activeMobileTier === 'metal'
                          ? row.metal
                          : row.customMetal;

                      return (
                        <div key={row.feature} className="flex items-start justify-between gap-2 text-xs py-1">
                          <span className="opacity-70 shrink-0 max-w-[45%] font-medium">
                            {row.feature}
                          </span>
                          <span className="text-right font-semibold">
                            {typeof val === 'boolean' ? (
                              val ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                  <Check className="w-3.5 h-3.5" /> Included
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 opacity-40">
                                  <Minus className="w-3.5 h-3.5" /> Not available
                                </span>
                              )
                            ) : (
                              val
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Button for this tier */}
            <button
              type="button"
              onClick={() => onSelectTier?.(activeMobileTier)}
              className={`mt-6 w-full py-3.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md min-h-[44px] ${tiersConfig[activeMobileTier].btnStyle}`}
            >
              <span>{tiersConfig[activeMobileTier].btnLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= DESKTOP & TABLET MATRIX TABLE (Or toggled on mobile) ================= */}
      <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden md:block'} w-full`}>
        {/* Swipe hint on mobile table mode */}
        <div className="block md:hidden text-center mb-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          ← Swipe horizontally to inspect all 3 tiers →
        </div>

        <div className="overflow-x-auto rounded-3xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318] shadow-lg">
          <table className="w-full text-left border-collapse min-w-[640px] sm:min-w-[720px]">
            {/* Header Tier Cards */}
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02]">
                <th className="p-4 sm:p-6 w-1/4 align-bottom">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    Tier Breakdown
                  </span>
                  <div className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-1">
                    Choose Your Build
                  </div>
                </th>

                {/* TIER 1: PVC */}
                <th className="p-4 sm:p-6 w-1/4 align-top border-l border-neutral-200/60 dark:border-white/10">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-bold">
                    Starter Utility
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mt-2">
                    Smart PVC
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-neutral-950 dark:text-white">₦30,000</span>
                    <span className="text-xs text-neutral-400 font-medium">one-time</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    Featherlight, waterproof daily driver for modern networking.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectTier?.('plastic')}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <span>Select PVC</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </th>

                {/* TIER 2: SMART METAL */}
                <th className="p-4 sm:p-6 w-1/4 align-top border-l border-neutral-200/60 dark:border-white/10 bg-neutral-100/50 dark:bg-white/[0.04]">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold">
                    Professional Metal
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mt-2">
                    Smart Metal
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-neutral-950 dark:text-white">₦50,000</span>
                    <span className="text-xs text-neutral-400 font-medium">one-time</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                    24g solid 304 stainless steel with fiber-laser precision.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectTier?.('metal')}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm min-h-[40px]"
                  >
                    <span>Select Metal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </th>

                {/* TIER 3: CUSTOM HEAVY METAL */}
                <th className="p-4 sm:p-6 w-1/4 align-top border-l-2 border-[#D2F843] bg-[#D2F843]/10 relative">
                  <div className="absolute top-2 right-4 bg-[#D2F843] text-neutral-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Executive Bestseller
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#D2F843]/20 text-[#6c8600] dark:text-[#D2F843] font-bold">
                    Boardroom Authority
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-neutral-950 dark:text-white mt-2">
                    Custom Heavy Metal
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-neutral-950 dark:text-white">₦100,000</span>
                    <span className="text-xs text-neutral-500 font-medium">one-time</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
                    28g aerospace alloy with deep CNC dual-sided engraving.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectTier?.('heavy_metal')}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#D2F843] hover:bg-[#c2e833] text-neutral-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md font-extrabold min-h-[40px]"
                  >
                    <span>Select Executive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </th>
              </tr>
            </thead>

            {/* Table Body by Categories */}
            <tbody>
              {comparisonData.map((cat) => (
                <React.Fragment key={cat.category}>
                  {/* Category Header Row */}
                  <tr className="bg-neutral-100/80 dark:bg-neutral-900/60 border-t border-b border-neutral-200/80 dark:border-white/10">
                    <td
                      colSpan={4}
                      className="py-2.5 sm:py-3 px-4 sm:px-6 text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Individual Feature Rows */}
                  {cat.rows.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-neutral-100 dark:border-white/5 hover:bg-neutral-50/50 dark:hover:bg-white/[0.015] transition-colors"
                    >
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {row.feature}
                      </td>

                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs border-l border-neutral-100 dark:border-white/5 text-neutral-600 dark:text-neutral-400">
                        {typeof row.pvc === 'boolean' ? (
                          row.pvc ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                          )
                        ) : (
                          row.pvc
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs border-l border-neutral-100 dark:border-white/5 text-neutral-800 dark:text-neutral-200 font-medium bg-neutral-50/30 dark:bg-white/[0.01]">
                        {typeof row.metal === 'boolean' ? (
                          row.metal ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                          )
                        ) : (
                          row.metal
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs border-l-2 border-[#D2F843] text-neutral-950 dark:text-white font-semibold bg-[#D2F843]/[0.03]">
                        {typeof row.customMetal === 'boolean' ? (
                          row.customMetal ? (
                            <Check className="w-4 h-4 text-[#84A900] dark:text-[#D2F843]" />
                          ) : (
                            <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                          )
                        ) : (
                          row.customMetal
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Psychology Summary Callout */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-neutral-900 text-white dark:bg-[#161821] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#D2F843] text-neutral-950 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white">Why Invest in Heavy Metal?</div>
            <div className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 leading-relaxed">
              When closing an ₦80M luxury deal in Ikoyi or raising venture funding in Victoria Island, the weight of your card signals non-negotiable executive authority.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectTier?.('heavy_metal')}
          className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#D2F843] text-neutral-950 font-bold text-xs hover:bg-[#c2e833] transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-sm text-center min-h-[44px]"
        >
          Build Your Custom Metal Card &rarr;
        </button>
      </div>
    </div>
  );
};
