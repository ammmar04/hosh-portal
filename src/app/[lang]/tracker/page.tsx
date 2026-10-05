import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Construction } from 'lucide-react';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { TrackerDemo } from '@/components/tracker/TrackerDemo';
import { ListenInUrdu } from '@/components/ui/ListenInUrdu';

export async function generateMetadata({ params }: PageProps<'/[lang]/tracker'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/tracker', getDictionary(lang).meta.pages.tracker);
}

export default async function TrackerPage({ params }: PageProps<'/[lang]/tracker'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.tracker;
  return (
    <PageShell>
      <section className="wrap pb-24 pt-8 sm:pt-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-bold text-navy">
          <Construction className="h-5 w-5" aria-hidden="true" />
          {t.mockLabel}
        </p>
        <h1 className="t-h1 mt-6">{t.title}</h1>
        <p className="t-lead mt-4 max-w-[50ch] text-muted">{t.sub}</p>
        <div className="mt-6">
          <ListenInUrdu label={dict.common.listenInUrdu} tooltip={dict.common.listenTooltip} badge={dict.common.proposedForNccia} />
        </div>
        <div className="mt-10">
          <TrackerDemo t={t} time={dict.time} />
        </div>
        <p className="mt-8 text-muted t-small">{t.note}</p>
      </section>
    </PageShell>
  );
}
