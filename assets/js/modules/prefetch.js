// Instant navigation: prefetch same-origin pages the moment the user shows
// intent (hover / focus / touch), so the click resolves from cache.
// Inspired by McMaster-Carr's predictive prefetch (Wes Bos, "How is this
// Website so fast!?").

const prefetched = new Set();

// Respect the user's data preferences and slow links — don't burn their bytes.
const conn = navigator.connection;
const saveData = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));

function prefetch(url) {
  if (saveData || prefetched.has(url)) return;
  prefetched.add(url);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  document.head.appendChild(link);
}

function candidate(el) {
  const a = el.closest && el.closest('a[href]');
  if (!a) return null;
  // Same-origin, real navigations only — skip new tabs, downloads, #anchors.
  if (a.origin !== location.origin) return null;
  if (a.target === '_blank' || a.hasAttribute('download')) return null;
  const url = a.href.split('#')[0];
  if (url === location.href.split('#')[0]) return null;
  return url;
}

let timer;
function onIntent(e) {
  const url = candidate(e.target);
  if (!url) return;
  // Small delay on hover so a mouse merely passing over a link doesn't fetch.
  clearTimeout(timer);
  timer = setTimeout(() => prefetch(url), 65);
}

export function ready() {
  if (saveData) return;
  document.addEventListener('pointerover', onIntent, { passive: true });
  document.addEventListener('focusin', onIntent, { passive: true });
  // Touch has no hover — fetch on first touch, before the click lands.
  document.addEventListener(
    'touchstart',
    (e) => {
      const url = candidate(e.target);
      if (url) prefetch(url);
    },
    { passive: true }
  );
}
