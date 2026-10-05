'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import type { Lang } from '@/i18n/config';

/**
 * Registers the service worker (production only) so /now and /how-to-report
 * work offline after one visit, remembers the language for the offline
 * fallback, and shows a small banner when the connection drops.
 */
export function AppRuntime({ lang, offlineText }: { lang: Lang; offlineText: string }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const swEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SW_DEV === '1';
    if (swEnabled && 'serviceWorker' in navigator) {
      const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
    }
    // The service worker reads this to pick the right offline page.
    if ('caches' in window) {
      caches
        .open('hosh-prefs')
        .then((c) => c.put('/__hosh/lang', new Response(lang)))
        .catch(() => {});
    }
  }, [lang]);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-2">
      <p className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-[0.9375rem] font-semibold text-navy shadow-lg">
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        {offlineText}
      </p>
    </div>
  );
}
