// TikTok Pixel event utility and testing suite
export const TIKTOK_PIXEL_ID = 'DAO7GLRC77U5LL2S2TIG';

export interface TikTokEventRecord {
  event: string;
  params?: Record<string, any>;
  timestamp: string;
  status: 'dispatched' | 'queued' | 'error';
}

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (event: string, params?: Record<string, any>) => void;
      identify: (params: Record<string, any>) => void;
      debug?: () => void;
      _i?: Record<string, any>;
      _t?: Record<string, any>;
      [key: string]: any;
    };
    __tiktokPixelEvents?: TikTokEventRecord[];
    testTikTokPixel?: (eventName?: string) => void;
  }
}

// Track an event with comprehensive logging and diagnostic history
export const trackTikTokEvent = (eventName: string, params?: Record<string, any>) => {
  const timestamp = new Date().toLocaleTimeString();
  const eventRecord: TikTokEventRecord = {
    event: eventName,
    params,
    timestamp,
    status: 'dispatched',
  };

  // Keep in-memory event history on window for easy inspection in console
  if (typeof window !== 'undefined') {
    window.__tiktokPixelEvents = window.__tiktokPixelEvents || [];
    window.__tiktokPixelEvents.unshift(eventRecord);
  }

  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, params);
      console.log(
        `%c[TikTok Pixel 🎯]%c Dispatched "${eventName}"`,
        'background: #000; color: #25F4EE; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #FE2C55; font-weight: bold;',
        params || {}
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
export const trackTikTokPageView = () => {
  const timestamp = new Date().toLocaleTimeString();
  const eventRecord: TikTokEventRecord = {
    event: 'PageView',
    params: { path: typeof window !== 'undefined' ? window.location.pathname : '' },
    timestamp,
    status: 'dispatched',
  };

  if (typeof window !== 'undefined') {
    window.__tiktokPixelEvents = window.__tiktokPixelEvents || [];
    window.__tiktokPixelEvents.unshift(eventRecord);
  }

  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.page === 'function') {
    try {
      window.ttq.page();
      console.log(
        `%c[TikTok Pixel 🎯]%c Dispatched "PageView"`,
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
    return { initialized: false, pixelId: TIKTOK_PIXEL_ID, hasScriptTag: false, eventsFired: 0 };
  }

  const hasTtq = typeof window.ttq !== 'undefined';
  const hasLoadedId = hasTtq && window.ttq?._i && Boolean(window.ttq._i[TIKTOK_PIXEL_ID]);
  const hasScriptTag = Boolean(
    document.querySelector(`script[src*="analytics.tiktok.com"][src*="${TIKTOK_PIXEL_ID}"]`) ||
    document.querySelector('script[src*="analytics.tiktok.com"]')
  );

  return {
    initialized: hasTtq,
    loadedId: hasLoadedId,
    pixelId: TIKTOK_PIXEL_ID,
    hasScriptTag,
    eventsFired: (window.__tiktokPixelEvents || []).length,
    events: window.__tiktokPixelEvents || [],
  };
};

// Global console helper: window.testTikTokPixel('CompletePayment')
if (typeof window !== 'undefined') {
  window.testTikTokPixel = (eventName = 'ViewContent') => {
    console.log(`[TikTok Pixel Test] Running test for "${eventName}"...`);
    const status = checkTikTokPixelStatus();
    console.table({
      'Pixel ID': status.pixelId,
      'window.ttq initialized': status.initialized,
      'Script Tag Injected': status.hasScriptTag,
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
      trackTikTokPageView();
    } else {
      trackTikTokEvent(eventName, testParams);
    }
    console.log('[TikTok Pixel Test] Check TikTok Pixel Helper browser extension or TikTok Events Manager Test tab.');
  };
}

