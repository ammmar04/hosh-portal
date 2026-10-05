import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Mail, ShieldAlert } from 'lucide-react';
import { fmt, isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { CONTACTS } from '@/data/contacts';
import { pageMetadata } from '@/lib/metadata';
import { TAKEDOWN_EMAIL } from '@/lib/site';
import { PageShell } from '@/components/layout/PageShell';
import { HoshLogo } from '@/components/brand/HoshLogo';
import { HangBullet } from '@/components/brand/HangUp';
import { Ltr } from '@/components/ui/Ltr';

export async function generateMetadata({ params }: PageProps<'/[lang]/about'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/about', getDictionary(lang).meta.pages.about);
}

export default async function AboutPage({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const a = dict.about;
  const ig = CONTACTS.instagram;

  return (
    <PageShell>
      <section className="navy-block on-navy">
        <div className="wrap grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:pb-20">
          <div>
            <h1 className="t-h1 text-offwhite">{a.title}</h1>
            <p className="t-lead mt-5 max-w-[50ch] text-offwhite/80">{a.who.body}</p>
          </div>
          <HoshLogo variant="full" className="w-full max-w-[300px] text-offwhite lg:justify-self-end" />
        </div>
      </section>

      <div className="wrap-narrow grid gap-14 pb-24 pt-14">
        <section aria-labelledby="why">
          <h2 id="why" className="t-h2">
            {a.why.title}
          </h2>
          <p className="t-lead mt-4 text-ink-2">{a.why.body}</p>
        </section>

        <section aria-labelledby="disclaimer" className="rounded-[var(--radius-card)] bg-amber-soft p-6 sm:p-8">
          <h2 id="disclaimer" className="flex items-center gap-3 t-h3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-amber-ink" aria-hidden="true" />
            {a.disclaimer.title}
          </h2>
          <p className="mt-3 text-[1.0625rem] font-semibold">{a.disclaimer.body}</p>
        </section>

        <section aria-labelledby="privacy-title" id="privacy" className="scroll-mt-28">
          <h2 id="privacy-title" className="t-h2">
            {a.privacy.title}
          </h2>
          <ul className="mt-6 grid gap-4">
            {a.privacy.items.map((item) => (
              <li key={item} className="flex gap-3">
                <HangBullet className="mt-2.5" />
                <span className="text-[1.0625rem] text-ink-2">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="takedown">
          <h2 id="takedown" className="t-h2">
            {a.takedown.title}
          </h2>
          <p className="t-lead mt-4 text-ink-2">{a.takedown.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {TAKEDOWN_EMAIL && (
              <a href={`mailto:${TAKEDOWN_EMAIL}`} className="btn btn-ink btn-lg">
                <Mail className="h-5 w-5" aria-hidden="true" />
                {fmt(a.takedown.email, { email: '' })}
                <Ltr>{TAKEDOWN_EMAIL}</Ltr>
              </a>
            )}
            <a href={ig.href} target="_blank" rel="noopener noreferrer" className={TAKEDOWN_EMAIL ? 'btn btn-ghost btn-lg' : 'btn btn-ink btn-lg'}>
              {a.takedown.instagram} <Ltr>{ig.value}</Ltr>
              <ArrowUpRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{dict.common.opensInNewTab}</span>
            </a>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
