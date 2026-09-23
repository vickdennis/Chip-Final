import React from 'react';

export const MakroProofStats: React.FC = () => {
  const stats = [
    {
      value: '$48M+',
      label: 'Volume Forecasted & Invoiced',
      subtext: 'Across 12,000+ solopreneurs and independent teams',
    },
    {
      value: '1.4M+',
      label: 'NFC Touchpoints & Profile Views',
      subtext: 'Average 42% contact exchange conversion rate',
    },
    {
      value: '99.98%',
      label: 'Core Cloud Engine Uptime',
      subtext: 'Zero latency degradation across mobile browsers',
    },
    {
      value: '<10ms',
      label: 'NFC Instant Tap Handshake',
      subtext: 'Native hardware chip velocity on iOS & Android',
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
