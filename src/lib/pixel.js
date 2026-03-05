const pixelId = import.meta.env.VITE_META_PIXEL_ID;

export function initPixel() {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.fbq) return;
  const f = window;
  const b = document;
  const e = 'script';
  const v = 'https://connect.facebook.net/en_US/fbevents.js';
  const n = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];
  const t = b.createElement(e);
  t.async = !0;
  t.src = v;
  const s = b.getElementsByTagName(e)[0];
  s?.parentNode?.insertBefore(t, s);
  f.fbq('init', pixelId);
  f.fbq('track', 'PageView');
}

export function trackLead(source) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', { value: 59, currency: 'TND', content_name: source });
  }
}
