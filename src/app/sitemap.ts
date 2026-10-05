import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

const PATHS = ['', '/now', '/check', '/report', '/message-check', '/how-to-report', '/learn', '/findings', '/tracker', '/about'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PATHS.flatMap((p) =>
    (['en', 'ur'] as const).map((lang) => ({
      url: `${base}/${lang}${p}`,
      changeFrequency: p === '' ? ('hourly' as const) : ('weekly' as const),
      priority: p === '' || p === '/now' ? 1 : 0.7,
      alternates: { languages: { en: `${base}/en${p}`, ur: `${base}/ur${p}` } },
    })),
  );
}
