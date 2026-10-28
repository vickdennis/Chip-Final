import React from 'react';

/**
 * World-famous official SVG Logo for DHL Express Logistics
 * Features iconic DHL Yellow (#FFCC00), DHL Red (#D40511), and dynamic speed stripes
 */
export function DhlLogisticsLogo({ className = 'h-6' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 160 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="DHL Express Logistics"
      >
        {/* Iconic DHL Yellow Badge */}
        <rect width="160" height="40" rx="8" fill="#FFCC00" />
        <rect x="0.5" y="0.5" width="159" height="39" rx="7.5" stroke="#D40511" strokeOpacity="0.2" />

        {/* Left DHL Speed Stripes */}
        <path d="M12 14H24L20 18H8L12 14Z" fill="#D40511" />
        <path d="M7 20H22L18 24H3L7 20Z" fill="#D40511" />
        <path d="M16 26H28L24 30H12L16 26Z" fill="#D40511" />

        {/* The World-Famous DHL Bold Slanted Wordmark */}
        {/* Letter 'D' */}
        <path
          d="M32 12H44C49.5 12 52.5 15.5 50.5 21C48.5 26.5 44 29 38.5 29H26.5L32 12ZM35.5 24H39C42 24 44.5 22.5 45.5 19.5C46.5 16.5 45 15.5 42 15.5H38.5L35.5 24Z"
          fill="#D40511"
        />

        {/* Letter 'H' */}
        <path
          d="M52 12H58L55.5 18.5H63.5L66 12H72L65.5 29H59.5L62 22.5H54L51.5 29H45.5L52 12Z"
          fill="#D40511"
        />

        {/* Letter 'L' */}
        <path
          d="M73 12H79L74.5 24H86L84.5 29H68L73 12Z"
          fill="#D40511"
        />

        {/* Right DHL Speed Stripes */}
        <path d="M89 14H102L98 18H85L89 14Z" fill="#D40511" />
        <path d="M86 20H100L96 24H82L86 20Z" fill="#D40511" />
        <path d="M93 26H107L103 30H89L93 26Z" fill="#D40511" />

        {/* EXPRESS Tagline */}
        <text
          x="110"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="9.5"
          fontStyle="italic"
          letterSpacing="0.8px"
          fill="#D40511"
        >
          EXPRESS
        </text>
        <text
          x="110"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="5.5"
          letterSpacing="1px"
          fill="#7A0009"
        >
          WORLDWIDE
        </text>
      </svg>
    </div>
  );
}

/**
 * Backward compatibility alias for DhlLogisticsLogo
 */
export const GhlLogisticsLogo = DhlLogisticsLogo;

/**
 * High-definition authentic SVG Logo for GIG Logistics (GIGL - Nigeria's leading courier)
 * Features signature Navy Blue, vibrant GIG Orange (#FF5500), and speed chevron
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
        <rect width="170" height="40" rx="8" fill="#0A1931" />
        <rect x="0.5" y="0.5" width="169" height="39" rx="7.5" stroke="#FF5500" strokeOpacity="0.4" />

        {/* GIG Iconic Speed Emblem Disc with dual chevron */}
        <circle cx="21" cy="20" r="13" fill="#12284C" stroke="#FF5500" strokeWidth="1.8" />
        {/* First chevron */}
        <path
          d="M15 15L20 20L15 25"
          stroke="#FF5500"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Second chevron */}
        <path
          d="M20 15L25 20L20 25"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* GIG Bold Text */}
        <text
          x="39"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="17"
          letterSpacing="0.8px"
          fill="#FFFFFF"
        >
          GIG
        </text>

        {/* Divider dot */}
        <circle cx="79" cy="19" r="2.2" fill="#FF5500" />

        {/* LOGISTICS */}
        <text
          x="86"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="12"
          letterSpacing="1px"
          fill="#FF5500"
        >
          LOGISTICS
        </text>

        {/* Nationwide Delivery Tag */}
        <text
          x="39"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="6.5"
          letterSpacing="0.8px"
          fill="#94A3B8"
        >
          NIGERIA &bull; 36 STATES DOORSTEP
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
        <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
          <DhlLogisticsLogo className="h-8 w-full" />
        </div>
        <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
          <GigLogisticsLogo className="h-8 w-full" />
        </div>
      </div>

      <p className="text-[10px] text-white/50 leading-tight text-center">
        Real-time tracking number issued via SMS & WhatsApp immediately upon Lagos workshop dispatch.
      </p>
    </div>
  );
}
