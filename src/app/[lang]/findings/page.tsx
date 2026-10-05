import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Ban, CircleDashed, FileText, Hourglass, MailX, PuzzleIcon, Volume2 } from 'lucide-react';
import { fmt, isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { methods, staff, survey } from '@/data/findings';
import { pageMetadata } from '@/lib/metadata';
import { cn } from '@/lib/cn';
import { PageShell } from '@/components/layout/PageShell';
import { HangBullet } from '@/components/brand/HangUp';
import { CountUp, InView } from '@/components/findings/Motion';
import { Legend, UnitChart } from '@/components/findings/UnitChart';
import { ShareLauncher } from '@/components/share/ShareLauncher';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: PageProps<'/[lang]/findings'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/findings', getDictionary(lang).meta.pages.findings);
}

/** One horizontal bar per row, value at the tip; grows when scrolled in. */
function Bars({ rows, max, color = 'bg-[var(--bar)]' }: { rows: { label: string; value: number; color?: string }[]; max: number; color?: string }) {
  return (
    <InView as="ul" className="grid gap-4">
      {rows.map((r) => (
        <li key={r.label} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-semibold">{r.label}</span>
            <CountUp value={r.value} className="font-display text-[1.25rem] font-extrabold" />
          </div>
          <div className="h-3" aria-hidden="true">
            <div className={cn('grow-bar h-full rounded-e-[4px]', r.color ?? color)} style={{ width: `${Math.max(r.value > 0 ? 1.5 : 0, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </InView>
  );
}

function Section({ id, title, children, className, sub }: { id: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('py-14 lg:py-20', className)}>
      <div className="wrap">
        <h2 id={id} className="t-h2 max-w-[20ch]">
          {title}
        </h2>
        {sub && <p className="t-lead mt-3 max-w-[52ch] text-muted">{sub}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export default async function FindingsPage({ params }: PageProps<'/[lang]/findings'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const f = dict.findings;
  const s = survey;

  const toldAnyone = s.told.familyOnly + s.told.officialChannel;
  const stages = [
    { label: f.gap.stages.all, value: s.n },
    { label: f.gap.stages.toldAnyone, value: toldAnyone },
    { label: f.gap.stages.official, value: s.told.officialChannel },
    { label: f.gap.stages.nccia, value: s.ncciaReports },
  ];
  const gapAria = [
    `${s.n}`,
    `${s.told.noOne} ${f.gap.split.noOne}`,
    `${s.told.familyOnly} ${f.gap.split.familyOnly}`,
    `${s.told.officialChannel} ${f.gap.split.official}`,
    `${s.ncciaReports} ${f.gap.split.ncciaOf}`,
  ].join(', ');

  const outcomeRows = [
    { key: 'acknowledgedOnly', value: s.outcomes.acknowledgedOnly },
    { key: 'noResponse', value: s.outcomes.noResponse },
    { key: 'adviceOnly', value: s.outcomes.adviceOnly },
    { key: 'stillWaiting', value: s.outcomes.stillWaiting },
    { key: 'other', value: s.outcomes.other },
  ] as const;

  const proposedLinks = [`/${lang}/tracker`, null, `/${lang}/check`, `/${lang}/report`];
  const proposedIcons = [Hourglass, Volume2, FileText, PuzzleIcon];

  return (
    <PageShell>
      {/* 1. Headline */}
      <section className="navy-block on-navy relative isolate overflow-hidden">
        <div className="wrap pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-20">
          <p className="t-label rise text-gold">{f.eyebrow}</p>
          <h1 className={cn('t-h1 rise mt-5 max-w-[20ch] text-offwhite', lang === 'ur' && 't-nastaliq text-[clamp(2.1rem,6vw+0.6rem,4.2rem)]')} style={{ ['--i' as string]: 1 }}>
            {f.title}
          </h1>
          <p className="t-lead rise mt-6 max-w-[54ch] text-offwhite/80" style={{ ['--i' as string]: 2 }}>
            {f.intro}
          </p>
          <div className="rise mt-8" style={{ ['--i' as string]: 3 }}>
            <ShareLauncher lang={lang} dict={dict} initialKind="stat" label={dict.share.open} className="btn btn-on-navy btn-lg" />
          </div>
        </div>
        <span aria-hidden="true" className="absolute -bottom-40 -end-32 -z-10 h-[420px] w-[420px] rounded-full bg-red opacity-[0.12]" />
      </section>

      {/* 2. The reporting gap */}
      <Section id="gap" title={f.gap.title} sub={f.gap.sub}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Bars rows={stages} max={s.n} />
            <div className="mt-4 grid gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{f.gap.stages.solved}</span>
                <span className="font-display text-[1.25rem] font-extrabold text-alarm-ink">0</span>
              </div>
              <div className="h-3 rounded-e-[4px] border-2 border-dashed border-alarm/60" aria-hidden="true" style={{ width: '100%' }} />
              <p className="text-muted t-small">{f.gap.solvedNote}</p>
            </div>
          </div>
          <div className="card p-5 sm:p-7">
            <InView>
              <UnitChart
                label={gapAria}
                columns={13}
                size="lg"
                groups={[
                  { kind: 'ring', count: s.told.noOne },
                  { kind: 'quiet', count: s.told.familyOnly },
                  { kind: 'ink', count: s.told.officialChannel - s.ncciaReports },
                  { kind: 'red', count: s.ncciaReports },
                ]}
              />
            </InView>
            <div className="mt-6">
              <Legend
                items={[
                  { kind: 'ring', count: s.told.noOne, label: f.gap.split.noOne },
                  { kind: 'quiet', count: s.told.familyOnly, label: f.gap.split.familyOnly },
                  { kind: 'ink', count: s.told.officialChannel, label: f.gap.split.official },
                  { kind: 'red', count: s.ncciaReports, label: f.gap.split.ncciaOf },
                ]}
              />
              <p className="mt-4 text-muted t-small">{f.gap.unitNote}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Outcomes */}
      <Section id="outcomes" title={f.outcomes.title} sub={f.outcomes.sub} className="bg-sunk">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <InView as="ul" className="grid gap-4">
            {outcomeRows.map((row) => (
              <li key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
                <span className="col-start-1 row-start-1 font-semibold">{f.outcomes.items[row.key]}</span>
                <span className="col-span-2 col-start-1 row-start-2 flex flex-wrap gap-[5px] sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden="true">
                  {Array.from({ length: row.value }, (_, i) => (
                    <span key={i} className="dot h-5 w-5 rounded-full bg-ink" style={{ ['--d' as string]: `${i * 40}ms` }} />
                  ))}
                </span>
                <span className="t-num col-start-2 row-start-1 justify-self-end font-bold sm:col-start-3">{row.value}</span>
              </li>
            ))}
            <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-line pt-4 sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
              <span className="col-start-1 row-start-1 font-bold text-alarm-ink">{f.outcomes.items.solved}</span>
              <span className="col-span-2 col-start-1 row-start-2 flex sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden="true">
                <span className="h-5 w-5 rounded-full border-2 border-dashed border-alarm" />
              </span>
              <span className="col-start-2 row-start-1 justify-self-end font-display text-[1.5rem] font-extrabold text-alarm-ink sm:col-start-3">0</span>
            </li>
          </InView>
          <div className="card-brand p-7 sm:p-9">
            <CircleDashed className="h-10 w-10 text-red" aria-hidden="true" />
            <p className="mt-5 font-display text-[2rem] font-extrabold leading-tight text-offwhite sm:text-[2.4rem]">{f.outcomes.solvedZero}</p>
          </div>
        </div>
      </Section>

      {/* 4. Why people don't report */}
      <Section id="why" title={f.whyNot.title} sub={f.whyNot.note}>
        <div className="max-w-3xl">
          <Bars
            max={s.whyNot.didntKnowWhere}
            rows={[
              { label: f.whyNot.items.didntKnowWhere, value: s.whyNot.didntKnowWhere },
              { label: f.whyNot.items.expectedNothing, value: s.whyNot.expectedNothing },
              { label: f.whyNot.items.tooMuchEffort, value: s.whyNot.tooMuchEffort },
              { label: f.whyNot.items.nothingLost, value: s.whyNot.nothingLost },
            ]}
          />
        </div>
      </Section>

      {/* 5. How the scam works */}
      <Section id="how" title={f.how.title} className="bg-sunk">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h3 className="t-h3">{f.how.pretendedTitle}</h3>
            <div className="mt-6">
              <Bars
                max={s.n}
                rows={[
                  { label: f.how.items.courier, value: s.pretended.courier },
                  { label: f.how.items.bankWallet, value: s.pretended.bankWallet },
                  { label: f.how.items.familyFriend, value: s.pretended.familyFriend },
                  { label: f.how.items.policeGovt, value: s.pretended.policeGovt },
                  { label: f.how.items.other, value: s.pretended.other },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { v: s.askedOtpPct, l: f.how.askedOtp, tone: 'text-alarm-ink' },
              { v: s.askedMoneyPct, l: f.how.askedMoney, tone: 'text-ink' },
              { v: s.callerKnewSomethingRealPct, l: f.how.knewReal, tone: 'text-ink' },
            ].map((stat) => (
              <div key={stat.l} className="card flex flex-col gap-2 p-5 lg:flex-row lg:items-center lg:gap-6">
                <CountUp value={stat.v} suffix="%" className={cn('font-display text-[3rem] font-extrabold leading-none tracking-tight lg:w-36 lg:shrink-0', stat.tone)} />
                <span className="text-ink-2">{stat.l}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 6. Loss */}
      <Section id="loss" title={f.loss.title}>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-display text-[2.4rem] font-extrabold leading-tight tracking-tight sm:text-[3rem]">
              {fmt(f.loss.headline, { lost: s.loss.lostMoney, n: s.n })}
            </p>
            <div className="mt-8">
              <Bars
                max={s.loss.lostMoney}
                rows={[
                  { label: f.loss.bands.under5k, value: s.loss.bands.under5k, color: 'bg-[var(--loss-1)]' },
                  { label: f.loss.bands.from5kTo25k, value: s.loss.bands.from5kTo25k, color: 'bg-[var(--loss-2)]' },
                  { label: f.loss.bands.from25kTo100k, value: s.loss.bands.from25kTo100k, color: 'bg-[var(--loss-3)]' },
                  { label: f.loss.bands.over100k, value: s.loss.bands.over100k, color: 'bg-[var(--loss-4)]' },
                ]}
              />
            </div>
          </div>
          <div className="card p-5 sm:p-7">
            <h3 className="t-h3">{f.loss.compareTitle}</h3>
            <div className="mt-6 grid gap-8">
              <div>
                <p className="font-semibold">{fmt(f.loss.complied, { lost: s.compliance.complied.lostMoney, n: s.compliance.complied.n })}</p>
                <InView className="mt-3">
                  <UnitChart
                    label={fmt(f.loss.complied, { lost: s.compliance.complied.lostMoney, n: s.compliance.complied.n })}
                    columns={15}
                    groups={[
                      { kind: 'red', count: s.compliance.complied.lostMoney },
                      { kind: 'ring', count: s.compliance.complied.n - s.compliance.complied.lostMoney },
                    ]}
                  />
                </InView>
              </div>
              <div>
                <p className="font-semibold">{fmt(f.loss.didNot, { lost: s.compliance.didNotComply.lostMoney, n: s.compliance.didNotComply.n })}</p>
                <InView className="mt-3">
                  <UnitChart
                    label={fmt(f.loss.didNot, { lost: s.compliance.didNotComply.lostMoney, n: s.compliance.didNotComply.n })}
                    columns={19}
                    size="sm"
                    groups={[
                      { kind: 'red', count: s.compliance.didNotComply.lostMoney },
                      { kind: 'ring', count: s.compliance.didNotComply.n - s.compliance.didNotComply.lostMoney },
                    ]}
                  />
                </InView>
              </div>
              <Legend
                items={[
                  { kind: 'red', label: f.loss.lostLegend },
                  { kind: 'ring', label: f.loss.keptLegend },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* 7. Staff: a separate, non-comparable sample */}
      <section aria-labelledby="staff" className="pb-14 lg:pb-20">
        <div className="wrap">
          <div className="rounded-[var(--radius-card)] border-2 border-dashed border-line-strong p-6 sm:p-9">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-soft px-3.5 py-1.5 font-bold text-amber-ink">
              <Ban className="h-4 w-4" aria-hidden="true" />
              {f.staff.note}
            </p>
            <h2 id="staff" className="t-h2 mt-5 max-w-[22ch]">
              {f.staff.title}
            </h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
              <InView>
                <UnitChart
                  label={fmt(f.staff.lost, { lost: staff.lostMoney, n: staff.n })}
                  columns={7}
                  size="lg"
                  className="max-w-[300px]"
                  groups={[
                    { kind: 'red', count: staff.lostMoney },
                    { kind: 'ring', count: staff.n - staff.lostMoney },
                  ]}
                />
                <div className="mt-4">
                  <Legend
                    items={[
                      { kind: 'red', label: f.loss.lostLegend, count: staff.lostMoney },
                      { kind: 'ring', label: f.loss.keptLegend, count: staff.n - staff.lostMoney },
                    ]}
                  />
                </div>
              </InView>
              <div className="grid gap-3 text-[1.0625rem]">
                <p>{f.staff.body}</p>
                <p className="font-semibold">{fmt(f.staff.lost, { lost: staff.lostMoney, n: staff.n })}</p>
                <p className="font-semibold text-alarm-ink">{f.staff.nccia}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Our own experience */}
      <section aria-labelledby="experience" className="navy-block on-navy py-14 lg:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <h2 id="experience" className="t-h2 text-offwhite">
              {f.experience.title}
            </h2>
            <p className="t-lead mt-4 text-offwhite/80">{f.experience.body}</p>
          </div>
          <ol className="grid gap-0">
            {f.experience.steps.map((step, i) => {
              const last = i === f.experience.steps.length - 1;
              const Icon = i === 0 ? FileText : i === 1 ? PuzzleIcon : i === 2 ? MailX : CircleDashed;
              return (
                <li key={step} className="relative flex items-center gap-4 pb-6 last:pb-0">
                  {!last && <span aria-hidden="true" className="absolute start-[23px] top-12 h-[calc(100%-3rem)] w-0.5 bg-offwhite/15" />}
                  <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full', last ? 'border-2 border-dashed border-red text-red' : i === 0 ? 'bg-offwhite/10 text-offwhite' : 'bg-red/20 text-red')}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className={cn('text-[1.2rem] font-bold', last ? 'text-red' : 'text-offwhite')}>{step}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 9. Recommendations */}
      <Section id="recs" title={f.recs.title}>
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-sunk px-4 py-1.5 font-bold">
          <span className="hang-bullet" aria-hidden="true" />
          {f.recs.label}
        </p>
        <ol className="grid gap-3 md:grid-cols-2">
          {f.recs.items.map((rec, i) => (
            <li key={rec} className={cn('card reveal flex gap-4 p-5', i === f.recs.items.length - 1 && 'md:col-span-2')}>
              <span className="t-num grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-bg">{i + 1}</span>
              <span className="pt-1.5 text-[1.0625rem] font-semibold">{rec}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 10. Proposed for NCCIA */}
      <Section id="proposed" title={f.proposed.title} sub={f.proposed.sub} className="bg-sunk">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {f.proposed.items.map((item, i) => {
            const Icon = proposedIcons[i]!;
            const href = proposedLinks[i];
            return (
              <li key={item.title} className="card flex flex-col p-5">
                <span className="badge-sample w-fit">{dict.common.proposedForNccia}</span>
                <Icon className="mt-5 h-7 w-7 text-alarm-ink" aria-hidden="true" />
                <h3 className="t-h3 mt-3">{item.title}</h3>
                <p className="mt-2 flex-1 text-ink-2">{item.body}</p>
                {href && item.cta && (
                  <Link href={href} className="link mt-4 inline-flex items-center gap-1.5 font-semibold">
                    {item.cta}
                    <ArrowRight className="mirror-rtl h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 11. Methods */}
      <section aria-labelledby="methods" className="py-14 lg:py-20">
        <div className="wrap-narrow">
          <h2 id="methods" className="t-h3">
            {f.methods.title}
          </h2>
          <dl className="mt-6 grid gap-4">
            {f.methods.items.map((m) => (
              <div key={m.label}>
                <dt className="flex items-center gap-3 font-bold">
                  <HangBullet />
                  {m.label}
                </dt>
                <dd className="ps-[1.6rem] text-ink-2">{fmt(m.body, { period: methods.surveyPeriod, course: methods.course })}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PageShell>
  );
}
