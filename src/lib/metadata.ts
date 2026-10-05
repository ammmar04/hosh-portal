import type { Metadata } from 'next';
import type { Lang } from '@/i18n/config';

/** Title, description, canonical URL and hreflang alternates for a page, in the page's language. */
export function pageMetadata(
  lang: Lang,
  path: string,
  page: { title: string; description: string },
  opts: { absoluteTitle?: boolean; noindex?: boolean } = {},
): Metadata {
  const url = `/${lang}${path}`;
  return {
    title: opts.absoluteTitle ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: {
      canonical: url,
      languages: { en: `/en${path}`, ur: `/ur${path}`, 'x-default': `/en${path}` },
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: 'HOSH',
      locale: lang === 'ur' ? 'ur_PK' : 'en_PK',
      alternateLocale: lang === 'ur' ? ['en_PK'] : ['ur_PK'],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description },
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
