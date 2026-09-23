import React from 'react';

export const MakroTestimonials: React.FC = () => {
  const testimonials = [
    {
      quote:
        "CHIPNG replaced four distinct SaaS subscriptions for our boutique studio. Cash forecasting is razor-sharp, and handing over an NFC card at conferences closes deals right at the booth.",
      author: 'Amara Nwosu',
      role: 'Founding Partner',
      company: 'Studio Kora Architecture',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      metric: '+185% Inbound Retainers in 4 Months',
    },
    {
      quote:
        "I was constantly running out of cash buffers because of 60-day invoice lags. CHIPNG's AI predicted the shortfalls 3 weeks in advance and automated client milestone follow-ups.",
      author: 'David Adebayo',
      role: 'Principal Engineer & Consultant',
      company: 'Adebayo Technical Systems',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      metric: '$62,000 Cash Deficit Avoided',
    },
    {
      quote:
        "Every executive meeting I attend starts with an NFC tap. The interface is breathtakingly fast. Clients immediately comment on how sleek the digital card looks.",
      author: 'Elena Rostova',
      role: 'Venture Partner',
      company: 'Ascent Horizons Fund',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      metric: '44% Direct Calendar Conversion',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Trusted Social Proof
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Loved by founders who refuse to compromise.
          </h2>
        </div>

        {/* Testimonials Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="inline-block text-[11px] font-mono font-semibold text-[#84A900] dark:text-[#D2F843] bg-neutral-100 dark:bg-neutral-800/90 px-2.5 py-1 rounded-full">
                  {t.metric}
                </div>
                <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">
                    {t.author}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
