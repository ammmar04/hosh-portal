import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, BadgeCheck, CircleDashed, Info, Megaphone, ShieldAlert, Siren, TriangleAlert } from 'lucide-react';
import { fmt, isLang, plural } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getStore } from '@/lib/db';
import { normalizeNumber } from '@/lib/phone';
import { SAMPLE_LOOKUPS } from '@/lib/samples';
import { summarize, toPublic, type PublicReport, type Risk } from '@/lib/types';
import { pageMetadata } from '@/lib/metadata';
import { OFFICIAL_NUMBERS } from '@/data/contacts';
import { cn } from '@/lib/cn';
import { PageShell } from '@/components/layout/PageShell';
import { NumberChecker } from '@/components/check/NumberChecker';
import { HangUpCircle } from '@/components/brand/HangUp';
import { Ltr } from '@/components/ui/Ltr';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { BarList } from '@/components/charts/BarList';
import { LossBar } from '@/components/charts/LossBar';
import { FlagButton } from '@/components/reports/FlagButton';
import { SampleBadge } from '@/components/reports/ReportCard';
import { ShareLauncher } from '@/components/share/ShareLauncher';
import { ASKED_ICONS, SCAM_ICONS } from '@/components/icons';

export const dynamic = 'force-dynamic';

async function load(raw: string) {
  const decoded = decodeURIComponent(raw);
  const num = normalizeNumber(decoded);
  if (!num.ok) return { num, reports: [] as PublicReport[] };
  let reports: PublicReport[] = [];
  try {
    reports = (await getStore().forNumber(num.norm)).map(toPublic);
  } catch (e) {
    console.error('[number page]', e);
  }
  return { num, reports };
}

export async function generateMetadata({ params }: PageProps<'/[lang]/n/[number]'>): Promise<Metadata> {
  const { lang, number } = await params;
  if (!isLang(lang)) return {};
  const dict = getDictionary(lang);
  const { num, reports } = await load(number);
  if (!num.ok) return pageMetadata(lang, '/check', dict.meta.pages.check, { noindex: true });
  const count = plural(dict.common.reports, reports.length);
  const page = {
    title: fmt(dict.meta.pages.number.title, { number: num.display, count }),
    description: fmt(dict.meta.pages.number.description, { number: num.display }),
  };
  return pageMetadata(lang, `/n/${encodeURIComponent(num.norm)}`, page);
}

const RISK_STYLE: Record<Risk, { icon: typeof Siren; className: string }> = {
  none: { icon: CircleDashed, className: 'bg-sunk text-ink ring-1 ring-line-strong' },
  reported: { icon: TriangleAlert, className: 'bg-amber-soft text-amber-ink ring-1 ring-amber/50' },
  often: { icon: Siren, className: 'bg-alarm text-white' },
};

export default async function NumberPage({ params }: PageProps<'/[lang]/n/[number]'>) {
  const { lang, number } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.number;
  const { num, reports } = await load(number);

  if (!num.ok) {
    return (
      <PageShell>
        <section className="wrap-narrow pb-24 pt-10 sm:pt-14">
          <h1 className="t-h1">{t.invalidTitle}</h1>
          <p className="t-lead mt-4 text-muted">{dict.checker.errors[num.error]}</p>
          <div className="card mt-8 p-5 sm:p-7">
            <NumberChecker lang={lang} t={dict.checker} samples={SAMPLE_LOOKUPS} initialValue={decodeURIComponent(number).slice(0, 24)} initialError={num.error} />
          </div>
        </section>
      </PageShell>
    );
  }

  // Keep one canonical URL per number, so links and shares always match.
  if (decodeURIComponent(number) !== num.norm) redirect(`/${lang}/n/${encodeURIComponent(num.norm)}`);

  const summary = summarize(reports);
  const risk = RISK_STYLE[summary.risk];
  const RiskIcon = risk.icon;
  const officialId = OFFICIAL_NUMBERS[num.norm];
  const stories = reports.filter((r) => r.story);
  const reportHref = `/${lang}/report?n=${encodeURIComponent(num.norm)}`;
  const countWord = summary.count === 1 ? t.reportCount.one : t.reportCount.other;

  return (
    <PageShell>
      <section className="wrap pb-10 pt-6 sm:pt-10">
        <Link href={`/${lang}/check`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-muted hover:text-ink">
          <ArrowLeft className="mirror-rtl h-4 w-4" aria-hidden="true" />
          {t.checkAnother}
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-14">
          <div>
            <p className="t-label text-muted">{t.kind[num.kind]}</p>
            <h1 className="mt-3 break-all">
              <Ltr mono className="block text-[2.4rem] font-bold leading-none tracking-tight xs:text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem]">
                {num.display}
              </Ltr>
              <span className="sr-only">{t.heading}</span>
            </h1>

            {summary.count > 0 ? (
              <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-[5.5rem] font-extrabold leading-[0.8] tracking-tight sm:text-[7rem]">{summary.count}</span>
                  <span className="text-[1.5rem] font-bold">{countWord}</span>
                </p>
                <span className={cn('mb-1 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[1.1875rem] font-bold', risk.className)}>
                  <RiskIcon className="h-5 w-5" aria-hidden="true" />
                  {dict.risk[summary.risk].label}
                </span>
              </div>
            ) : null}
            {summary.count > 0 && (
              <p className="t-lead mt-4 text-ink-2">
                {dict.risk[summary.risk].body}{' '}
                {summary.lastReportedAt && (
                  <span className="text-muted">
                    {fmt(t.lastReported, { time: '' })}
                    <TimeAgo iso={summary.lastReportedAt} t={dict.time} />
                  </span>
                )}
              </p>
            )}
          </div>

          {summary.count > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ShareLauncher
                lang={lang}
                dict={dict}
                initialKind="number"
                number={{ display: num.display, norm: num.norm, count: summary.count }}
                label={t.shareWarning}
                className="btn btn-ink btn-lg w-full"
              />
              <Link href={reportHref} className="btn btn-ghost btn-lg w-full">
                <Megaphone className="h-5 w-5" aria-hidden="true" />
                {t.reportThis}
              </Link>
            </div>
          )}
        </div>

        {officialId && (
          <p className="mt-8 flex items-start gap-3 rounded-[20px] bg-safe-soft p-4 font-semibold text-ink">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-safe" aria-hidden="true" />
            <span>{fmt(t.official, { name: dict.contacts[officialId].name })}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-1.5 text-muted t-small">
          <p className="flex items-center gap-2 font-semibold text-ink-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-ink" aria-hidden="true" />
            {dict.common.unverified}
          </p>
          {summary.hasSamples && (
            <p className="flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t.samplesNotice}
            </p>
          )}
        </div>
      </section>

      {summary.count === 0 ? (
        <section className="wrap pb-24">
          <div className="card relative isolate flex flex-col items-center overflow-hidden px-6 py-14 text-center">
            <HangUpCircle className="h-28 w-28 opacity-90" />
            <h2 className="t-h2 mt-8">{t.emptyTitle}</h2>
            <p className="t-lead mt-3 max-w-[34ch] text-ink-2">{t.emptyBody}</p>
            <Link href={reportHref} className="btn btn-alarm btn-lg mt-8">
              <Megaphone className="h-5 w-5" aria-hidden="true" />
              {t.emptyCta}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="wrap grid gap-4 pb-6 md:grid-cols-3" aria-label={t.heading}>
            <div className="card p-5 sm:p-6">
              <h2 className="t-h3">{t.typesSeen}</h2>
              <BarList
                className="mt-5"
                rows={summary.types.map((x) => ({ key: x.key, label: dict.scamTypes[x.key].label, value: x.count, icon: SCAM_ICONS[x.key] }))}
                max={summary.count}
              />
            </div>
            <div className="card p-5 sm:p-6">
              <h2 className="t-h3">{t.askedFor}</h2>
              <BarList
                className="mt-5"
                rows={summary.asked.map((x) => ({ key: x.key, label: dict.asked[x.key].label, value: x.count, icon: ASKED_ICONS[x.key] }))}
                max={summary.count}
              />
            </div>
            <div className="card p-5 sm:p-6">
              <h2 className="t-h3">{t.losses}</h2>
              <p className="mt-2 text-muted t-small">{fmt(t.lossesSummary, { lost: summary.lostMoney, total: summary.count })}</p>
              <div className="mt-4">
                <LossBar
                  counts={summary.losses}
                  labels={Object.fromEntries(Object.entries(dict.loss).map(([k, v]) => [k, v.label])) as Record<keyof typeof dict.loss, string>}
                />
              </div>
            </div>
          </section>

          <section className="wrap pb-24 pt-10" aria-labelledby="stories-title">
            <h2 id="stories-title" className="t-h2">
              {t.stories}
            </h2>
            {stories.length === 0 ? (
              <p className="mt-4 text-muted">{t.noStories}</p>
            ) : (
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {stories.map((r) => {
                  const Icon = SCAM_ICONS[r.scam_type];
                  return (
                    <li key={r.id} className="card flex flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-2 text-[0.95rem]">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Icon className="h-4 w-4 text-alarm-ink" aria-hidden="true" />
                          {dict.scamTypes[r.scam_type].label}
                        </span>
                        <span className="text-muted" aria-hidden="true">
                          /
                        </span>
                        <TimeAgo iso={r.created_at} t={dict.time} className="text-muted" />
                        {r.is_sample && <SampleBadge label={dict.common.sample} />}
                      </div>
                      <blockquote lang={r.lang} dir="auto" className={cn('text-[1.125rem] leading-relaxed', r.lang === 'ur' && 'font-urdu text-[1.25rem] leading-[1.9]')}>
                        {r.story}
                      </blockquote>
                      <p className="text-muted t-small">{dict.loss[r.loss_band].card}</p>
                      <div className="mt-auto border-t border-line pt-2">
                        <FlagButton reportId={r.id} t={t.abuse} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}
