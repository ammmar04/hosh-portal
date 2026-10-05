import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getStore } from '@/lib/db';
import { SAMPLE_LOOKUPS } from '@/lib/samples';
import { toPublic, type PublicReport } from '@/lib/types';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/home/Hero';
import { Rules } from '@/components/home/Rules';
import { WhyStrip } from '@/components/home/WhyStrip';
import { ReportCta } from '@/components/home/ReportCta';
import { NumberChecker } from '@/components/check/NumberChecker';
import { LiveReports } from '@/components/reports/LiveReports';
import { reportLabels } from '@/components/reports/labels';

// Static and fast; refreshed when a report arrives (revalidatePath) and every minute.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '', getDictionary(lang).meta.pages.home, { absoluteTitle: true });
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);

  let initial: PublicReport[] = [];
  const renderedAt = Date.now();
  try {
    initial = (await getStore().recent(12)).map(toPublic);
  } catch (e) {
    console.error('[home] recent reports', e);
  }

  return (
    <PageShell>
      <Hero lang={lang} dict={dict} />

      <section className="py-14 lg:py-20" aria-labelledby="checker-title">
        <div className="wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <div className="lg:pt-6">
            <h2 id="checker-title" className="t-h2 reveal max-w-[14ch]">
              {dict.home.checker.title}
            </h2>
            <p className="t-lead mt-4 max-w-[40ch] text-muted">{dict.home.checker.sub}</p>
          </div>
          <div className="card p-5 sm:p-7">
            <NumberChecker lang={lang} t={dict.checker} samples={SAMPLE_LOOKUPS} />
          </div>
        </div>
      </section>

      <LiveReports
        initial={initial}
        renderedAt={renderedAt}
        lang={lang}
        labels={reportLabels(dict)}
        text={{
          title: dict.home.recent.title,
          sub: dict.home.recent.sub,
          empty: dict.home.recent.empty,
          live: dict.home.recent.live,
          tickerLabel: dict.home.recent.tickerLabel,
          unverified: dict.common.unverifiedLong,
          sampleNote: dict.common.sampleNote,
          pause: dict.common.pauseTicker,
          play: dict.common.playTicker,
          listSep: dict.common.listSep,
        }}
      />

      <ReportCta lang={lang} dict={dict} />

      <section className="py-16 lg:py-24" aria-labelledby="rules-title">
        <div className="wrap">
          <h2 id="rules-title" className="t-h2 reveal max-w-[20ch]">
            {dict.home.rules.title}
          </h2>
          <p className="t-lead mt-4 text-muted">{dict.home.rules.sub}</p>
          <div className="mt-10">
            <Rules lang={lang} dict={dict} />
          </div>
        </div>
      </section>

      <WhyStrip lang={lang} dict={dict} />
    </PageShell>
  );
}
