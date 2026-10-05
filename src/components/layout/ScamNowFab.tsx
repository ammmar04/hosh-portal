'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Lang } from '@/i18n/config';
import { HangUpCircle } from '@/components/brand/HangUp';

/**
 * Persistent compact "Scam call now?" button in the corner of every page
 * except /now. On the home page it waits until the big hero button scrolls
 * out of view, so there are never two of them on screen.
 */
export function ScamNowFab({ lang, label, aria }: { lang: Lang; label: string; aria: string }) {
  const pathname = usePathname() || '';
  const onNow = /^\/(en|ur)\/now\/?$/.test(pathname);
  const isHome = /^\/(en|ur)\/?$/.test(pathname);
  const [heroVisible, setHeroVisible] = useState(isHome);

  useEffect(() => {
    const el = document.getElementById('hero-now');
    if (!el) {
      setHeroVisible(false);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setHeroVisible(Boolean(entry?.isIntersecting)), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  if (onNow) return null;

  return (
    <div className="scam-fab-wrap no-print fixed bottom-4 end-4 z-30 sm:bottom-6 sm:end-6" data-hidden={heroVisible} style={{ viewTransitionName: 'scam-fab' }}>
      <Link
        href={`/${lang}/now`}
        aria-label={aria}
        className="btn btn-alarm min-h-[60px] gap-2.5 ps-2 pe-5 text-[1.1875rem] shadow-[0_14px_34px_-10px_rgb(229_72_77/0.8)]"
      >
        <HangUpCircle className="h-11 w-11 ring-2 ring-white/70 rounded-full" />
        <span>{label}</span>
      </Link>
    </div>
  );
}
