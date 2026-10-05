import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { fontVariables } from '../fonts';
import { LANGS, dirFor, isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { siteUrl } from '@/lib/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScamNowFab } from '@/components/layout/ScamNowFab';
import { AppRuntime } from '@/components/pwa/AppRuntime';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: dict.meta.defaultTitle, template: dict.meta.titleTemplate },
    description: dict.meta.description,
    applicationName: 'HOSH',
    appleWebApp: { capable: true, title: 'HOSH', statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    openGraph: { siteName: 'HOSH', locale: lang === 'ur' ? 'ur_PK' : 'en_PK', type: 'website' },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#14132B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Runs before first paint so a saved light/dark choice never flashes.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('hosh-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} dir={dirFor(lang)} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* text/javascript on the server so it runs before paint; inert text/plain if React renders it on the client */}
        <script
          type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {dict.common.skipToContent}
        </a>
        <Header lang={lang} dict={dict} />
        {children}
        <Footer lang={lang} dict={dict} />
        <ScamNowFab lang={lang} label={dict.fab.label} aria={dict.fab.aria} />
        <AppRuntime lang={lang} offlineText={dict.common.offline} />
      </body>
    </html>
  );
}
