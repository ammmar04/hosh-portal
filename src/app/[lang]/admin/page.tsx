import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Lock } from 'lucide-react';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getStore } from '@/lib/db';
import { pageMetadata } from '@/lib/metadata';
import { ADMIN_COOKIE, adminPassword, isAdminEnabled, isValidAdminSession } from '@/lib/server/security';
import { PageShell } from '@/components/layout/PageShell';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { reportLabels } from '@/components/reports/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/[lang]/admin'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/admin', getDictionary(lang).meta.pages.admin, { noindex: true });
}

export default async function AdminPage({ params }: PageProps<'/[lang]/admin'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.admin;
  const enabled = isAdminEnabled();
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  const signedIn = enabled && isValidAdminSession(session);
  const store = getStore();

  return (
    <PageShell>
      <section className="wrap pb-24 pt-8 sm:pt-12">
        <h1 className="t-h1 flex items-center gap-3">
          <Lock className="h-8 w-8 text-alarm-ink" aria-hidden="true" />
          {t.title}
        </h1>
        <div className="mt-8">
          {!enabled ? (
            <p className="card p-6 font-semibold">{t.disabled}</p>
          ) : !signedIn ? (
            <AdminLogin t={t} showDevHint={!process.env.ADMIN_PASSWORD && adminPassword() !== null} />
          ) : (
            <AdminPanel lang={lang} t={t} labels={reportLabels(dict)} storage={store.kind} initial={await store.all()} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
