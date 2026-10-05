import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronDown, ClipboardCheck, Globe, Landmark, PhoneCall, Siren, Smartphone, type LucideIcon } from 'lucide-react';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { CONTACTS, type ContactId } from '@/data/contacts';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { HangBullet } from '@/components/brand/HangUp';
import { ContactAction, SourceLink } from '@/components/ui/ContactAction';
import { ListenInUrdu } from '@/components/ui/ListenInUrdu';

// Static so the service worker can keep it for offline use.
export const dynamic = 'force-static';

type ChannelKey = 'nccia' | 'helpline' | 'bank' | 'police' | 'pta';

const CHANNELS: { key: ChannelKey; icon: LucideIcon; actions: ContactId[]; sources: ContactId[] }[] = [
  { key: 'nccia', icon: Globe, actions: ['nccia_portal'], sources: ['nccia_portal'] },
  { key: 'helpline', icon: PhoneCall, actions: ['nccia_helpline'], sources: ['nccia_helpline'] },
  { key: 'bank', icon: Landmark, actions: ['jazzcash_helpline', 'jazzcash_uan', 'easypaisa_helpline', 'sbp_sunwai', 'banking_mohtasib'], sources: ['jazzcash_helpline', 'easypaisa_helpline', 'sbp_sunwai'] },
  { key: 'police', icon: Siren, actions: ['police_emergency'], sources: ['police_emergency'] },
  { key: 'pta', icon: Smartphone, actions: ['pta_complaint', 'pta_status', 'pta_helpline', 'pta_sim_sms'], sources: ['pta_helpline', 'pta_sim_sms'] },
];

export async function generateMetadata({ params }: PageProps<'/[lang]/how-to-report'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/how-to-report', getDictionary(lang).meta.pages.howTo);
}

export default async function HowToReportPage({ params }: PageProps<'/[lang]/how-to-report'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const h = dict.howTo;

  return (
    <PageShell>
      <section className="wrap pb-10 pt-8 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="t-h1 max-w-[16ch]">{h.title}</h1>
            <p className="t-lead mt-4 max-w-[46ch] text-muted">{h.sub}</p>
            <div className="mt-6">
              <ListenInUrdu label={dict.common.listenInUrdu} tooltip={dict.common.listenTooltip} badge={dict.common.proposedForNccia} />
            </div>
          </div>
          <div className="card-brand p-6 sm:p-7">
            <h2 className="flex items-center gap-2 text-[1.125rem] font-bold text-offwhite">
              <ClipboardCheck className="h-5 w-5 text-gold" aria-hidden="true" />
              {h.prepareTitle}
            </h2>
            <ul className="mt-4 grid gap-2.5">
              {h.prepare.map((item) => (
                <li key={item} className="flex items-baseline gap-3 text-offwhite/90">
                  <HangBullet />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap pb-12" aria-label={h.title}>
        <div className="grid gap-3">
          {CHANNELS.map(({ key, icon: Icon, actions, sources }, i) => {
            const ch = h.channels[key];
            return (
              <details key={key} className="channel card group overflow-hidden" open={i === 0}>
                <summary className="flex min-h-[76px] items-center gap-4 p-5 sm:px-7">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-alarm-soft text-alarm-ink">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.25rem] font-extrabold leading-snug font-display">{ch.name}</span>
                    <span className="mt-0.5 block text-muted t-small">{ch.tag}</span>
                  </span>
                  <ChevronDown className="h-6 w-6 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="border-t border-line px-5 pb-6 pt-5 sm:px-7">
                  <dl className="grid gap-5 md:grid-cols-3">
                    {(
                      [
                        [h.whenLabel, ch.when],
                        [h.prepareLabel, ch.prepare],
                        [h.expectLabel, ch.expect],
                      ] as const
                    ).map(([label, text]) => (
                      <div key={label}>
                        <dt className="t-label text-alarm-ink">{label}</dt>
                        <dd className="mt-2 text-ink-2">{text}</dd>
                      </div>
                    ))}
                  </dl>
                  {key === 'bank' && <p className="mt-6 font-bold">{h.walletsTitle}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {actions.map((id, j) => (
                      <ContactAction
                        key={id}
                        contact={CONTACTS[id]}
                        label={dict.contacts[id].short}
                        checkOfficial={dict.common.checkOfficialSite}
                        newTab={dict.common.opensInNewTab}
                        variant={j === 0 ? (key === 'police' ? 'alarm' : key === 'helpline' ? 'amber' : 'ink') : 'ghost'}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                    {sources.map((id) => (
                      <SourceLink key={id} contact={CONTACTS[id]} label={dict.common.verifiedSource} />
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="bg-sunk py-16 lg:py-20" aria-labelledby="good-title">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="good-title" className="t-h2 max-w-[18ch]">
              {h.goodTitle}
            </h2>
            <p className="t-lead mt-4 text-ink-2">{h.goodBody}</p>
            <ul className="mt-6 grid gap-2.5">
              {h.goodPoints.map((pt) => (
                <li key={pt} className="flex items-baseline gap-3 font-semibold">
                  <HangBullet />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <figure className="mx-auto w-full max-w-[360px]">
            <div className="rounded-[34px] bg-navy p-3 shadow-[var(--shadow-2)]">
              <div className="rounded-[26px] bg-[#0b0a1c] px-4 pb-8 pt-5">
                <div className="mx-auto h-1.5 w-16 rounded-full bg-offwhite/15" aria-hidden="true" />
                <div className="mt-6 max-w-[88%] rounded-[20px] rounded-ss-md bg-navy-3 p-4 text-[1rem] leading-relaxed text-offwhite">{h.goodMockSms}</div>
              </div>
            </div>
            <figcaption className="mt-3 text-center font-semibold text-amber-ink">{h.goodMockLabel}</figcaption>
          </figure>
        </div>
      </section>
    </PageShell>
  );
}
