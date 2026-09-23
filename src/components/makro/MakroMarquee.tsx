import React from 'react';

export const MakroMarquee: React.FC = () => {
  const brands = [
    { name: 'Paystack', symbol: 'PAYSTACK' },
    { name: 'Flutterwave', symbol: 'FLUTTERWAVE' },
    { name: 'Techstars', symbol: 'TECHSTARS' },
    { name: 'PiggyVest', symbol: 'PIGGYVEST' },
    { name: 'Moniepoint', symbol: 'MONIEPOINT' },
    { name: 'Stripe Climate', symbol: 'STRIPE' },
    { name: 'Y Combinator Alumni', symbol: 'YC ALUMNI' },
    { name: 'Brex Network', symbol: 'BREX' },
  ];

  return (
    <section className="py-12 border-y border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#0C0E12]/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Powering the finances and digital identities of top teams & solopreneurs
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-ticker whitespace-nowrap items-center gap-12 sm:gap-16 py-2">
          {brands.concat(brands).map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
              <span className="text-sm font-bold tracking-wider font-mono">
                {brand.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
