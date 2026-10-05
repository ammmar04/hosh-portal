'use client';

import { useId, useState } from 'react';
import { Check, Search } from 'lucide-react';
import type { Dictionary } from '@/i18n';
import { plural } from '@/i18n/config';
import { formatDate, type TimeDict } from '@/lib/time';
import { TRACKER_SAMPLES, TRACKER_STATUSES } from '@/data/tracker-samples';
import { cn } from '@/lib/cn';
import { CountUp } from '@/components/findings/Motion';

const DAY = 86_400_000;

export function TrackerDemo({ t, time }: { t: Dictionary['tracker']; time: TimeDict }) {
  const id = useId();
  const ids = Object.keys(TRACKER_SAMPLES);
  const [value, setValue] = useState(ids[0]!);
  const [current, setCurrent] = useState<string | null>(ids[0]!);
  const [notFound, setNotFound] = useState(false);

  function track(next = value) {
    const key = next.trim().toUpperCase();
    if (TRACKER_SAMPLES[key]) {
      setCurrent(key);
      setNotFound(false);
    } else {
      setCurrent(null);
      setNotFound(true);
    }
  }

  const sample = current ? TRACKER_SAMPLES[current] : null;
  const copy = current ? t.samples[current as keyof typeof t.samples] : null;
  const now = Date.now();
  const last = sample?.history[sample.history.length - 1];
  const closed = last?.status === 'closed';
  const waiting = last && !closed ? last.daysAgo : 0;
  const reached = new Map(sample?.history.map((h) => [h.status, h.daysAgo]));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10">
      <form
        className="card p-5 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          track();
        }}
      >
        <label htmlFor={id} className="font-semibold">
          {t.label}
        </label>
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          dir="ltr"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder={t.placeholder}
          className="field t-num mt-3 text-[1.25rem] font-bold uppercase"
          aria-describedby={`${id}-err`}
        />
        <button type="submit" className="btn btn-ink btn-lg mt-4 w-full">
          <Search className="h-5 w-5" aria-hidden="true" />
          {t.button}
        </button>
        <p id={`${id}-err`} role="alert" className={cn('mt-3 font-semibold text-alarm-ink', !notFound && 'sr-only')}>
          {notFound ? t.notFound : ''}
        </p>
        <p className="mt-5 font-semibold">{t.samplesLabel}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ids.map((sid) => (
            <button
              key={sid}
              type="button"
              aria-pressed={current === sid}
              onClick={() => {
                setValue(sid);
                track(sid);
              }}
              className="chip min-h-11 px-3.5 text-[0.9rem]"
            >
              <bdi dir="ltr" className="t-num">
                {sid}
              </bdi>
            </button>
          ))}
        </div>
      </form>

      <section aria-live="polite" className="min-w-0">
        {sample && copy && (
          <div className="card overflow-hidden">
            <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
              <div>
                <p className="t-label text-muted">{t.category}</p>
                <p className="t-h3 mt-1">{copy.category}</p>
                <p className="mt-2 text-ink-2">
                  {t.filed}: {formatDate(new Date(now - sample.history[0]!.daysAgo * DAY).toISOString(), time)}
                </p>
              </div>
              {!closed && (
                <div key={current} className="rounded-[22px] bg-alarm-soft px-5 py-4 text-center sm:min-w-[11rem]">
                  <CountUp value={waiting} className="block font-display text-[3.25rem] font-extrabold leading-none text-alarm-ink" />
                  <span className="mt-1 block font-semibold">{plural(t.daysWithout, waiting)}</span>
                </div>
              )}
            </div>

            <ol className="grid gap-0 border-t border-line p-5 sm:p-7">
              {TRACKER_STATUSES.map((st, i) => {
                const daysAgo = reached.get(st);
                const done = daysAgo !== undefined;
                const isCurrent = last?.status === st;
                const lastItem = i === TRACKER_STATUSES.length - 1;
                return (
                  <li key={st} className="relative flex gap-4 pb-7 last:pb-0">
                    {!lastItem && (
                      <span aria-hidden="true" className={cn('absolute start-[17px] top-10 h-[calc(100%-2.5rem)] w-0.5', done && reached.has(TRACKER_STATUSES[i + 1]!) ? 'bg-ink' : 'bg-line-strong')} />
                    )}
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                        done ? (isCurrent && !closed ? 'bg-alarm text-white ring-4 ring-alarm/20' : 'bg-ink text-bg') : 'border-2 border-dashed border-line-strong',
                      )}
                    >
                      {done && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <div className="pt-1">
                      <p className={cn('font-bold', !done && 'text-muted')}>{t.statuses[st]}</p>
                      <p className="text-muted t-small">
                        {done ? formatDate(new Date(now - daysAgo * DAY).toISOString(), time) : t.waiting}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="border-t border-line bg-sunk/60 px-5 py-4 sm:px-7">
              <span className="font-semibold">{t.lastUpdate}:</span> {copy.note}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
