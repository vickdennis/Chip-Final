import React from 'react';

/**
 * High-definition SVG Logo for GHL (Global Haulage / GHL Express Logistics)
 */
export function GhlLogisticsLogo({ className = 'h-6' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 160 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="GHL Logistics"
      >
        {/* Background shield/pill badge */}
        <rect width="160" height="40" rx="8" fill="#0D111A" />
        <rect x="0.5" y="0.5" width="159" height="39" rx="7.5" stroke="#E21836" strokeOpacity="0.3" />

        {/* Dynamic Logistics Wings/Arrows */}
        <path
          d="M12 26L22 14L32 26H26L22 20L18 26H12Z"
          fill="#FFCC00"
        />
        <path
          d="M18 29L22 23L26 29H18Z"
          fill="#E21836"
        />

        {/* GHL Bold Wordmark */}
        <text
          x="38"
          y="24"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="17"
          fontStyle="italic"
          letterSpacing="0.5px"
          fill="#FFFFFF"
        >
          GHL
        </text>
        
        {/* Fast delivery underline bar */}
        <rect x="38" y="27" width="37" height="2.5" rx="1" fill="#E21836" />
        <rect x="76" y="27" width="12" height="2.5" rx="1" fill="#FFCC00" />

        {/* Subtitle */}
        <text
          x="82"
          y="19"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="7.5"
          letterSpacing="1px"
          fill="#E21836"
        >
          EXPRESS
        </text>
        <text
          x="82"
          y="26"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="6.5"
          letterSpacing="0.8px"
          fill="#94A3B8"
        >
          LOGISTICS
        </text>
      </svg>
    </div>
  );
}

/**
 * High-definition SVG Logo for GIG Logistics (GIGL - Nigeria's leading courier)
 */
export function GigLogisticsLogo({ className = 'h-6' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 170 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="GIG Logistics"
      >
        {/* Background badge */}
        <rect width="170" height="40" rx="8" fill="#0D111A" />
        <rect x="0.5" y="0.5" width="169" height="39" rx="7.5" stroke="#FF5E14" strokeOpacity="0.3" />

        {/* GIG Iconic Speed Emblem */}
        <circle cx="22" cy="20" r="12" fill="#0B1E48" stroke="#FF5E14" strokeWidth="2" />
        <path
          d="M17 17L23 20L17 23"
          stroke="#FF5E14"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 15L27 20L21 25"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* GIG Text */}
        <text
          x="40"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="17"
          letterSpacing="0.5px"
          fill="#FFFFFF"
        >
          GIG
        </text>

        {/* Divider dot */}
        <circle cx="80" cy="19" r="2" fill="#FF5E14" />

        {/* LOGISTICS */}
        <text
          x="87"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="11.5"
          letterSpacing="1.2px"
          fill="#FF5E14"
        >
          LOGISTICS
        </text>

        {/* Nationwide Delivery Tag */}
        <text
          x="40"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
          fontSize="6.5"
          letterSpacing="0.8px"
          fill="#94A3B8"
        >
          NIGERIA &bull; 36 STATES COURIER
        </text>
      </svg>
    </div>
  );
}

/**
 * Combined Logistics Partner Assurance Badge for Checkout
 */
export function LogisticsTrustBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Official Insured Logistics Partners
        </span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Doorstep Delivery
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
          <GhlLogisticsLogo className="h-8 w-full" />
        </div>
        <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
          <GigLogisticsLogo className="h-8 w-full" />
        </div>
      </div>

      <p className="text-[10px] text-white/50 leading-tight text-center">
        Real-time tracking number issued via SMS & WhatsApp immediately upon Lagos workshop dispatch.
      </p>
    </div>
  );
}
