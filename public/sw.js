/*
 * HOSH service worker.
 * - Precaches the scam-now and how-to-report pages (both languages) and the
 *   JS/CSS/fonts they need, so they open with no connection after one visit.
 * - /now is served cache-first (instant on slow data) and refreshed in the background.
 * - Other pages are network-first with a short timeout, falling back to the cache,
 *   and finally to the scam-now page in the visitor's language.
 * - API calls are never cached.
 */
const VERSION = 'hosh-v1';
const PAGES = ['/en/now', '/ur/now', '/en/how-to-report', '/ur/how-to-report', '/en', '/ur'];
const CACHE_FIRST_PAGES = new Set(['/en/now', '/ur/now']);

async function precachePage(cache, url) {
  try {
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
    if (!res.ok || res.redirected) return;
    await cache.put(url, res.clone());
    const html = await res.text();
    const assets = new Set();
    for (const m of html.matchAll(/(?:href|src)="(\/_next\/static\/[^"]+)"/g)) assets.add(m[1]);
    for (const m of html.matchAll(/"(\/_next\/static\/[^"\\]+\.(?:js|css|woff2))"/g)) assets.add(m[1]);
    await Promise.all(
      [...assets].map(async (a) => {
        if (await cache.match(a)) return;
        try {
          const r = await fetch(a);
          if (r.ok) await cache.put(a, r);
        } catch {}
      }),
    );
  } catch {}
}

async function precacheCss(cache) {
  // Fonts are referenced from CSS, not HTML: pull them in too.
  const keys = await cache.keys();
  for (const req of keys) {
    if (!req.url.endsWith('.css')) continue;
    const res = await cache.match(req);
    const css = res ? await res.text() : '';
    for (const m of css.matchAll(/url\(([^)]+\.woff2)\)/g)) {
      const url = new URL(m[1].replace(/["']/g, ''), req.url).toString();
      if (await cache.match(url)) continue;
      try {
        const r = await fetch(url);
        if (r.ok) await cache.put(url, r);
      } catch {}
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      for (const p of PAGES) await precachePage(cache, p);
      await precacheCss(cache);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== VERSION && key !== 'hosh-prefs') await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function preferredLang() {
  try {
    const prefs = await caches.open('hosh-prefs');
    const res = await prefs.match('/__hosh/lang');
    const lang = res ? await res.text() : 'en';
    return lang === 'ur' ? 'ur' : 'en';
  } catch {
    return 'en';
  }
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function handleNavigation(request) {
  const url = new URL(request.url);
  const cache = await caches.open(VERSION);
  const path = url.pathname.replace(/\/$/, '') || '/';

  if (CACHE_FIRST_PAGES.has(path)) {
    const cached = await cache.match(path);
    const refresh = fetch(request)
      .then((res) => {
        if (res.ok && !res.redirected) cache.put(path, res.clone());
        return res;
      })
      .catch(() => null);
    if (cached) return cached;
    const fresh = await refresh;
    if (fresh) return fresh;
  }

  try {
    const res = await Promise.race([fetch(request), timeout(6000)]);
    if (res.ok && !res.redirected && PAGES.includes(path)) cache.put(path, res.clone());
    return res;
  } catch {
    const cached = await cache.match(path);
    if (cached) return cached;
    const seg = path.split('/')[1];
    const lang = seg === 'ur' || seg === 'en' ? seg : await preferredLang();
    const fallback = (await cache.match(`/${lang}/now`)) || (await cache.match('/en/now'));
    if (fallback) return fallback;
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Hashed build assets never change: cache-first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
  }
});
