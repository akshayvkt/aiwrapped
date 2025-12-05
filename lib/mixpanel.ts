import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

// Initialize immediately on module load (client-side only)
if (typeof window !== 'undefined') {
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      persistence: 'localStorage',
      track_pageview: false,
      loaded: () => {
        initialized = true;
      },
    });
    // Also set immediately in case loaded callback is sync
    initialized = true;
  } else {
    console.warn('[Mixpanel] No token found - analytics disabled');
  }
}

// Track an event with optional properties
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;

  // Small delay to ensure Mixpanel is ready
  setTimeout(() => {
    try {
      mixpanel.track(eventName, properties);
    } catch (error) {
      console.error('[Mixpanel] Tracking error:', error);
    }
  }, 0);
}
