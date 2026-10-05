import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { survey } from '@/data/findings';

/** The headline finding, with two tiny unit charts: 91 people, and 17 empty "solved" slots. */
export function WhyStrip({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const w = dict.home.why;
  const toldNoOne = survey.told.noOne;
  return (
    <section className="bg-sunk py-16 lg:py-24" aria-labelledby="why-title">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <p className="t-label text-alarm-ink">{dict.findings.eyebrow}</p>
          <h2 id="why-title" className="t-h2 reveal mt-4 max-w-[18ch]">
            {w.title}
          </h2>
          <Link href={`/${lang}/findings`} className="btn btn-ink btn-lg mt-8">
            {w.link}
            <ArrowRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5">
          <figure className="card p-6 sm:p-7">
            <div dir="ltr" className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[5px]" aria-hidden="true">
              {Array.from({ length: survey.n }, (_, i) => (
                <span key={i} className={i < toldNoOne ? 'aspect-square rounded-full bg-ink' : 'aspect-square rounded-full bg-line-strong'} />
              ))}
            </div>
            <figcaption className="mt-5">
              <span className="block font-display text-[2.4rem] font-extrabold leading-none tracking-tight">{w.stat1.value}</span>
              <span className="mt-2 block text-ink-2">{w.stat1.label}</span>
            </figcaption>
          </figure>

          <figure className="card p-6 sm:p-7">
            <div dir="ltr" className="flex flex-wrap gap-[7px]" aria-hidden="true">
              {Array.from({ length: survey.outcomes.n }, (_, i) => (
                <span key={i} className="h-5 w-5 rounded-full border-2 border-dashed border-line-strong" />
              ))}
            </div>
            <figcaption className="mt-5">
              <span className="block font-display text-[2.4rem] font-extrabold leading-none tracking-tight text-alarm-ink">{w.stat2.value}</span>
              <span className="mt-2 block text-ink-2">{w.stat2.label}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
