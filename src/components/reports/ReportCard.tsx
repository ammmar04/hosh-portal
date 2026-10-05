import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { PublicReport } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ASKED_ICONS, SCAM_ICONS } from '@/components/icons';
import { Ltr } from '@/components/ui/Ltr';
import { TimeAgo } from '@/components/ui/TimeAgo';
import type { ReportLabels } from './labels';

export function SampleBadge({ label }: { label: string }) {
  return <span className="badge-sample">{label}</span>;
}

/** Compact card for lists: number, scam type, what was asked, time. Links to the number page. */
export function ReportCard({
  report,
  labels,
  lang,
  className,
  fresh = false,
}: {
  report: PublicReport;
  labels: ReportLabels;
  lang: Lang;
  className?: string;
  fresh?: boolean;
}) {
  const TypeIcon = SCAM_ICONS[report.scam_type];
  return (
    <Link
      href={`/${lang}/n/${encodeURIComponent(report.number_norm)}`}
      className={cn(
        'card group relative flex flex-col gap-2.5 p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)] sm:p-5',
        fresh && 'arrive',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Ltr mono className="text-[1.25rem] font-bold leading-tight tracking-tight">
          {report.number_display}
        </Ltr>
        <TimeAgo iso={report.created_at} t={labels.time} className="t-small shrink-0 pt-0.5 text-muted" />
      </div>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="inline-flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-alarm-soft text-alarm-ink">
            <TypeIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          {labels.scamTypes[report.scam_type].label}
        </span>
        {report.is_sample && <SampleBadge label={labels.sample} />}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="sr-only">{labels.askedFor}:</span>
        {report.asked.map((a) => {
          const Icon = ASKED_ICONS[a];
          return (
            <span key={a} className="chip-static">
              <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
              {labels.asked[a].label}
            </span>
          );
        })}
      </div>
      <ChevronRight
        className="mirror-rtl absolute bottom-4 end-4 h-5 w-5 text-muted opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
