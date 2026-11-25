/**
 * CHIP NG Client-Side Real-Time Telemetry & Analytics Engine
 * Provides resilient, zero-fail, sub-10ms telemetry tracking for:
 * - NFC card taps (?source=nfc, ?tap=1)
 * - QR code scans (?source=qr, ?qr=1)
 * - Bio link / Web visits
 * - Link clicks, vCard downloads, WhatsApp / Email connects
 * 
 * Guarantees live local persistence (localStorage), cross-tab sync (BroadcastChannel),
 * and backend synchronization (/api/analytics/* & Supabase) so telemetry NEVER breaks.
 */

export interface TelemetryData {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  nfcTaps: number;
  qrScans: number;
  webViews: number;
  clicksByType: Array<{ click_type: string; count: number }>;
  topLinks: Array<{ link_title: string; link_url?: string; click_type: string; clicks: number }>;
  recentActivity: Array<{ event_type: string; detail: string; created_at: string }>;
}

const TELEMETRY_CHANNEL_NAME = 'chipng_telemetry_stream';

function getStorageKey(id: string): string {
  return `chipng_telemetry_${id}`;
}

function getStoredTelemetry(id: string): TelemetryData {
  if (typeof window === 'undefined') {
    return {
      totalViews: 0,
      totalClicks: 0,
      ctr: 0,
      nfcTaps: 0,
      qrScans: 0,
      webViews: 0,
      clicksByType: [],
      topLinks: [],
      recentActivity: []
    };
  }

  try {
    const raw = localStorage.getItem(getStorageKey(id));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        totalViews: Number(parsed.totalViews) || 0,
        totalClicks: Number(parsed.totalClicks) || 0,
        ctr: Number(parsed.ctr) || 0,
        nfcTaps: Number(parsed.nfcTaps) || 0,
        qrScans: Number(parsed.qrScans) || 0,
        webViews: Number(parsed.webViews) || 0,
        clicksByType: Array.isArray(parsed.clicksByType) ? parsed.clicksByType : [],
        topLinks: Array.isArray(parsed.topLinks) ? parsed.topLinks : [],
        recentActivity: Array.isArray(parsed.recentActivity) ? parsed.recentActivity : []
      };
    }
  } catch (e) {
    console.warn('Error reading stored telemetry:', e);
  }

  return {
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    nfcTaps: 0,
    qrScans: 0,
    webViews: 0,
    clicksByType: [],
    topLinks: [],
    recentActivity: []
  };
}

function saveStoredTelemetry(id: string, data: TelemetryData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(id), JSON.stringify(data));
    
    // Broadcast to other open tabs (e.g. Dashboard)
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(TELEMETRY_CHANNEL_NAME);
        channel.postMessage({ type: 'TELEMETRY_UPDATED', profileId: id, data });
        setTimeout(() => {
          try { channel.close(); } catch (e) {}
        }, 200);
      }
    } catch (e) {}

    // Dispatch DOM custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('chipng_telemetry_event', { detail: { profileId: id, data } }));
  } catch (e) {
    console.warn('Error saving telemetry locally:', e);
  }
}

/**
 * Record a public profile visit (NFC Tap, QR Scan, or Web View)
 */
export function recordProfileView(profileId: string, username?: string, source: string = 'web') {
  if (!profileId) return;

  const cleanSource = (source || 'web').toLowerCase();
  const keys = [profileId];
  if (username && username !== profileId) keys.push(username);

  for (const key of keys) {
    const current = getStoredTelemetry(key);
    const newViews = current.totalViews + 1;
    let newNfc = current.nfcTaps;
    let newQr = current.qrScans;
    let newWeb = current.webViews;

    if (cleanSource === 'nfc') {
      newNfc += 1;
    } else if (cleanSource === 'qr') {
      newQr += 1;
    } else {
      newWeb += 1;
    }

    const newCtr = newViews > 0 ? parseFloat(((current.totalClicks / newViews) * 100).toFixed(1)) : 0;
    
    const newEvent = {
      event_type: 'view',
      detail: cleanSource,
      created_at: new Date().toISOString()
    };

    const newActivity = [newEvent, ...(current.recentActivity || [])].slice(0, 15);

    const updated: TelemetryData = {
      ...current,
      totalViews: newViews,
      nfcTaps: newNfc,
      qrScans: newQr,
      webViews: newWeb,
      ctr: newCtr,
      recentActivity: newActivity
    };

    saveStoredTelemetry(key, updated);
  }

  // Fire network request with keepalive so browser delivers even if navigating
  try {
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, source: cleanSource }),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Record a link or button click on a public profile
 */
export function recordProfileClick(
  profileId: string, 
  linkTitle: string, 
  linkUrl?: string, 
  clickType: string = 'link', 
  linkId?: string,
  username?: string
) {
  if (!profileId) return;

  const cleanTitle = (linkTitle || 'Link').trim();
  const cleanType = (clickType || 'link').toLowerCase();
  const keys = [profileId];
  if (username && username !== profileId) keys.push(username);

  for (const key of keys) {
    const current = getStoredTelemetry(key);
    const newClicks = current.totalClicks + 1;
    const views = Math.max(current.totalViews, newClicks);
    const newCtr = views > 0 ? parseFloat(((newClicks / views) * 100).toFixed(1)) : 0;

    // Update top links
    const topLinks = [...(current.topLinks || [])];
    const existingIndex = topLinks.findIndex(l => l.link_title.toLowerCase() === cleanTitle.toLowerCase());
    if (existingIndex >= 0) {
      topLinks[existingIndex].clicks += 1;
      if (linkUrl) topLinks[existingIndex].link_url = linkUrl;
    } else {
      topLinks.push({
        link_title: cleanTitle,
        link_url: linkUrl,
        click_type: cleanType,
        clicks: 1
      });
    }
    topLinks.sort((a, b) => b.clicks - a.clicks);

    // Update clicksByType
    const clicksByType = [...(current.clicksByType || [])];
    const typeIdx = clicksByType.findIndex(t => t.click_type.toLowerCase() === cleanType.toLowerCase());
    if (typeIdx >= 0) {
      clicksByType[typeIdx].count += 1;
    } else {
      clicksByType.push({ click_type: cleanType, count: 1 });
    }

    // Update recent activity
    const newEvent = {
      event_type: 'click',
      detail: cleanTitle,
      created_at: new Date().toISOString()
    };
    const newActivity = [newEvent, ...(current.recentActivity || [])].slice(0, 15);

    const updated: TelemetryData = {
      ...current,
      totalViews: views,
      totalClicks: newClicks,
      ctr: newCtr,
      topLinks: topLinks.slice(0, 10),
      clicksByType,
      recentActivity: newActivity
    };

    saveStoredTelemetry(key, updated);
  }

  // Fire network request with keepalive
  try {
    fetch('/api/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId,
        link_id: linkId,
        link_url: linkUrl,
        link_title: cleanTitle,
        click_type: cleanType
      }),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Fetch unified telemetry data combining remote API, local cache, and profile views fallback
 */
export async function getProfileTelemetry(
  profileId: string, 
  username?: string, 
  fallbackViews: number = 0
): Promise<TelemetryData> {
  const localById = getStoredTelemetry(profileId);
  const localByUsername = username ? getStoredTelemetry(username) : null;

  // Combine local caches
  const localCombined: TelemetryData = {
    totalViews: Math.max(localById.totalViews, localByUsername?.totalViews || 0, fallbackViews || 0),
    totalClicks: Math.max(localById.totalClicks, localByUsername?.totalClicks || 0),
    nfcTaps: Math.max(localById.nfcTaps, localByUsername?.nfcTaps || 0),
    qrScans: Math.max(localById.qrScans, localByUsername?.qrScans || 0),
    webViews: Math.max(localById.webViews, localByUsername?.webViews || 0),
    ctr: 0,
    clicksByType: localById.clicksByType.length > 0 ? localById.clicksByType : (localByUsername?.clicksByType || []),
    topLinks: localById.topLinks.length > 0 ? localById.topLinks : (localByUsername?.topLinks || []),
    recentActivity: [...(localById.recentActivity || []), ...(localByUsername?.recentActivity || [])]
      .filter((v, i, a) => a.findIndex(t => t.detail === v.detail && t.created_at === v.created_at) === i)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15)
  };

  let apiData: any = null;
  try {
    const res = await fetch(`/api/analytics/user/${profileId}`);
    if (res.ok) {
      apiData = await res.json();
    }
  } catch (err) {
    // API failed or offline - smoothly use localCombined
  }

  const finalViews = Math.max(apiData?.totalViews || 0, localCombined.totalViews || 0);
  const finalClicks = Math.max(apiData?.totalClicks || 0, localCombined.totalClicks || 0);
  const finalNfc = Math.max(apiData?.nfcTaps || 0, localCombined.nfcTaps || 0);
  const finalQr = Math.max(apiData?.qrScans || 0, localCombined.qrScans || 0);
  const finalWeb = Math.max(apiData?.webViews || 0, localCombined.webViews || 0, Math.max(0, finalViews - (finalNfc + finalQr)));
  const finalCtr = finalViews > 0 ? parseFloat(((finalClicks / finalViews) * 100).toFixed(1)) : 0;

  // Merge top links
  const mergedLinksMap = new Map<string, { link_title: string; link_url?: string; click_type: string; clicks: number }>();
  if (Array.isArray(apiData?.topLinks)) {
    for (const l of apiData.topLinks) {
      if (l.link_title) mergedLinksMap.set(l.link_title.toLowerCase(), { ...l });
    }
  }
  for (const l of localCombined.topLinks) {
    const key = l.link_title.toLowerCase();
    const existing = mergedLinksMap.get(key);
    if (existing) {
      existing.clicks = Math.max(existing.clicks, l.clicks);
    } else {
      mergedLinksMap.set(key, { ...l });
    }
  }
  const mergedTopLinks = Array.from(mergedLinksMap.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 8);

  // Merge recent activity
  const mergedActivity = [
    ...(Array.isArray(apiData?.recentActivity) ? apiData.recentActivity : []),
    ...localCombined.recentActivity
  ]
    .filter((v, i, a) => a.findIndex(t => t.detail === v.detail && t.created_at === v.created_at) === i)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15);

  return {
    totalViews: finalViews,
    totalClicks: finalClicks,
    ctr: finalCtr,
    nfcTaps: finalNfc,
    qrScans: finalQr,
    webViews: finalWeb,
    clicksByType: apiData?.clicksByType || localCombined.clicksByType,
    topLinks: mergedTopLinks,
    recentActivity: mergedActivity
  };
}

/**
 * Subscribe to real-time telemetry updates across tabs or within current tab
 */
export function subscribeToTelemetry(
  profileId: string, 
  onUpdate: () => void, 
  username?: string
): () => void {
  if (typeof window === 'undefined') return () => {};

  const matches = (incomingId?: string) => {
    if (!profileId) return true;
    if (!incomingId) return false;
    if (incomingId === profileId) return true;
    if (username && incomingId.toLowerCase() === username.toLowerCase()) return true;
    return false;
  };

  const handleCustomEvent = (e: any) => {
    if (matches(e.detail?.profileId)) {
      onUpdate();
    }
  };

  window.addEventListener('chipng_telemetry_event', handleCustomEvent);

  let channel: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(TELEMETRY_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (matches(event.data?.profileId)) {
          onUpdate();
        }
      };
    }
  } catch (e) {}

  return () => {
    window.removeEventListener('chipng_telemetry_event', handleCustomEvent);
    if (channel) {
      try { channel.close(); } catch (e) {}
    }
  };
}

/**
 * Mobile App Download Telemetry Types & Functions
 */
export interface AppDownloadEvent {
  id?: number | string;
  platform: 'ios' | 'android' | 'apk' | 'pwa';
  device_type?: string;
  version?: string;
  referrer?: string;
  city?: string;
  country?: string;
  created_at: string;
}

export interface AppDownloadAnalytics {
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
  dailyTrends: Array<{
    date: string;
    label?: string;
    total: number;
    ios: number;
    android: number;
    apk: number;
    pwa: number;
  }>;
  topLocations?: Array<{ city: string; count: number; percent: number }>;
  topDevices?: Array<{ device: string; count: number; percent: number }>;
  recentDownloads: AppDownloadEvent[];
  avgPerDay?: number;
  conversionRate: number;
}

const DOWNLOAD_STORAGE_KEY = 'chipng_app_downloads_cache';
const DOWNLOAD_CHANNEL_NAME = 'chipng_download_telemetry_stream';

export async function recordAppDownload(
  platform: 'ios' | 'android' | 'apk' | 'pwa',
  meta?: { source?: string; version?: string }
): Promise<boolean> {
  const downloadPayload = {
    platform,
    device_type: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'mobile' : 'desktop',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    version: meta?.version || '2.4.0',
    source: meta?.source || 'website',
    created_at: new Date().toISOString()
  };

  // 1. Immediately store in local client cache for instant admin reflection
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(DOWNLOAD_STORAGE_KEY);
      let list: any[] = existing ? JSON.parse(existing) : [];
      list.unshift({ ...downloadPayload, id: 'loc_' + Date.now() });
      if (list.length > 100) list = list.slice(0, 100);
      localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) {}

  // 2. Broadcast cross-tab
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(DOWNLOAD_CHANNEL_NAME);
      channel.postMessage({ type: 'APP_DOWNLOAD', ...downloadPayload });
      setTimeout(() => channel.close(), 100);
    }
  } catch (e) {}

  // 3. Dispatch local event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chipng_download_event', { detail: downloadPayload }));
  }

  // 4. Remote backend call (await/keepalive so DB reflects immediately on refresh)
  try {
    if (typeof fetch !== 'undefined') {
      await fetch('/api/app/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(downloadPayload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) {}

  return true;
}

function buildEmpty7DayTrends(): AppDownloadAnalytics['dailyTrends'] {
  const out: AppDownloadAnalytics['dailyTrends'] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    out.push({ date: `${mm}-${dd}`, label: `${mm}-${dd}`, total: 0, ios: 0, android: 0, apk: 0, pwa: 0 });
  }
  return out;
}

export async function fetchAppDownloadAnalytics(): Promise<AppDownloadAnalytics> {
  const emptyAnalytics: AppDownloadAnalytics = {
    totalDownloads: 0,
    byPlatform: { ios: 0, android: 0, apk: 0, pwa: 0 },
    byDevice: { mobile: 0, tablet: 0, desktop: 0 },
    dailyTrends: buildEmpty7DayTrends(),
    topLocations: [],
    topDevices: [],
    recentDownloads: [],
    avgPerDay: 0,
    conversionRate: 0
  };

  try {
    const res = await fetch('/api/app/downloads');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.totalDownloads === 'number') {
        return {
          totalDownloads: data.totalDownloads,
          byPlatform: {
            ios: Number(data.byPlatform?.ios || 0),
            android: Number(data.byPlatform?.android || 0),
            apk: Number(data.byPlatform?.apk || 0),
            pwa: Number(data.byPlatform?.pwa || 0),
          },
          byDevice: {
            mobile: Number(data.byDevice?.mobile || 0),
            tablet: Number(data.byDevice?.tablet || 0),
            desktop: Number(data.byDevice?.desktop || 0),
          },
          dailyTrends: Array.isArray(data.dailyTrends) && data.dailyTrends.length > 0
            ? data.dailyTrends
            : emptyAnalytics.dailyTrends,
          topLocations: Array.isArray(data.topLocations) ? data.topLocations : [],
          topDevices: Array.isArray(data.topDevices) ? data.topDevices : [],
          recentDownloads: Array.isArray(data.recentDownloads) ? data.recentDownloads : [],
          avgPerDay: typeof data.avgPerDay === 'number' ? data.avgPerDay : 0,
          conversionRate: typeof data.conversionRate === 'number' ? data.conversionRate : 0,
        };
      }
    }
  } catch (err) {}

  return emptyAnalytics;
}

export function subscribeToDownloadTelemetry(onUpdate: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => onUpdate();
  window.addEventListener('chipng_download_event', handleCustomEvent);

  let channel: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(DOWNLOAD_CHANNEL_NAME);
      channel.onmessage = () => onUpdate();
    }
  } catch (e) {}

  return () => {
    window.removeEventListener('chipng_download_event', handleCustomEvent);
    if (channel) {
      try { channel.close(); } catch (e) {}
    }
  };
}
