import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, AudioLines, Banknote, Briefcase, Gift, Landmark, MessageCircleWarning, Package, Siren, Share2, ShieldCheck, Target, type LucideIcon } from 'lucide-react';
import { fmt, isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { CONTACTS } from '@/data/contacts';
import { pageMetadata } from '@/lib/metadata';
import type { CardKind } from '@/lib/share-card';
import { cn } from '@/lib/cn';
import { PageShell } from '@/components/layout/PageShell';
import { Rules } from '@/components/home/Rules';
import { ShareLauncher } from '@/components/share/ShareLauncher';
import { HangUpCircle } from '@/components/brand/HangUp';
import { Ltr } from '@/components/ui/Ltr';

const SCRIPT_ICONS: LucideIcon[] = [Package, Siren, Gift, Briefcase, Landmark, MessageCircleWarning, AudioLines];

export async function generateMetadata({ params }: PageProps<'/[lang]/learn'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/learn', getDictionary(lang).meta.pages.learn);
}

export default async function LearnPage({ params }: PageProps<'/[lang]/learn'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const l = dict.learn;
  const ig = CONTACTS.instagram;

  const tiles: { kind: CardKind; title: string; accent?: string; sub?: string }[] = [
    { kind: 'tagline', title: dict.home.hero.line1, accent: dict.home.hero.line2 },
    { kind: 'rule1', title: dict.rules[0]!.title, sub: fmt(dict.share.card.ruleLabel, { n: 1 }) },
    { kind: 'rule2', title: dict.rules[1]!.title, sub: fmt(dict.share.card.ruleLabel, { n: 2 }) },
    { kind: 'rule3', title: dict.rules[2]!.title, sub: fmt(dict.share.card.ruleLabel, { n: 3 }) },
    { kind: 'stat', title: dict.share.card.statLine1, accent: dict.share.card.statLine2 },
  ];

  return (
    <PageShell>
      <section className="wrap pb-12 pt-8 sm:pt-12">
        <h1 className="t-h1 max-w-[14ch]">{l.title}</h1>
        <p className="t-lead mt-4 max-w-[48ch] text-muted">{l.sub}</p>
      </section>

      <section className="wrap pb-16" aria-labelledby="rules-title">
        <h2 id="rules-title" className="t-h2">
          {l.rulesTitle}
        </h2>
        <div className="mt-8">
          <Rules lang={lang} dict={dict} showStories />
        </div>
      </section>

      <section className="bg-sunk py-16 lg:py-24" aria-labelledby="scripts-title">
        <div className="wrap">
          <h2 id="scripts-title" className="t-h2 max-w-[18ch]">
            {l.scriptsTitle}
          </h2>
          <p className="t-lead mt-3 text-muted">{l.scriptsSub}</p>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {l.scripts.map((s, i) => {
              const Icon = SCRIPT_ICONS[i] ?? Target;
              const featured = i === l.scripts.length - 1;
              return (
                <li key={s.name} className={cn('card reveal flex flex-col p-5 sm:p-7', featured && 'md:col-span-2')}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-alarm-soft text-alarm-ink">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="t-h3">{s.name}</h3>
                  </div>
                  <div className={cn('mt-5 grid gap-4', featured && 'md:grid-cols-[1.2fr_1fr] md:gap-8')}>
                    <figure>
                      <figcaption className="t-label text-muted">{l.say}</figcaption>
                      <blockquote className="speech mt-2 text-[1.0625rem] font-semibold leading-relaxed">{s.say}</blockquote>
                    </figure>
                    <dl className="grid gap-3">
                      <div>
                        <dt className="flex items-center gap-2.5 font-bold">
                          <Banknote className="h-5 w-5 shrink-0 text-amber-ink" aria-hidden="true" />
                          {l.want}
                        </dt>
                        <dd className="ps-[1.875rem] text-ink-2">{s.want}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-2.5 font-bold">
                          <ShieldCheck className="h-5 w-5 shrink-0 text-safe" aria-hidden="true" />
                          {l.do}
                        </dt>
                        <dd className="ps-[1.875rem] text-ink-2">{s.do}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-24" aria-labelledby="share-title">
        <div className="wrap">
          <h2 id="share-title" className="t-h2">
            {l.shareTitle}
          </h2>
          <p className="t-lead mt-3 max-w-[48ch] text-muted">{l.shareSub}</p>
          <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {tiles.map((tile) => (
              <li key={tile.kind} className="w-[68%] shrink-0 snap-start sm:w-auto">
                <ShareLauncher lang={lang} dict={dict} initialKind={tile.kind} label={`${dict.share.open}: ${dict.share.kinds[tile.kind]}`} className="share-tile group block w-full text-start">
                  <span className="relative flex aspect-square flex-col justify-between overflow-hidden rounded-[22px] bg-navy p-4 text-offwhite ring-1 ring-offwhite/10 transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-[0.98]">
                    <span className="flex items-center justify-between">
                      <span className="text-[0.8rem] font-bold text-gold">{tile.sub ?? 'HOSH'}</span>
                      <Share2 className="h-4 w-4 opacity-70" aria-hidden="true" />
                    </span>
                    <span className="relative z-10 font-display text-[1.15rem] font-extrabold leading-tight">
                      {tile.title}
                      {tile.accent && <span className="mt-1 block text-red">{tile.accent}</span>}
                    </span>
                    <HangUpCircle className="absolute -bottom-8 -end-8 h-24 w-24 opacity-90" />
                  </span>
                  <span className="mt-2 block text-center font-semibold">{dict.share.kinds[tile.kind]}</span>
                </ShareLauncher>
              </li>
            ))}
          </ul>

          <a href={ig.href} target="_blank" rel="noopener noreferrer" className="card-brand group mt-10 flex items-center gap-5 p-6 sm:p-8">
            <HangUpCircle className="h-14 w-14 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[1.25rem] font-extrabold text-offwhite">
                {l.instagramTitle} <Ltr className="text-gold">{ig.value}</Ltr>
              </span>
              <span className="block text-offwhite/75">{l.instagramBody}</span>
            </span>
            <ArrowUpRight className="mirror-rtl h-6 w-6 shrink-0 text-offwhite transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
            <span className="sr-only">{dict.common.opensInNewTab}</span>
          </a>
        </div>
      </section>
    </PageShell>
  );
}
