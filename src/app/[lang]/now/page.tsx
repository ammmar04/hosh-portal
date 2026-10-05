import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { KeyRound, Landmark, PhoneCall, PhoneOff, WifiOff, type LucideIcon } from 'lucide-react';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { CONTACTS } from '@/data/contacts';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { HangUpCircle } from '@/components/brand/HangUp';
import { ListenInUrdu } from '@/components/ui/ListenInUrdu';
import { TriageFlow } from '@/components/now/TriageFlow';

// Fully static: this page must load instantly and keep working offline.
export const dynamic = 'force-static';

const ICONS: LucideIcon[] = [PhoneOff, KeyRound, Landmark, PhoneCall];

export async function generateMetadata({ params }: PageProps<'/[lang]/now'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/now', getDictionary(lang).meta.pages.now);
}

export default async function NowPage({ params }: PageProps<'/[lang]/now'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.now;
  const helpline = CONTACTS.nccia_helpline;

  return (
    <PageShell className="navy-block on-navy min-h-[calc(100dvh-64px)]">
      <div className="wrap-narrow pb-24 pt-6 sm:pt-10">
        <div className="flex items-center gap-4">
          <ViewTransition name="hangup-circle" share="hangup-morph" default="none">
            <HangUpCircle className="h-16 w-16 sm:h-20 sm:w-20" />
          </ViewTransition>
          <h1 className="text-[1.875rem] font-extrabold leading-[1.05] tracking-tight font-display sm:text-[2.5rem]">{t.title}</h1>
        </div>
        <p className="mt-4 text-[1.125rem] font-semibold text-offwhite/80">{t.sub}</p>

        <ol className="mt-6 grid gap-3">
          {t.steps.map((step, i) => {
            const Icon = ICONS[i]!;
            const last = i === t.steps.length - 1;
            return (
              <li key={i} className="now-step rise rounded-[24px] bg-offwhite/[0.06] p-4 ring-1 ring-offwhite/10 sm:p-5" style={{ ['--i' as string]: i }}>
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-red text-white" aria-hidden="true">
                    <span className="t-num text-[1.6rem] font-bold">{i + 1}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.6rem] font-extrabold leading-[1.1] font-display sm:text-[1.9rem]">{step.title}</p>
                    <p className="mt-1 text-[1rem] leading-snug text-offwhite/70">{step.detail}</p>
                  </div>
                  <Icon className="hidden h-8 w-8 shrink-0 text-offwhite/60 xs:block" aria-hidden="true" />
                </div>
                {last && (
                  <a href={helpline.href} className="btn btn-amber btn-xl mt-4 w-full gap-3">
                    <PhoneCall className="h-6 w-6" aria-hidden="true" />
                    {t.call1799}
                  </a>
                )}
              </li>
            );
          })}
        </ol>

        <TriageFlow lang={lang} t={t} contactNames={dict.contacts} opensInNewTab={dict.common.opensInNewTab} />

        <div className="mt-8 flex flex-col items-start gap-4">
          <ListenInUrdu label={dict.common.listenInUrdu} tooltip={dict.common.listenTooltip} badge={dict.common.proposedForNccia} onNavy />
          <p className="flex items-center gap-2 text-[0.95rem] text-offwhite/60">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t.offlineNote}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
