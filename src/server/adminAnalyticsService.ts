export interface AppDownloadDailyPoint {
  date: string;
  label: string;
  total: number;
  ios: number;
  android: number;
  apk: number;
  pwa: number;
}

export interface RealAppDownloadAnalytics {
  totalDownloads: number;
  byPlatform: {
    ios: number;
    android: number;
    apk: number;
    pwa: number;
  };
  byDevice: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  dailyTrends: AppDownloadDailyPoint[];
  topLocations: Array<{ city: string; count: number; percent: number }>;
  topDevices: Array<{ device: string; count: number; percent: number }>;
  recentDownloads: Array<{
    id: string | number;
    platform: 'ios' | 'android' | 'apk' | 'pwa';
    device_type: string;
    version: string;
    city: string;
    country: string;
    created_at: string;
  }>;
  avgPerDay: number;
  conversionRate: number;
}

export interface SuperAdminAnalyticsPayload {
  generatedAt: string;
  users: {
    total: number;
    verified: number;
    admins: number;
    proOrEnterprise: number;
    newLast7Days: number;
    newLast30Days: number;
    enterprises: number;
    enterpriseSeats: number;
    signups7d: Array<{ date: string; label: string; count: number }>;
  };
  revenue: {
    grossTotalNgn: number;
    nfcConfirmedNgn: number;
    digitalShopNgn: number;
    themeSalesNgn: number;
    verificationNgn: number;
    platformNetFeesNgn: number;
    nfcConfirmedOrders: number;
    nfcPendingOrders: number;
    nfcFailedOrders: number;
    nfcTotalOrders: number;
    nfcAvgOrderValueNgn: number;
    digitalShopOrders: number;
    themeOrders: number;
    verificationOrders: number;
    totalConfirmedOrders: number;
    recentTransactions: Array<{
      id: string;
      reference: string;
      customerName: string;
      customerEmail: string;
      category: 'nfc_card' | 'digital_product' | 'theme' | 'verification';
      label: string;
      amountNgn: number;
      status: string;
      createdAt: string;
    }>;
  };
  traffic: {
    totalProfileViews: number;
    profileViewsLast7Days: number;
    nfcTaps: number;
    qrScans: number;
    webViews: number;
    totalLinkClicks: number;
    ctr: number;
    topProfiles: Array<{
      profileId: string;
      fullName: string;
      username: string;
      views: number;
    }>;
  };
  blog: {
    totalViews: number;
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    topPosts: Array<{
      id: string;
      title: string;
      slug: string;
      views: number;
      isPublished: boolean;
    }>;
  };
  leads: {
    totalCrmLeads: number;
    directInquiries: number;
    unreadInquiries: number;
    profileLeads: number;
    funnelLeads: number;
    onboardingSubmissions: number;
  };
  appDownloads: RealAppDownloadAnalytics;
  catalog: {
    storeProductsCount: number;
  };
}

function safeDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const str = String(value).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
    const d = new Date(str.replace(' ', 'T') + 'Z');
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function getLastNDaysBuckets(days: number): Array<{ key: string; label: string }> {
  const out: Array<{ key: string; label: string }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    out.push({
      key: `${yyyy}-${mm}-${dd}`,
      label: `${mm}-${dd}`,
    });
  }
  return out;
}

function toDayKey(value: unknown): string | null {
  const d = safeDate(value);
  if (!d) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function normalizePaymentStatus(rawStatus: unknown): 'successful' | 'pending' | 'failed' {
  const st = String(rawStatus || '').toLowerCase().trim();
  if (
    st === 'successful' ||
    st === 'completed' ||
    st === 'paid' ||
    st === 'success' ||
    st.startsWith('expires_')
  ) {
    return 'successful';
  }
  if (st === 'pending' || st === 'under_verification' || st === 'processing') {
    return 'pending';
  }
  if (st === 'failed' || st === 'cancelled' || st === 'canceled' || st === 'refunded') {
    return 'failed';
  }
  // Legacy records without status default to successful only if they exist as completed historical rows
  return st === '' ? 'successful' : 'pending';
}

export function parseViewSourceFromViewerIp(viewerIp?: string | null): 'nfc' | 'qr' | 'web' {
  const raw = String(viewerIp || '').toLowerCase();
  if (raw.startsWith('src:nfc|') || raw === 'nfc') return 'nfc';
  if (raw.startsWith('src:qr|') || raw === 'qr') return 'qr';
  return 'web';
}

export function formatViewerIpWithSource(source: string, ip: string): string {
  const cleanSource = ['nfc', 'qr', 'web'].includes(String(source || '').toLowerCase())
    ? String(source).toLowerCase()
    : 'web';
  const cleanIp = String(ip || '').slice(0, 64);
  return `src:${cleanSource}|ip:${cleanIp}`;
}

/**
 * Computes 100% real mobile app download analytics from Supabase (`leads` where source ilike 'app_download%')
 * merged with local SQLite (`app_downloads`) when running on Node.
 */
export async function getRealAppDownloadsAnalytics(deps: {
  supabase?: any;
  db?: any;
  totalProfileViews?: number;
}): Promise<RealAppDownloadAnalytics> {
  interface NormalizedDownload {
    id: string;
    platform: 'ios' | 'android' | 'apk' | 'pwa';
    device_type: string;
    version: string;
    city: string;
    country: string;
    created_at: string;
    dedupeKey: string;
  }

  const eventsByKey = new Map<string, NormalizedDownload>();

  const normalizePlatform = (val: unknown): 'ios' | 'android' | 'apk' | 'pwa' => {
    const p = String(val || '').toLowerCase().trim();
    if (p === 'ios' || p === 'android' || p === 'apk' || p === 'pwa') return p;
    return 'android';
  };

  const normalizeDeviceBucket = (raw: string): 'mobile' | 'tablet' | 'desktop' => {
    const d = raw.toLowerCase();
    if (d.includes('ipad') || d.includes('tablet')) return 'tablet';
    if (d.includes('desktop') || d.includes('mac') || d.includes('windows') || d.includes('linux')) return 'desktop';
    return 'mobile';
  };

  // 1. Query Supabase `leads` for real app download events
  if (deps.supabase) {
    try {
      const { data: dbLeads } = await deps.supabase
        .from('leads')
        .select('id, name, city, source, created_at')
        .ilike('source', 'app_download%')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (Array.isArray(dbLeads)) {
        for (const dl of dbLeads) {
          let parsedMeta: any = {};
          if (dl.city && typeof dl.city === 'string' && dl.city.startsWith('{')) {
            try {
              parsedMeta = JSON.parse(dl.city);
            } catch {
              parsedMeta = {};
            }
          }
          const platform = normalizePlatform(
            String(dl.source || '').replace(/^app_download_/i, '') || parsedMeta.platform
          );
          const deviceType = String(parsedMeta.device || 'mobile').trim() || 'mobile';
          const city = String(
            parsedMeta.city ||
              (typeof dl.city === 'string' && !dl.city.startsWith('{') ? dl.city : '') ||
              'Lagos'
          ).trim();
          const version = String(parsedMeta.version || '2.4.0').trim();
          const createdAt = dl.created_at || new Date().toISOString();
          const secStamp = Math.floor((safeDate(createdAt)?.getTime() || 0) / 5000);
          const dedupeKey = `sp_${dl.id || `${platform}_${secStamp}`}`;
          eventsByKey.set(dedupeKey, {
            id: String(dl.id || dedupeKey),
            platform,
            device_type: deviceType,
            version,
            city,
            country: 'Nigeria',
            created_at: createdAt,
            dedupeKey: `${platform}_${secStamp}`,
          });
        }
      }
    } catch {
      // Supabase leads unavailable
    }
  }

  // 2. Merge local SQLite `app_downloads` (deduplicating against Supabase writes made in the same 5-second window)
  if (deps.db) {
    try {
      const existingWindowKeys = new Set(Array.from(eventsByKey.values()).map((e) => e.dedupeKey));
      const sqliteRows = deps.db
        .prepare(
          `SELECT id, platform, device_type, version, city, country, created_at
           FROM app_downloads
           ORDER BY created_at DESC
           LIMIT 1000`
        )
        .all() as any[];

      for (const r of sqliteRows) {
        const platform = normalizePlatform(r.platform);
        const createdAt = r.created_at || new Date().toISOString();
        const secStamp = Math.floor((safeDate(createdAt)?.getTime() || 0) / 5000);
        const windowKey = `${platform}_${secStamp}`;
        if (existingWindowKeys.has(windowKey)) continue;
        existingWindowKeys.add(windowKey);
        const idKey = `sqlite_${r.id}`;
        eventsByKey.set(idKey, {
          id: idKey,
          platform,
          device_type: String(r.device_type || 'mobile').trim() || 'mobile',
          version: String(r.version || '2.4.0').trim(),
          city: String(r.city || 'Lagos').trim(),
          country: String(r.country || 'Nigeria').trim(),
          created_at: createdAt,
          dedupeKey: windowKey,
        });
      }
    } catch {
      // SQLite app_downloads table unavailable
    }
  }

  const allEvents = Array.from(eventsByKey.values()).sort(
    (a, b) => (safeDate(b.created_at)?.getTime() || 0) - (safeDate(a.created_at)?.getTime() || 0)
  );

  const byPlatform = { ios: 0, android: 0, apk: 0, pwa: 0 };
  const byDevice = { mobile: 0, tablet: 0, desktop: 0 };
  const cityCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();

  const buckets = getLastNDaysBuckets(7);
  const trendMap = new Map<string, AppDownloadDailyPoint>();
  for (const b of buckets) {
    trendMap.set(b.key, {
      date: b.label,
      label: b.label,
      total: 0,
      ios: 0,
      android: 0,
      apk: 0,
      pwa: 0,
    });
  }

  for (const ev of allEvents) {
    byPlatform[ev.platform] += 1;
    const devBucket = normalizeDeviceBucket(ev.device_type);
    byDevice[devBucket] += 1;

    const cityLabel = ev.city || 'Lagos';
    cityCounts.set(cityLabel, (cityCounts.get(cityLabel) || 0) + 1);

    const devLabel = ev.device_type || 'Mobile';
    deviceCounts.set(devLabel, (deviceCounts.get(devLabel) || 0) + 1);

    const dayKey = toDayKey(ev.created_at);
    if (dayKey && trendMap.has(dayKey)) {
      const point = trendMap.get(dayKey)!;
      point.total += 1;
      point[ev.platform] += 1;
    }
  }

  const totalDownloads = allEvents.length;
  const dailyTrends = buckets.map((b) => trendMap.get(b.key)!);
  const last7Total = dailyTrends.reduce((sum, p) => sum + p.total, 0);
  const avgPerDay = parseFloat((last7Total / 7).toFixed(1));

  const topLocations = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({
      city,
      count,
      percent: totalDownloads > 0 ? Math.round((count / totalDownloads) * 100) : 0,
    }));

  const topDevices = Array.from(deviceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([device, count]) => ({
      device,
      count,
      percent: totalDownloads > 0 ? Math.round((count / totalDownloads) * 100) : 0,
    }));

  const viewsDenominator = Number(deps.totalProfileViews || 0);
  const conversionRate =
    viewsDenominator > 0 && totalDownloads > 0
      ? parseFloat(Math.min(100, (totalDownloads / viewsDenominator) * 100).toFixed(1))
      : 0;

  return {
    totalDownloads,
    byPlatform,
    byDevice,
    dailyTrends,
    topLocations,
    topDevices,
    recentDownloads: allEvents.slice(0, 50).map(({ dedupeKey: _dk, ...rest }) => rest),
    avgPerDay,
    conversionRate,
  };
}

/**
 * Authoritative Super Admin Analytics aggregator combining Supabase + SQLite cleanly.
 */
export async function getSuperAdminAnalytics(deps: {
  supabase: any;
  db?: any;
}): Promise<SuperAdminAnalyticsPayload> {
  const { supabase, db } = deps;
  const nowMs = Date.now();
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;

  // Fetch all core Supabase tables in parallel with graceful per-table fallbacks
  const [
    profilesRes,
    enterprisesRes,
    productsRes,
    purchasesRes,
    nfcOrdersRes,
    postsRes,
    blogViewsRes,
    profileViewsRes,
    leadsRes,
    funnelLeadsRes,
    onboardingRes,
  ] = await Promise.all([
    Promise.resolve(
      supabase
        .from('profiles')
        .select('id, full_name, username, is_verified, is_admin, enterprise_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5000)
    ).catch(() => ({ data: null })),
    Promise.resolve(supabase.from('enterprises').select('id, name, total_seats')).catch(() => ({ data: null })),
    Promise.resolve(supabase.from('products').select('id, name').is('profile_id', null)).catch(() => ({ data: null })),
    Promise.resolve(
      supabase.from('purchases').select('*').order('created_at', { ascending: false }).limit(2000)
    ).catch(() => ({ data: null })),
    Promise.resolve(
      supabase.from('nfc_orders').select('*').order('created_at', { ascending: false }).limit(1000)
    ).catch(() => ({ data: null })),
    Promise.resolve(
      supabase
        .from('posts')
        .select('id, title, slug, is_published, views, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
    ).catch(() => ({ data: null })),
    Promise.resolve(
      supabase.from('blog_views').select('id, post_id, created_at').limit(10000)
    ).catch(() => ({ data: null })),
    Promise.resolve(
      supabase.from('profile_views').select('id, profile_id, viewer_ip, created_at').limit(10000)
    ).catch(() => ({ data: null })),
    Promise.resolve(
      supabase
        .from('leads')
        .select('id, name, whatsapp, email, city, company, message, post_slug, source, status, created_at')
        .order('created_at', { ascending: false })
        .limit(2000)
    ).catch(() => ({ data: null })),
    Promise.resolve(
      supabase.from('card_funnel_leads').select('id', { count: 'exact', head: true })
    ).catch(() => ({ count: 0 })),
    Promise.resolve(
      supabase.from('onboarding_submissions').select('id', { count: 'exact', head: true })
    ).catch(() => ({ count: 0 })),
  ]);

  const profiles: any[] = Array.isArray(profilesRes?.data) ? profilesRes.data : [];
  const enterprises: any[] = Array.isArray(enterprisesRes?.data) ? enterprisesRes.data : [];
  const storeProducts: any[] = Array.isArray(productsRes?.data) ? productsRes.data : [];
  const purchases: any[] = Array.isArray(purchasesRes?.data) ? purchasesRes.data : [];
  const supabaseNfcOrders: any[] = Array.isArray(nfcOrdersRes?.data) ? nfcOrdersRes.data : [];
  const posts: any[] = Array.isArray(postsRes?.data) ? postsRes.data : [];
  const blogViewRows: any[] = Array.isArray(blogViewsRes?.data) ? blogViewsRes.data : [];
  const profileViewRows: any[] = Array.isArray(profileViewsRes?.data) ? profileViewsRes.data : [];
  const allLeads: any[] = Array.isArray(leadsRes?.data) ? leadsRes.data : [];

  // --- 1. Users & Growth ---
  const profileById = new Map<string, any>();
  const signupBuckets = getLastNDaysBuckets(7);
  const signupDayMap = new Map<string, number>();
  for (const b of signupBuckets) signupDayMap.set(b.key, 0);

  let verifiedUsers = 0;
  let adminUsers = 0;
  let proOrEnterpriseUsers = 0;
  let newLast7Days = 0;
  let newLast30Days = 0;

  for (const u of profiles) {
    if (!u) continue;
    if (u.id) profileById.set(String(u.id), u);
    if (u.username) profileById.set(String(u.username).toLowerCase(), u);
    if (u.is_verified) verifiedUsers += 1;
    if (u.is_admin) adminUsers += 1;
    if (u.is_pro || u.enterprise_id) proOrEnterpriseUsers += 1;

    const createdMs = safeDate(u.created_at)?.getTime() || 0;
    if (createdMs >= sevenDaysAgoMs) newLast7Days += 1;
    if (createdMs >= thirtyDaysAgoMs) newLast30Days += 1;

    const dayKey = toDayKey(u.created_at);
    if (dayKey && signupDayMap.has(dayKey)) {
      signupDayMap.set(dayKey, (signupDayMap.get(dayKey) || 0) + 1);
    }
  }

  const enterpriseSeats = enterprises.reduce((sum, e) => sum + Number(e?.total_seats || 0), 0);

  // --- 2. NFC Hardware Sales (deduplicated identically to /api/sales) ---
  interface NormalizedOrder {
    id: string;
    reference: string;
    customerName: string;
    customerEmail: string;
    label: string;
    amountNgn: number;
    status: 'successful' | 'pending' | 'failed';
    createdAt: string;
  }

  const nfcOrdersByRef = new Map<string, NormalizedOrder>();

  for (const o of supabaseNfcOrders) {
    const ref = String(o.tx_ref || o.order_number || o.id || '');
    if (!ref) continue;
    nfcOrdersByRef.set(ref, {
      id: String(o.id || o.order_number || ref),
      reference: ref,
      customerName: String(o.customer_name || 'CHIPNG Buyer'),
      customerEmail: String(o.customer_email || ''),
      label: `${o.product_name || 'NFC Smart Card'}${Number(o.quantity) > 1 ? ` × ${o.quantity}` : ''}`,
      amountNgn: Number(o.total_amount_ngn || 0),
      status: normalizePaymentStatus(o.payment_status),
      createdAt: o.created_at || new Date().toISOString(),
    });
  }

  if (db) {
    try {
      const localOrders = db.prepare('SELECT * FROM nfc_orders ORDER BY created_at DESC LIMIT 500').all() as any[];
      for (const o of localOrders) {
        const ref = String(o.tx_ref || o.order_number || '');
        if (!ref || nfcOrdersByRef.has(ref)) continue;
        nfcOrdersByRef.set(ref, {
          id: String(o.order_number || ref),
          reference: ref,
          customerName: String(o.customer_name || 'CHIPNG Buyer'),
          customerEmail: String(o.customer_email || ''),
          label: `${o.product_name || 'NFC Smart Card'}${Number(o.quantity) > 1 ? ` × ${o.quantity}` : ''}`,
          amountNgn: Number(o.total_amount_ngn || 0),
          status: normalizePaymentStatus(o.payment_status),
          createdAt: o.created_at || new Date().toISOString(),
        });
      }
    } catch {}

    try {
      const legacySales = db.prepare('SELECT * FROM nfc_sales ORDER BY created_at DESC LIMIT 500').all() as any[];
      for (const s of legacySales) {
        const ref = String(s.payment_reference || `LEGACY-${s.id}`);
        if (nfcOrdersByRef.has(ref)) continue;
        nfcOrdersByRef.set(ref, {
          id: `legacy-${s.id}`,
          reference: ref,
          customerName: String(s.name || 'CHIPNG Buyer'),
          customerEmail: String(s.email || ''),
          label: String(s.card_type || 'NFC Smart Card'),
          amountNgn: Number(s.amount || 0),
          status: 'successful',
          createdAt: s.created_at || new Date().toISOString(),
        });
      }
    } catch {}
  }

  // Merge historical NFC purchases from `purchases` table without double-counting
  for (const p of purchases) {
    if (!p) continue;
    const pType = String(p.purchase_type || '').toLowerCase();
    if (pType !== 'nfc_card') continue;
    const ref = String(p.reference || `PURCHASE-${p.id}`);
    if (nfcOrdersByRef.has(ref)) continue;
    nfcOrdersByRef.set(ref, {
      id: `purchase-${p.id}`,
      reference: ref,
      customerName: String(p.buyer_email || '').split('@')[0] || 'CHIPNG Buyer',
      customerEmail: String(p.buyer_email || ''),
      label: 'NFC Smart Card',
      amountNgn: Number(p.amount || 0),
      status: normalizePaymentStatus(p.status),
      createdAt: p.created_at || new Date().toISOString(),
    });
  }

  const allNfcOrders = Array.from(nfcOrdersByRef.values());
  const confirmedNfcOrders = allNfcOrders.filter((o) => o.status === 'successful' && o.amountNgn > 0);
  const pendingNfcOrders = allNfcOrders.filter((o) => o.status === 'pending');
  const failedNfcOrders = allNfcOrders.filter((o) => o.status === 'failed');

  const nfcConfirmedNgn = confirmedNfcOrders.reduce((sum, o) => sum + o.amountNgn, 0);
  const nfcAvgOrderValueNgn =
    confirmedNfcOrders.length > 0 ? Math.round(nfcConfirmedNgn / confirmedNfcOrders.length) : 0;

  // --- 3. Digital Shop, Themes & Verifications from `purchases` ---
  let digitalShopNgn = 0;
  let digitalShopOrders = 0;
  let digitalShopFeesNgn = 0;
  let themeSalesNgn = 0;
  let themeOrders = 0;
  let verificationNgn = 0;
  let verificationOrders = 0;

  const recentTransactions: SuperAdminAnalyticsPayload['revenue']['recentTransactions'] = [];

  for (const o of confirmedNfcOrders) {
    recentTransactions.push({
      id: o.id,
      reference: o.reference,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      category: 'nfc_card',
      label: o.label,
      amountNgn: o.amountNgn,
      status: 'successful',
      createdAt: o.createdAt,
    });
  }

  for (const p of purchases) {
    if (!p) continue;
    const pType = String(p.purchase_type || 'digital_product').toLowerCase();
    if (pType === 'nfc_card') continue; // Already counted in NFC Hardware Sales

    const status = normalizePaymentStatus(p.status);
    const amount = Number(p.amount || 0);
    if (status !== 'successful' || amount <= 0) continue;

    if (pType === 'theme') {
      themeSalesNgn += amount;
      themeOrders += 1;
      recentTransactions.push({
        id: String(p.id),
        reference: String(p.reference || ''),
        customerName: String(p.buyer_email || '').split('@')[0] || 'Member',
        customerEmail: String(p.buyer_email || ''),
        category: 'theme',
        label: 'Premium Profile Theme',
        amountNgn: amount,
        status: 'successful',
        createdAt: p.created_at || new Date().toISOString(),
      });
    } else if (pType === 'verification') {
      const feeOrAmount = Number(p.platform_fee || amount || 0);
      verificationNgn += feeOrAmount;
      verificationOrders += 1;
      recentTransactions.push({
        id: String(p.id),
        reference: String(p.reference || ''),
        customerName: String(p.buyer_email || '').split('@')[0] || 'Member',
        customerEmail: String(p.buyer_email || ''),
        category: 'verification',
        label: 'Verified Badge Subscription',
        amountNgn: feeOrAmount,
        status: 'successful',
        createdAt: p.created_at || new Date().toISOString(),
      });
    } else {
      digitalShopNgn += amount;
      digitalShopOrders += 1;
      const fee = Number(p.platform_fee || 0) > 0 ? Number(p.platform_fee) : Math.round(amount * 0.05);
      digitalShopFeesNgn += fee;
      recentTransactions.push({
        id: String(p.id),
        reference: String(p.reference || ''),
        customerName: String(p.buyer_email || '').split('@')[0] || 'Buyer',
        customerEmail: String(p.buyer_email || ''),
        category: 'digital_product',
        label: 'Digital Store Purchase',
        amountNgn: amount,
        status: 'successful',
        createdAt: p.created_at || new Date().toISOString(),
      });
    }
  }

  recentTransactions.sort(
    (a, b) => (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0)
  );

  const platformNetFeesNgn = digitalShopFeesNgn + themeSalesNgn + verificationNgn;
  const grossTotalNgn = nfcConfirmedNgn + digitalShopNgn + themeSalesNgn + verificationNgn;
  const totalConfirmedOrders =
    confirmedNfcOrders.length + digitalShopOrders + themeOrders + verificationOrders;

  // --- 4. Profile Traffic (Views, NFC Taps, QR Scans, Link Clicks) ---
  let spViewsTotal = profileViewRows.length;
  let spViews7d = 0;
  let spNfcTaps = 0;
  let spQrScans = 0;
  let spWebViews = 0;
  const spProfileCounts = new Map<string, number>();

  for (const row of profileViewRows) {
    const src = parseViewSourceFromViewerIp(row.viewer_ip);
    if (src === 'nfc') spNfcTaps += 1;
    else if (src === 'qr') spQrScans += 1;
    else spWebViews += 1;

    const ts = safeDate(row.created_at)?.getTime() || 0;
    if (ts >= sevenDaysAgoMs) spViews7d += 1;

    if (row.profile_id) {
      const pid = String(row.profile_id);
      spProfileCounts.set(pid, (spProfileCounts.get(pid) || 0) + 1);
    }
  }

  let sqliteViewsTotal = 0;
  let sqliteViews7d = 0;
  let sqliteNfcTaps = 0;
  let sqliteQrScans = 0;
  let sqliteWebViews = 0;
  let totalLinkClicks = 0;
  const sqliteProfileCounts = new Map<string, number>();

  if (db) {
    try {
      sqliteViewsTotal =
        (db.prepare('SELECT COUNT(*) as c FROM profile_analytics_views').get() as any)?.c || 0;
      const sevenDaysIso = new Date(sevenDaysAgoMs).toISOString();
      sqliteViews7d =
        (
          db
            .prepare('SELECT COUNT(*) as c FROM profile_analytics_views WHERE created_at >= ?')
            .get(sevenDaysIso) as any
        )?.c || 0;

      const srcRows = db
        .prepare('SELECT LOWER(source) as source, COUNT(*) as c FROM profile_analytics_views GROUP BY LOWER(source)')
        .all() as any[];
      for (const r of srcRows) {
        if (r.source === 'nfc') sqliteNfcTaps += Number(r.c || 0);
        else if (r.source === 'qr') sqliteQrScans += Number(r.c || 0);
        else sqliteWebViews += Number(r.c || 0);
      }

      const topSqliteRows = db
        .prepare(
          'SELECT profile_id, COUNT(*) as c FROM profile_analytics_views GROUP BY profile_id ORDER BY c DESC LIMIT 20'
        )
        .all() as any[];
      for (const r of topSqliteRows) {
        if (r.profile_id) sqliteProfileCounts.set(String(r.profile_id), Number(r.c || 0));
      }

      totalLinkClicks =
        (db.prepare('SELECT COUNT(*) as c FROM profile_analytics_clicks').get() as any)?.c || 0;
    } catch {}
  }

  const totalProfileViews = Math.max(spViewsTotal, sqliteViewsTotal);
  const profileViewsLast7Days = Math.max(spViews7d, sqliteViews7d);
  const nfcTaps = Math.max(spNfcTaps, sqliteNfcTaps);
  const qrScans = Math.max(spQrScans, sqliteQrScans);
  const webViews = Math.max(spWebViews, sqliteWebViews, Math.max(0, totalProfileViews - nfcTaps - qrScans));

  // Merge top profile counts (taking max per profile so dual-writes never double-count)
  const mergedProfileCounts = new Map<string, number>();
  for (const [pid, count] of spProfileCounts.entries()) {
    mergedProfileCounts.set(pid, Math.max(mergedProfileCounts.get(pid) || 0, count));
  }
  for (const [pid, count] of sqliteProfileCounts.entries()) {
    const matched = profileById.get(pid) || profileById.get(pid.toLowerCase());
    const canonicalId = matched?.id ? String(matched.id) : pid;
    mergedProfileCounts.set(canonicalId, Math.max(mergedProfileCounts.get(canonicalId) || 0, count));
  }

  const topProfiles = Array.from(mergedProfileCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pid, views]) => {
      const p = profileById.get(pid) || profileById.get(pid.toLowerCase());
      return {
        profileId: pid,
        fullName: p?.full_name || p?.username || 'CHIP Member',
        username: p?.username || '',
        views,
      };
    });

  const ctr =
    totalProfileViews > 0 && totalLinkClicks > 0
      ? parseFloat(((totalLinkClicks / totalProfileViews) * 100).toFixed(1))
      : 0;

  // --- 5. Blog Analytics (Combining `blog_views`, `posts.views`, and SQLite `post_meta.views`) ---
  const blogViewsByPostId = new Map<string, number>();
  for (const bv of blogViewRows) {
    if (bv?.post_id) {
      const id = String(bv.post_id);
      blogViewsByPostId.set(id, (blogViewsByPostId.get(id) || 0) + 1);
    }
  }

  const sqlitePostViewsBySlug = new Map<string, number>();
  let sqlitePostMetaTotalViews = 0;
  if (db) {
    try {
      const metaRows = db.prepare('SELECT post_slug, views FROM post_meta').all() as any[];
      for (const m of metaRows) {
        const v = Number(m.views || 0);
        if (m.post_slug) sqlitePostViewsBySlug.set(String(m.post_slug), v);
        sqlitePostMetaTotalViews += v;
      }
    } catch {}
  }

  let sumMergedPostViews = 0;
  const enrichedPosts = posts.map((post) => {
    const tableViews = blogViewsByPostId.get(String(post.id)) || 0;
    const colViews = Number(post.views || 0);
    const localViews = sqlitePostViewsBySlug.get(String(post.slug)) || 0;
    const effectiveViews = Math.max(tableViews, colViews, localViews);
    sumMergedPostViews += effectiveViews;
    return {
      id: String(post.id),
      title: String(post.title || 'Untitled Article'),
      slug: String(post.slug || ''),
      views: effectiveViews,
      isPublished: Boolean(post.is_published),
    };
  });

  const totalBlogViews = Math.max(blogViewRows.length, sumMergedPostViews, sqlitePostMetaTotalViews);
  const publishedPosts = enrichedPosts.filter((p) => p.isPublished).length;
  const draftPosts = Math.max(0, enrichedPosts.length - publishedPosts);
  const topPosts = [...enrichedPosts].sort((a, b) => b.views - a.views).slice(0, 5);

  // --- 6. Leads & Direct Inquiries (excluding `app_download_*` rows!) ---
  const crmLeads = allLeads.filter((l) => !String(l?.source || '').toLowerCase().startsWith('app_download'));
  let directInquiries = 0;
  let unreadInquiries = 0;
  let profileLeads = 0;

  for (const l of crmLeads) {
    let meta: any = {};
    if (l.city && typeof l.city === 'string' && l.city.startsWith('{')) {
      try {
        meta = JSON.parse(l.city);
      } catch {}
    }
    const msg = String(l.message || meta.message || '');
    const status = String(l.status || meta.status || 'new').toLowerCase();
    const source = String(l.source || meta.source || '').toLowerCase();
    const postSlug = String(l.post_slug || '').toLowerCase();

    const isDirect =
      source === 'direct_inquiry' ||
      source === 'contact_page' ||
      postSlug === 'contact_inquiry' ||
      msg.length > 5;

    if (isDirect) {
      directInquiries += 1;
      if (!status || status === 'new') unreadInquiries += 1;
    } else {
      profileLeads += 1;
    }
  }

  let sqliteFunnelLeads = 0;
  if (db) {
    try {
      sqliteFunnelLeads =
        (db.prepare('SELECT COUNT(*) as c FROM card_funnel_leads').get() as any)?.c || 0;
    } catch {}
  }

  const funnelLeads = Math.max(Number(funnelLeadsRes?.count || 0), sqliteFunnelLeads);
  const onboardingSubmissions = Number(onboardingRes?.count || 0);

  // --- 7. Real App Downloads ---
  const appDownloads = await getRealAppDownloadsAnalytics({
    supabase,
    db,
    totalProfileViews,
  });

  return {
    generatedAt: new Date().toISOString(),
    users: {
      total: profiles.length,
      verified: verifiedUsers,
      admins: adminUsers,
      proOrEnterprise: proOrEnterpriseUsers,
      newLast7Days,
      newLast30Days,
      enterprises: enterprises.length,
      enterpriseSeats,
      signups7d: signupBuckets.map((b) => ({
        date: b.key,
        label: b.label,
        count: signupDayMap.get(b.key) || 0,
      })),
    },
    revenue: {
      grossTotalNgn,
      nfcConfirmedNgn,
      digitalShopNgn,
      themeSalesNgn,
      verificationNgn,
      platformNetFeesNgn,
      nfcConfirmedOrders: confirmedNfcOrders.length,
      nfcPendingOrders: pendingNfcOrders.length,
      nfcFailedOrders: failedNfcOrders.length,
      nfcTotalOrders: allNfcOrders.length,
      nfcAvgOrderValueNgn,
      digitalShopOrders,
      themeOrders,
      verificationOrders,
      totalConfirmedOrders,
      recentTransactions: recentTransactions.slice(0, 10),
    },
    traffic: {
      totalProfileViews,
      profileViewsLast7Days,
      nfcTaps,
      qrScans,
      webViews,
      totalLinkClicks,
      ctr,
      topProfiles,
    },
    blog: {
      totalViews: totalBlogViews,
      totalPosts: enrichedPosts.length,
      publishedPosts,
      draftPosts,
      topPosts,
    },
    leads: {
      totalCrmLeads: crmLeads.length,
      directInquiries,
      unreadInquiries,
      profileLeads,
      funnelLeads,
      onboardingSubmissions,
    },
    appDownloads,
    catalog: {
      storeProductsCount: storeProducts.length,
    },
  };
}
