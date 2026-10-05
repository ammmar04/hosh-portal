import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';

export function ReportCta({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const c = dict.home.reportCta;
  return (
    <section className="wrap pb-6" aria-labelledby="report-cta-title">
      <div className="card-brand reveal relative isolate overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-14">
        <div className="relative max-w-2xl">
          <h2 id="report-cta-title" className="t-h2 text-offwhite">
            {c.title}
          </h2>
          <p className="t-lead mt-4 text-offwhite/75">{c.sub}</p>
        </div>
        <Link href={`/${lang}/report`} className="btn btn-alarm btn-xl relative mt-8 w-full gap-3 sm:w-auto lg:mt-0 lg:shrink-0">
          {c.button}
          <ArrowRight className="mirror-rtl h-6 w-6" aria-hidden="true" />
        </Link>
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -end-24 -z-10 h-72 w-72 rounded-full bg-red opacity-[0.14] sm:h-96 sm:w-96 lg:-bottom-40 lg:-end-16" />
      </div>
    </section>
  );
}
