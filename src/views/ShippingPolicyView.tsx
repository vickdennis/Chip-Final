import React from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle } from 'lucide-react';

interface ShippingPolicyViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function ShippingPolicyView({
  onNavigate,
  isDarkMode = false,
  toggleDarkMode = () => {},
}: ShippingPolicyViewProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950 font-sans">
      <MakroNavbar
        currentView="landing"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] text-xs font-mono font-bold">
              LOGISTICS & FULFILLMENT
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Shipping & Delivery Policy
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Last updated: September 2026. Every CHIP NG smart card is custom fabricated and dispatched directly from our Lagos production workshop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#12141B] p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-950 dark:text-white">Lagos Delivery</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                24–48 hours dispatch via dedicated direct courier across Island (Ikoyi, Victoria Island, Lekki) and Mainland (Ikeja, Yaba, Surulere).
              </p>
            </div>

            <div className="bg-white dark:bg-[#12141B] p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-950 dark:text-white">Pan-Nigeria Express</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                2–4 business days delivery to Abuja, Port Harcourt, Ibadan, Enugu, Kano, and all 36 states via DHL Express and GIG Logistics.
              </p>
            </div>

            <div className="bg-white dark:bg-[#12141B] p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-950 dark:text-white">Live Tracking</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                You receive instant WhatsApp and email tracking confirmation the moment your laser-engraved card leaves our Lagos workshop.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12141B] p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white">1. Production & Fabrication Schedule</h2>
              <p>
                Because our cards are physically custom fabricated (precision UV full-color printing for matte PVC cards and fiber-laser deep engraving for metal cards), production begins immediately following design proof approval via our WhatsApp Concierge (+234 810 076 4154).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white">2. Shipping Rates</h2>
              <p>
                Standard courier delivery within Lagos State is calculated at checkout (₦2,500 – ₦3,500 depending on area). Interstate delivery to all other Nigerian states is ₦4,500 – ₦6,000. Orders above 5 cards qualify for free express shipping nationwide.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white">3. International Shipping</h2>
              <p>
                We ship to Ghana, Kenya, South Africa, the United Kingdom, the United States, and Canada via DHL Worldwide Express (3–7 business days). Contact our international concierge for customs declaration support.
              </p>
            </section>
          </div>

        </div>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
