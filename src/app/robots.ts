import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/en/admin', '/ur/admin', '/en/report/thanks', '/ur/report/thanks'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
