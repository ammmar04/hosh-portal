import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Globe, Landmark, PhoneCall } from 'lucide-react';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { CONTACTS } from '@/data/contacts';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { HangUpCircle } from '@/components/brand/HangUp';
import { Ltr } from '@/components/ui/Ltr';
import { ThanksView } from '@/components/report/ThanksView';
import { cardCopy } from '@/components/share/types';

export async function generateMetadata({ params }: PageProps<'/[lang]/report/thanks'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/report/thanks', getDictionary(lang).meta.pages.thanks, { noindex: true });
}

export default async function ThanksPage({ params }: PageProps<'/[lang]/report/thanks'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const th = dict.thanks;
  const c = CONTACTS;

  const external = (
    <>
      <ArrowUpRight className="mirror-rtl h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{dict.common.opensInNewTab}</span>
    </>
  );

  return (
    <PageShell>
      <section className="navy-block on-navy relative isolate overflow-hidden">
        <div className="wrap pb-14 pt-10 sm:pt-14">
          <HangUpCircle className="rise h-14 w-14" />
          <h1 className="t-h1 rise mt-6 max-w-[16ch] text-offwhite" style={{ ['--i' as string]: 1 }}>
            {th.title}
          </h1>
          <p className="t-lead rise mt-5 max-w-[46ch] text-offwhite/80" style={{ ['--i' as string]: 2 }}>
            {th.sub}
          </p>
        </div>
      </section>

      <section className="wrap pb-6 pt-10" aria-labelledby="ways-title">
        <h2 id="ways-title" className="t-h2">
          {th.waysTitle}
        </h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          <li className="card flex flex-col p-5 sm:p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-alarm-soft text-alarm-ink">
              <Globe className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="t-h3 mt-4">{th.nccia.title}</h3>
            <p className="mt-2 flex-1 text-ink-2">{th.nccia.body}</p>
            <a href={c.nccia_portal.href} target="_blank" rel="noopener noreferrer" className="btn btn-ink mt-5 w-full">
              {dict.contacts.nccia_portal.short}
              {external}
            </a>
            <p className="mt-2 text-center text-muted t-small">
              <Ltr>{c.nccia_portal.value}</Ltr>
            </p>
          </li>
          <li className="card flex flex-col p-5 sm:p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-soft text-amber-ink">
              <PhoneCall className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="t-h3 mt-4">{th.helpline.title}</h3>
            <p className="mt-2 flex-1 text-ink-2">{th.helpline.body}</p>
            <a href={c.nccia_helpline.href} className="btn btn-amber mt-5 w-full">
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
              {dict.contacts.nccia_helpline.short}
            </a>
          </li>
          <li className="card flex flex-col p-5 sm:p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-sunk">
              <Landmark className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="t-h3 mt-4">{th.bank.title}</h3>
            <p className="mt-2 flex-1 text-ink-2">{th.bank.body}</p>
            <div className="mt-5 grid gap-2">
              <a href={c.jazzcash_helpline.href} className="btn btn-ghost min-h-12 w-full">
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                {dict.contacts.jazzcash_helpline.short}
              </a>
              <a href={c.easypaisa_helpline.href} className="btn btn-ghost min-h-12 w-full">
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                <bdi>{dict.contacts.easypaisa_helpline.short}</bdi>
              </a>
            </div>
            <a href={c.sbp_sunwai.href} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-flex items-center gap-1 text-[0.95rem] font-semibold">
              {th.bank.escalate}
              {external}
            </a>
          </li>
        </ol>
      </section>

      <section className="wrap pb-24 pt-6">
        <ThanksView
          lang={lang}
          t={{ thanks: th, scamTypes: dict.scamTypes, asked: dict.asked, loss: dict.loss, time: dict.time, listSep: dict.common.listSep }}
          share={{
            lang,
            copy: { en: cardCopy(getDictionary('en')), ur: cardCopy(getDictionary('ur')) },
            ui: dict.share,
            closeLabel: dict.common.close,
          }}
        />
      </section>
    </PageShell>
  );
}
