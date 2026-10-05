import Link from 'next/link';
import { ViewTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { cn } from '@/lib/cn';
import { HangUpCircle } from '@/components/brand/HangUp';
import { ListenInUrdu } from '@/components/ui/ListenInUrdu';

export function Hero({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const h = dict.home.hero;
  return (
    <section className="navy-block on-navy relative isolate overflow-hidden">
      {/* Concentric guide rings echoing the logo's O, very faint */}
      <div aria-hidden="true" className="hero-rings pointer-events-none absolute -z-10" />

      <div className="wrap grid items-center gap-x-16 gap-y-10 pb-16 pt-9 sm:pt-14 lg:min-h-[calc(88dvh-72px)] lg:grid-cols-[1.25fr_0.75fr] lg:pb-20 lg:pt-12">
        <div>
          <h1 className={cn('t-display text-offwhite', lang === 'ur' && 'hero-urdu')}>
            <span className="rise block" style={{ ['--i' as string]: 0 }}>
              {h.line1}
            </span>
            <span className="rise block text-red" style={{ ['--i' as string]: 1 }}>
              {h.line2}
            </span>
          </h1>
          <p className="rise t-lead mt-6 max-w-[32ch] text-offwhite/80 lg:mt-8" style={{ ['--i' as string]: 2 }}>
            {h.sub}
          </p>
          <div className="rise mt-7 hidden lg:flex" style={{ ['--i' as string]: 3 }}>
            <ListenInUrdu label={dict.common.listenInUrdu} tooltip={dict.common.listenTooltip} badge={dict.common.proposedForNccia} onNavy />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Link
            id="hero-now"
            href={`/${lang}/now`}
            className="hero-now group flex flex-col items-center gap-6 rounded-[40px] p-2 text-center"
          >
            <span className="hero-now-circle relative grid aspect-square w-[min(64vw,300px)] place-items-center lg:w-[min(30vw,340px)]">
              <ViewTransition name="hangup-circle" share="hangup-morph" default="none">
                <HangUpCircle ring className="pulse-soft h-full w-full drop-shadow-[0_24px_50px_rgb(229_72_77/0.45)]" />
              </ViewTransition>
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center gap-2 text-[1.5rem] font-extrabold leading-tight text-offwhite sm:text-[1.75rem]">
                {h.now}
                <ArrowRight className="mirror-rtl h-6 w-6 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true" />
              </span>
              <span className="text-[1rem] text-offwhite/70">{h.nowHint}</span>
            </span>
          </Link>
          <div className="mt-6 lg:hidden">
            <ListenInUrdu label={dict.common.listenInUrdu} tooltip={dict.common.listenTooltip} badge={dict.common.proposedForNccia} onNavy />
          </div>
        </div>
      </div>
    </section>
  );
}
