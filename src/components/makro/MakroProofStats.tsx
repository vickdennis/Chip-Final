import React from 'react';

export const MakroProofStats: React.FC = () => {
  const stats = [
    {
      value: '₦620M+',
      label: 'Deals & Client Bookings Generated',
      subtext: 'Across 25,000+ professionals, founders & creators in Nigeria and globally',
    },
    {
      value: '1.8M+',
      label: 'NFC Card Taps & Handshakes',
      subtext: 'Instant contactless engagement with zero app downloads required',
    },
    {
      value: '48.2%',
      label: 'Direct vCard Save Rate',
      subtext: 'High-intent contact saving directly into iOS & Android address books',
    },
    {
      value: '<10ms',
      label: 'Hardware Tap Handshake',
      subtext: 'Native NTAG216 high-frequency microchip response on modern phones',
    },
  ];

  return (
    <section className="py-20 md:py-24 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#0C0E13] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight font-mono tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
                {stat.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
