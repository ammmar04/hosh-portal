import Link from 'next/link';
import { ArrowUpRight, ShieldAlert } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CONTACTS } from '@/data/contacts';
import { HoshLogo } from '@/components/brand/HoshLogo';
import { Ltr } from '@/components/ui/Ltr';

export function Footer({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const f = dict.footer;
  const nav = dict.nav;
  const ig = CONTACTS.instagram;
  const links: [string, string][] = [
    ['/check', nav.check],
    ['/report', nav.report],
    ['/message-check', nav.message],
    ['/learn', nav.learn],
    ['/findings', nav.findings],
    ['/tracker', nav.tracker],
  ];
  const help: [string, string][] = [
    ['/now', dict.fab.label],
    ['/how-to-report', nav.howTo],
    ['/about', f.about],
    ['/about#privacy', f.privacy],
  ];

  return (
    <footer className="navy-block on-navy relative overflow-hidden pb-28 pt-14 lg:pt-20">
      <div className="wrap relative grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div className="flex flex-col gap-6">
          <HoshLogo variant="full" className="w-[240px] text-offwhite" />
          <div className="flex flex-wrap gap-2">
            <a href={CONTACTS.police_emergency.href} className="btn btn-on-navy min-h-12 px-4 text-[0.95rem]">
              {f.emergency} <Ltr mono className="font-bold text-gold">15</Ltr>
            </a>
            <a href={CONTACTS.nccia_helpline.href} className="btn btn-on-navy min-h-12 px-4 text-[0.95rem]">
              {f.cyber} <Ltr mono className="font-bold text-gold">1799</Ltr>
            </a>
          </div>
        </div>

        <nav aria-label={f.explore}>
          <h2 className="t-label mb-4 text-haze">{f.explore}</h2>
          <ul className="grid gap-1">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={`/${lang}${href}`} className="inline-flex min-h-11 items-center font-semibold text-offwhite/85 hover:text-offwhite">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={f.help}>
          <h2 className="t-label mb-4 text-haze">{f.help}</h2>
          <ul className="grid gap-1">
            {help.map(([href, label]) => (
              <li key={href}>
                <Link href={`/${lang}${href}`} className="inline-flex min-h-11 items-center font-semibold text-offwhite/85 hover:text-offwhite">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={ig.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-offwhite/85 hover:text-offwhite"
              >
                {f.instagram} <Ltr>{ig.value}</Ltr>
                <ArrowUpRight className="mirror-rtl h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{dict.common.opensInNewTab}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="wrap relative mt-14">
        <div className="flex flex-col gap-3 border-t border-offwhite/12 pt-6 text-[0.9375rem] leading-relaxed text-haze">
          <p className="flex items-start gap-2.5 text-offwhite/90">
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <span>{f.notice}</span>
          </p>
          <p>{f.affiliation}</p>
        </div>
      </div>

      {/* Oversized brand circle bleeding off the corner */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -end-40 h-[420px] w-[420px] rounded-full bg-red opacity-[0.07]" />
    </footer>
  );
}
