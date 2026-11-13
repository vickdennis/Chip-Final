import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  MapPin, 
  Users, 
  Share2, 
  Palette, 
  Video, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { openFlutterwavePayment } from '../utils/flutterwaveClient';
import { supabase } from '../supabaseClient';
import { toast } from './Toast';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrencyAmount } from '../utils/currency';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSuccess?: () => void;
  defaultFeature?: string;
}

export default function ProUpgradeModal({
  isOpen,
  onClose,
  profile,
  onSuccess,
  defaultFeature
}: ProUpgradeModalProps) {
  const { formatNgn, getCheckout } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const monthlyPrice = 4999; // ₦4,999/mo
  const annualPrice = 45000; // ₦45,000/yr (~₦3,750/mo - Save 25%)
  const activeNgnPrice = billingCycle === 'annual' ? annualPrice : monthlyPrice;
  const checkout = getCheckout(activeNgnPrice);
  const formattedPay = formatCurrencyAmount(checkout.checkoutAmount, checkout.checkoutCurrency);

  const handleActivatePro = async (isTestSim = false) => {
    setUpgrading(true);
    try {
      if (isTestSim) {
        // Direct instant activation
        const targetId = profile?.id;
        if (targetId) {
          await supabase.from('profiles').update({
            is_pro: true,
            remove_branding: true
          }).eq('id', targetId);
        }

        // Cache locally
        if (profile?.username) {
          localStorage.setItem(`chipng_pro_${profile.username}`, 'true');
        }
        if (profile?.id) {
          localStorage.setItem(`chipng_pro_${profile.id}`, 'true');
        }

        toast.success('👑 Welcome to CHIP NG Pro! All executive features are now active.');
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      // Real Flutterwave Payment in visitor's local/supported currency
      await openFlutterwavePayment({
        amount: checkout.checkoutAmount,
        currency: checkout.checkoutCurrency,
        customer: {
          email: profile?.contact_email || profile?.email || 'user@chipng.com',
          name: profile?.full_name || profile?.username || 'CHIP Executive',
          phone_number: profile?.phone_number || ''
        },
        title: `CHIP NG Pro Subscription (${billingCycle === 'annual' ? 'Annual Plan' : 'Monthly Plan'})`,
        description: 'Advanced Tap Analytics, 2-Way Contact Capture, Automatic CRM Export, Premium Branding & Interstitial Intro Video',
        onSuccess: async () => {
          const targetId = profile?.id;
          if (targetId) {
            await supabase.from('profiles').update({
              is_pro: true,
              remove_branding: true
            }).eq('id', targetId);
          }

          if (profile?.username) {
            localStorage.setItem(`chipng_pro_${profile.username}`, 'true');
          }
          if (profile?.id) {
            localStorage.setItem(`chipng_pro_${profile.id}`, 'true');
          }

          toast.success('👑 Welcome to CHIP NG Pro! All executive features are now unlocked.');
          if (onSuccess) onSuccess();
          onClose();
        },
        onClose: () => {
          setUpgrading(false);
        }
      });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to process upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  const proFeatures = [
    {
      icon: MapPin,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      title: 'Advanced Tap Analytics',
      desc: 'Track physical tap locations (cities & countries), link click conversion heatmaps, and views over time.'
    },
    {
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      title: '2-Way Contact Capture',
      desc: 'Allow event attendees & clients to send their contact info and notes directly back to your dashboard with 1 tap.'
    },
    {
      icon: Share2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      title: 'Automatic CRM Export',
      desc: 'Instantly sync captured leads to HubSpot, Salesforce, Zapier, Notion, or custom Webhook in real-time.'
    },
    {
      icon: Palette,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      title: 'Premium Branding',
      desc: 'Remove all CHIPNG watermarks and unlock custom luxury themes (Royal Gold, Emerald, Makro Teal, Obsidian).'
    },
    {
      icon: Video,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      title: 'Autoplay Interstitial Intro Video',
      desc: 'Showcase a short executive pitch or greeting video that automatically pops up when someone taps your card.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="p-6 sm:p-7 border-b border-neutral-100 dark:border-white/10 relative bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              CHIP NG Executive Tier
            </span>
          </div>

          <h2 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
            Upgrade to CHIP Pro
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Unlock executive analytics, 2-way lead capture, automatic CRM sync, and custom video branding.
          </p>

          {/* Billing Toggle */}
          <div className="mt-4 flex items-center justify-center p-1 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Annual <span className="text-[10px] text-emerald-500 font-mono ml-1 font-extrabold">-25%</span>
            </button>
          </div>

          <div className="mt-3 text-center">
            <span className="text-3xl font-extrabold text-neutral-950 dark:text-white">
              {formatNgn(activeNgnPrice)}
            </span>
            <span className="text-xs text-neutral-400 font-medium ml-1.5">
              {billingCycle === 'annual' ? `/year (~${formatNgn(3750)}/mo)` : '/month'}
            </span>
          </div>
        </div>

        {/* Feature List (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 divide-y divide-neutral-100 dark:divide-white/5">
          {proFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            const isHighlighted = defaultFeature && feat.title.toLowerCase().includes(defaultFeature.toLowerCase());
            return (
              <div key={idx} className={`pt-3.5 first:pt-0 flex items-start gap-3.5 ${isHighlighted ? 'bg-amber-500/5 -mx-2 px-2 py-2 rounded-xl' : ''}`}>
                <div className={`w-8 h-8 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {feat.title}
                    {isHighlighted && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                        Selected
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.01] flex flex-col gap-2.5">
          <button
            type="button"
            disabled={upgrading}
            onClick={() => handleActivatePro(false)}
            className="w-full py-3.5 px-6 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>{upgrading ? 'Processing Upgrade...' : `Subscribe via Flutterwave (${formattedPay}/${billingCycle === 'annual' ? 'yr' : 'mo'})`}</span>
          </button>

          <button
            type="button"
            disabled={upgrading}
            onClick={() => handleActivatePro(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Instant Activation (Simulate Pro Account)
          </button>
        </div>
      </div>
    </div>
  );
}
