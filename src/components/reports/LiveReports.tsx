'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ShieldAlert } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { PublicReport } from '@/lib/types';
import { timeAgo } from '@/lib/time';
import { ReportCard } from './ReportCard';
import type { ReportLabels } from './labels';

type Text = {
  title: string;
  sub: string;
  empty: string;
  live: string;
  tickerLabel: string;
  unverified: string;
  sampleNote: string;
  pause: string;
  play: string;
  listSep: string;
};

const POLL_MS = 15_000;

/**
 * The live part of the home page: a slim ticker of the latest reports and the
 * six most recent report cards. Starts from server-rendered data, then polls
 * /api/recent while the tab is visible, so a new report appears within seconds.
 */
export function LiveReports({
  initial,
  renderedAt,
  lang,
  labels,
  text,
}: {
  initial: PublicReport[];
  /** Server render time, so the first client render prints the same "x min ago" text. */
  renderedAt: number;
  lang: Lang;
  labels: ReportLabels;
  text: Text;
}) {
  const [reports, setReports] = useState<PublicReport[]>(initial);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(renderedAt);
  const known = useRef(new Set(initial.map((r) => r.id)));

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/api/recent?limit=12', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { ok: boolean; reports: PublicReport[] };
        if (cancelled || !data.ok) return;
        const arrivals = data.reports.filter((r) => !known.current.has(r.id)).map((r) => r.id);
        known.current = new Set(data.reports.map((r) => r.id));
        if (arrivals.length) setFresh(new Set(arrivals));
        setReports(data.reports);
        setNow(Date.now());
      } catch {
        // Offline or server hiccup: keep showing what we have.
      }
    }
    poll();
    const id = window.setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', poll);
    };
  }, []);

  const tickerItems = reports.slice(0, 12).map((r) => ({
    id: r.id,
    text: [labels.scamTypes[r.scam_type].short, labels.asked[r.asked[0] ?? 'nothing'].ticker, timeAgo(r.created_at, labels.time, now)].join(text.listSep),
  }));
  const list = reports.slice(0, 6);
  const hasSamples = list.some((r) => r.is_sample);
  const duration = Math.max(40, tickerItems.length * 7);

  return (
    <>
      {tickerItems.length > 0 && (
        <section aria-label={text.tickerLabel} className="relative bg-gold text-navy">
          <div className="flex items-stretch">
            <div className="z-10 flex shrink-0 items-center gap-2 bg-gold ps-4 pe-3 sm:ps-7">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="live-dot absolute inset-0 rounded-full bg-red" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-red" />
              </span>
              <span className="t-label font-bold">{text.live}</span>
            </div>
            {/* Inherits the page direction: English scrolls left, Urdu scrolls right so sentences start on the right. */}
            <div className="marquee relative min-w-0 flex-1 overflow-hidden py-3">
              <div className="marquee-track" data-animate={!paused} style={{ ['--marquee-duration' as string]: `${duration}s` }}>
                {[0, 1].map((copy) => (
                  <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 ? true : undefined}>
                    {tickerItems.map((item) => (
                      <li key={`${copy}-${item.id}`} className="flex items-center gap-3 whitespace-nowrap pe-8 text-[0.98rem] font-semibold">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-red" aria-hidden="true" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="z-10 grid w-12 shrink-0 place-items-center bg-gold hover:bg-[#ffc542]"
              aria-label={paused ? text.play : text.pause}
              aria-pressed={paused}
            >
              {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </section>
      )}

      <section className="py-14 lg:py-20" aria-labelledby="recent-title">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 id="recent-title" className="t-h2 reveal">
                {text.title}
              </h2>
              <p className="t-lead mt-3 text-muted">{text.sub}</p>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="card mt-8 p-8 text-center t-lead">{text.empty}</p>
          ) : (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4" aria-live="polite">
              {list.map((r) => (
                <li key={r.id} className="grid">
                  <ReportCard report={r} labels={labels} lang={lang} fresh={fresh.has(r.id)} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-col gap-1.5 text-muted t-small">
            <p className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-ink" aria-hidden="true" />
              {text.unverified}
            </p>
            {hasSamples && <p className="ps-6">{text.sampleNote}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
