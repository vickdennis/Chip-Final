// TikTok Pixel event utility
declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (event: string, params?: Record<string, any>) => void;
      identify: (params: Record<string, any>) => void;
      [key: string]: any;
    };
  }
}

export const trackTikTokEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, params);
    } catch (e) {
      console.warn('TikTok pixel track error:', e);
    }
  }
};

export const trackTikTokPageView = () => {
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.page === 'function') {
    try {
      window.ttq.page();
    } catch (e) {
      console.warn('TikTok pixel page error:', e);
    }
  }
};
