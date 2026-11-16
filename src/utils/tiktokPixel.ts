// TikTok Pixel & Events API utility (scoped specifically to /buy-card funnel)
export const TIKTOK_PIXEL_ID = 'DBTOMKRC77U4UD9J3JI0';

export interface TikTokEventRecord {
  event: string;
  event_id?: string;
  params?: Record<string, any>;
  timestamp: string;
  status: 'dispatched' | 'queued' | 'error' | 'skipped';
  capiStatus?: 'pending' | 'sent' | 'skipped' | 'error';
}

export interface TikTokUserMatchData {
  email?: string;
  phone?: string;
  external_id?: string;
}

export interface TikTokTrackOptions {
  force?: boolean;
  user?: TikTokUserMatchData;
  test_event_code?: string;
  skipServer?: boolean;
}

declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: {
      page: (opts?: Record<string, any>) => void;
      track: (event: string, params?: Record<string, any>) => void;
      identify: (params: Record<string, any>) => void;
      load?: (pixelId: string, config?: Record<string, any>) => void;
      debug?: () => void;
      _i?: Record<string, any>;
      _t?: Record<string, any>;
      [key: string]: any;
    };
    __tiktokPixelEvents?: TikTokEventRecord[];
    __tiktokPixelBootstrapped?: Record<string, boolean>;
    testTikTokPixel?: (eventName?: string, testEventCode?: string) => void;
  }
}

export const isBuyCardRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  return path === '/buy-card' || path === '/buycard' || path.startsWith('/buy-card/') || path.startsWith('/buycard/');
};

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

const getTtclidFromUrl = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    return new URLSearchParams(window.location.search).get('ttclid') || undefined;
  } catch {
    return undefined;
  }
};

const generateEventId = (eventName: string, providedId?: string): string => {
  if (providedId && String(providedId).trim()) return String(providedId).trim();
  return `chip_${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const dispatchServerEvent = async (
  eventName: string,
  eventId: string,
  params: Record<string, any> | undefined,
  options: TikTokTrackOptions | undefined,
  record: TikTokEventRecord
) => {
  if (typeof window === 'undefined' || options?.skipServer) return;
  try {
    record.capiStatus = 'pending';
    const response = await fetch('/api/tiktok/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: eventName,
        event_id: eventId,
        url: window.location.href,
        referrer: document.referrer || undefined,
        properties: params,
        user: {
          ...(options?.user || {}),
          ttp: getCookieValue('_ttp'),
          ttclid: getTtclidFromUrl(),
        },
        test_event_code: options?.test_event_code,
      }),
    });

    if (response.ok) {
      const json = await response.json().catch(() => ({}));
      record.capiStatus = json?.success ? 'sent' : json?.skipped ? 'skipped' : 'error';
    } else {
      record.capiStatus = 'error';
    }
  } catch {
    record.capiStatus = 'error';
  }
};

/**
 * Dynamically bootstraps the TikTok Pixel SDK exclusively on /buy-card (or when forced in Admin Pixel Tester).
 * Idempotent: safe to call multiple times across re-renders.
 */
export const initTikTokPixel = (
  pixelId: string = TIKTOK_PIXEL_ID,
  options?: { force?: boolean; sendPageView?: boolean; test_event_code?: string }
): { initialized: boolean; alreadyLoaded?: boolean; skipped?: boolean } => {
  if (typeof window === 'undefined') {
    return { initialized: false, skipped: true };
  }

  if (!options?.force && !isBuyCardRoute()) {
    return { initialized: false, skipped: true };
  }

  window.__tiktokPixelBootstrapped = window.__tiktokPixelBootstrapped || {};
  const alreadyBootstrapped = Boolean(window.__tiktokPixelBootstrapped[pixelId]);

  try {
    if (!window.ttq || !window.ttq._i?.[pixelId]) {
      const w = window as any;
      const d = document;
      const t = 'ttq';
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      if (!ttq.methods) {
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
          'holdConsent',
          'revokeConsent',
          'grantConsent',
        ];
        ttq.setAndDefer = function (target: any, method: string) {
          target[method] = function (...args: any[]) {
            target.push([method, ...args]);
          };
        };
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i]);
        }
        ttq.instance = function (id: string) {
          const inst = ttq._i?.[id] || [];
          for (let n = 0; n < ttq.methods.length; n++) {
            ttq.setAndDefer(inst, ttq.methods[n]);
          }
          return inst;
        };
        ttq.load = function (e: string, n?: Record<string, any>) {
          const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = r;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};

          if (!d.querySelector(`script[src*="analytics.tiktok.com"][src*="${e}"]`)) {
            const script = d.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = `${r}?sdkid=${e}&lib=${t}`;
            const firstScript = d.getElementsByTagName('script')[0];
            if (firstScript?.parentNode) {
              firstScript.parentNode.insertBefore(script, firstScript);
            } else {
              d.head.appendChild(script);
            }
          }
        };
      }

      if (typeof ttq.load === 'function') {
        ttq.load(pixelId);
      }
    }

    window.__tiktokPixelBootstrapped[pixelId] = true;

    if (options?.sendPageView !== false && !alreadyBootstrapped) {
      trackTikTokPageView({
        force: options?.force,
        test_event_code: options?.test_event_code,
      });
    }

    return { initialized: true, alreadyLoaded: alreadyBootstrapped };
  } catch (err) {
    console.warn('[TikTok Pixel] Initialization skipped:', err);
    return { initialized: false };
  }
};

// Track an event with comprehensive logging, browser pixel, and server Events API deduplication
export const trackTikTokEvent = (
  eventName: string,
  params?: Record<string, any>,
  options?: TikTokTrackOptions
) => {
  if (typeof window === 'undefined') {
    return { success: false, skipped: true };
  }

  if (!options?.force && !isBuyCardRoute()) {
    return { success: false, skipped: true, reason: 'Scoped to /buy-card' };
  }

  initTikTokPixel(TIKTOK_PIXEL_ID, { force: options?.force, sendPageView: false });

  const timestamp = new Date().toLocaleTimeString();
  const eventId = generateEventId(eventName, params?.event_id);
  const clientParams = { ...(params || {}), event_id: eventId };

  const eventRecord: TikTokEventRecord = {
    event: eventName,
    event_id: eventId,
    params: clientParams,
    timestamp,
    status: 'dispatched',
    capiStatus: options?.skipServer ? 'skipped' : 'pending',
  };

  window.__tiktokPixelEvents = window.__tiktokPixelEvents || [];
  window.__tiktokPixelEvents.unshift(eventRecord);

  // Fire non-blocking server-side TikTok Events API call with matching event_id
  void dispatchServerEvent(eventName, eventId, params, options, eventRecord);

  if (window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, clientParams);
      console.log(
        `%c[TikTok Pixel 🎯]%c Dispatched "${eventName}" (${TIKTOK_PIXEL_ID})`,
        'background: #000; color: #25F4EE; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #FE2C55; font-weight: bold;',
        clientParams
      );
      return { success: true, eventRecord };
    } catch (e) {
      console.error('[TikTok Pixel] Tracking error:', e);
      eventRecord.status = 'error';
      return { success: false, error: e };
    }
  } else {
    console.warn('[TikTok Pixel] ttq is not initialized or track is unavailable yet.');
    eventRecord.status = 'queued';
    return { success: false, queued: true };
  }
};

// Track PageView
export const trackTikTokPageView = (options?: TikTokTrackOptions) => {
  if (typeof window === 'undefined') {
    return { success: false, skipped: true };
  }

  if (!options?.force && !isBuyCardRoute()) {
    return { success: false, skipped: true, reason: 'Scoped to /buy-card' };
  }

  initTikTokPixel(TIKTOK_PIXEL_ID, { force: options?.force, sendPageView: false });

  const timestamp = new Date().toLocaleTimeString();
  const eventId = generateEventId('PageView');
  const params = { path: window.location.pathname, event_id: eventId };

  const eventRecord: TikTokEventRecord = {
    event: 'PageView',
    event_id: eventId,
    params,
    timestamp,
    status: 'dispatched',
    capiStatus: options?.skipServer ? 'skipped' : 'pending',
  };

  window.__tiktokPixelEvents = window.__tiktokPixelEvents || [];
  window.__tiktokPixelEvents.unshift(eventRecord);

  void dispatchServerEvent('PageView', eventId, { content_name: 'CHIP NG Buy Card Funnel' }, options, eventRecord);

  if (window.ttq && typeof window.ttq.page === 'function') {
    try {
      window.ttq.page({ event_id: eventId });
      console.log(
        `%c[TikTok Pixel 🎯]%c Dispatched "PageView" (${TIKTOK_PIXEL_ID})`,
        'background: #000; color: #25F4EE; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #25F4EE; font-weight: bold;'
      );
      return { success: true };
    } catch (e) {
      console.error('[TikTok Pixel] PageView error:', e);
      return { success: false, error: e };
    }
  }
  return { success: false, queued: true };
};

// Check runtime pixel status
export const checkTikTokPixelStatus = () => {
  if (typeof window === 'undefined') {
    return {
      initialized: false,
      loadedId: false,
      pixelId: TIKTOK_PIXEL_ID,
      hasScriptTag: false,
      isBuyCardRoute: false,
      eventsFired: 0,
      events: [] as TikTokEventRecord[],
    };
  }

  const hasTtq = typeof window.ttq !== 'undefined';
  const hasLoadedId = Boolean(hasTtq && window.ttq?._i && window.ttq._i[TIKTOK_PIXEL_ID]);
  const hasScriptTag = Boolean(
    document.querySelector(`script[src*="analytics.tiktok.com"][src*="${TIKTOK_PIXEL_ID}"]`) ||
      document.querySelector('script[src*="analytics.tiktok.com"]')
  );

  return {
    initialized: hasTtq,
    loadedId: hasLoadedId,
    pixelId: TIKTOK_PIXEL_ID,
    hasScriptTag,
    isBuyCardRoute: isBuyCardRoute(),
    eventsFired: (window.__tiktokPixelEvents || []).length,
    events: window.__tiktokPixelEvents || [],
  };
};

// Global console helper: window.testTikTokPixel('CompletePayment', 'TEST12345')
if (typeof window !== 'undefined') {
  window.testTikTokPixel = (eventName = 'ViewContent', testEventCode?: string) => {
    console.log(`[TikTok Pixel Test] Running test for "${eventName}" on Pixel ${TIKTOK_PIXEL_ID}...`);
    initTikTokPixel(TIKTOK_PIXEL_ID, { force: true, sendPageView: false });
    const status = checkTikTokPixelStatus();
    console.table({
      'Pixel ID': status.pixelId,
      'window.ttq initialized': status.initialized,
      'Script Tag Injected': status.hasScriptTag,
      'On /buy-card Route': status.isBuyCardRoute,
      'Events Count': status.eventsFired,
    });

    const testParams = {
      content_type: 'product',
      content_name: 'Smart Metal NFC Card',
      content_id: 'metal',
      value: 50000,
      currency: 'NGN',
      test_timestamp: new Date().toISOString(),
    };

    if (eventName === 'PageView') {
      trackTikTokPageView({ force: true, test_event_code: testEventCode });
    } else {
      trackTikTokEvent(eventName, testParams, { force: true, test_event_code: testEventCode });
    }
    console.log('[TikTok Pixel Test] Check TikTok Pixel Helper browser extension or TikTok Events Manager Test tab.');
  };
}
