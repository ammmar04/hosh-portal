import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { ReportForm } from '@/components/report/ReportForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/report'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/report', getDictionary(lang).meta.pages.report);
}

export default async function ReportPage({ params, searchParams }: PageProps<'/[lang]/report'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const sp = await searchParams;
  const initialNumber = typeof sp.n === 'string' ? sp.n.slice(0, 24) : '';

  return (
    <PageShell>
      <section className="wrap pb-24 pt-8 sm:pt-12">
        <div className="max-w-2xl">
          <h1 className="t-h1">{dict.report.title}</h1>
          <p className="t-lead mt-4 text-muted">{dict.report.sub}</p>
        </div>
        <div className="mt-8">
          <ReportForm
            lang={lang}
            initialNumber={initialNumber}
            t={{
              report: dict.report,
              scamTypes: dict.scamTypes,
              asked: dict.asked,
              loss: dict.loss,
              numberErrors: dict.checker.errors,
              justNow: dict.time.justNow,
            }}
          />
        </div>
      </section>
    </PageShell>
  );
}
