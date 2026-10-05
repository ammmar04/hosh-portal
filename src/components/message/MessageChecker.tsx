'use client';

import { useRouter } from 'next/navigation';
import { useDeferredValue, useId, useMemo, useRef, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CircleCheck, Lock, Megaphone, OctagonAlert, Sparkles, TriangleAlert, X } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import { fmt, plural } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { checkMessage, guessReport, segments, type Level } from '@/lib/message-check';
import { maskStory, STORY_MAX } from '@/lib/mask';
import { PREFILL_KEY } from '@/lib/report-keys';
import { cn } from '@/lib/cn';

const LEVEL_STYLE: Record<Level, { icon: typeof CircleCheck; tone: string; fill: number }> = {
  safe: { icon: CircleCheck, tone: 'text-safe', fill: 1 },
  careful: { icon: TriangleAlert, tone: 'text-amber-ink', fill: 2 },
  scam: { icon: OctagonAlert, tone: 'text-alarm-ink', fill: 3 },
};

export function MessageChecker({ lang, t }: { lang: Lang; t: Dictionary['message'] }) {
  const router = useRouter();
  const id = useId();
  const [text, setText] = useState('');
  const [checkedOnce, setCheckedOnce] = useState(false);
  const deferred = useDeferredValue(text);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const result = useMemo(() => (deferred.trim() ? checkMessage(deferred) : null), [deferred]);
  const show = result && checkedOnce;

  function runCheck(value = text) {
    if (!value.trim()) return;
    setCheckedOnce(true);
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function pickExample(value: string) {
    setText(value);
    setCheckedOnce(true);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function reportIt() {
    if (!result) return;
    const guess = guessReport(result);
    const story = [...maskStory(text.replace(/\s+/g, ' ').trim())].slice(0, STORY_MAX).join('');
    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ ...guess, story }));
    } catch {}
    router.push(`/${lang}/report`);
  }

  const level = result ? LEVEL_STYLE[result.level] : null;

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runCheck();
              }}
              className="card p-5 sm:p-7"
            >
              <label htmlFor={id} className="font-semibold">
                {t.label}
              </label>
              <div className="relative mt-3">
                <textarea
                  id={id}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 5000))}
                  rows={7}
                  dir="auto"
                  placeholder={t.placeholder}
                  className="field min-h-[180px] resize-y pe-12 text-[1.0625rem] leading-relaxed"
                />
                {text && (
                  <button
                    type="button"
                    onClick={() => {
                      setText('');
                      setCheckedOnce(false);
                    }}
                    className="absolute end-2 top-2 grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-sunk hover:text-ink"
                    aria-label={t.clear}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <button type="submit" disabled={!text.trim()} className="btn btn-ink btn-lg mt-4 w-full">
                {t.button}
              </button>
              <p className="mt-3 flex items-center gap-2 text-muted t-small">
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t.privacy}
              </p>
            </form>

            <div className="mt-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-amber-ink" aria-hidden="true" />
                {t.examplesTitle}
              </h2>
              <ul className="mt-3 grid gap-2">
                {t.examples.map((ex) => (
                  <li key={ex.label}>
                    <button type="button" onClick={() => pickExample(ex.text)} className="card-flat w-full p-4 text-start transition-colors hover:bg-surface-2">
                      <span className="block font-bold">{ex.label}</span>
                      <span dir="auto" className="mt-1 line-clamp-2 block text-muted t-small">
                        {ex.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section aria-live="polite" className="min-w-0 lg:sticky lg:top-24">
            <h2 ref={resultRef} tabIndex={-1} className="sr-only outline-none">
              {t.resultTitle}
            </h2>
            {show && level ? (
              <m.div key={result.level + result.score} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="card overflow-hidden">
                <div className="p-5 sm:p-7">
                  <div className="flex items-start gap-3">
                    <level.icon className={cn('mt-1 h-8 w-8 shrink-0', level.tone)} aria-hidden="true" />
                    <div>
                      <p className={cn('font-display text-[1.75rem] font-extrabold leading-tight', level.tone)}>{t.levels[result.level].label}</p>
                      <p className="mt-1 text-ink-2">{t.levels[result.level].body}</p>
                    </div>
                  </div>
                  <div className="mt-5" role="img" aria-label={`${t.meterLabel}: ${t.levels[result.level].label}`}>
                    <div className="grid grid-cols-3 gap-[3px]">
                      {(['safe', 'careful', 'scam'] as Level[]).map((l, i) => (
                        <span
                          key={l}
                          className={cn(
                            'h-3 first:rounded-s-full last:rounded-e-full',
                            i < level.fill ? (result.level === 'scam' ? 'bg-alarm' : result.level === 'careful' ? 'bg-amber' : 'bg-safe') : 'bg-line-strong',
                          )}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 grid grid-cols-3 text-[0.8rem] text-muted">
                      <span>{t.levels.safe.label}</span>
                      <span className="text-center">{t.levels.careful.label}</span>
                      <span className="text-end">{t.levels.scam.label}</span>
                    </div>
                  </div>
                </div>

                {result.findings.length > 0 && (
                  <>
                    <div className="border-t border-line bg-sunk/50 p-5 sm:p-7">
                      <p className="mb-2 text-muted t-small">{t.highlightNote}</p>
                      <p dir="auto" className="whitespace-pre-wrap text-[1.0625rem] leading-[1.9]">
                        {segments(deferred, result.ranges).map((seg, i) =>
                          seg.signals.length ? (
                            <mark key={i} className="flag-mark" title={seg.signals.map((s) => t.signals[s].title).join(' / ')}>
                              {seg.text}
                            </mark>
                          ) : (
                            <span key={i}>{seg.text}</span>
                          ),
                        )}
                      </p>
                    </div>
                    <div className="border-t border-line p-5 sm:p-7">
                      <p className="font-bold">{plural(t.found, result.findings.length)}</p>
                      <ul className="mt-4 grid gap-3">
                        {result.findings.map((f, i) => (
                          <m.li
                            key={f.id}
                            initial={{ opacity: 0, x: lang === 'ur' ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 34 }}
                            className="flex gap-3"
                          >
                            <span className="hang-bullet mt-2" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="font-bold">{t.signals[f.id].title}</p>
                              <p className="text-ink-2">{fmt(t.signals[f.id].body, { brand: f.brand ?? '' })}</p>
                              {f.quotes.length > 0 && (
                                <p className="mt-1 text-muted t-small">
                                  {t.quoteLabel}:{' '}
                                  {f.quotes.map((q, j) => (
                                    <span key={j} dir="auto" className="me-2 inline-block rounded-md bg-sunk px-1.5">
                                      {q}
                                    </span>
                                  ))}
                                </p>
                              )}
                            </div>
                          </m.li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <div className="border-t border-line p-5 sm:p-7">
                  <p className="flex items-start gap-2 rounded-2xl bg-amber-soft p-4 font-semibold">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-ink" aria-hidden="true" />
                    {t.caveat}
                  </p>
                  {result.level !== 'safe' && (
                    <button type="button" onClick={reportIt} className="btn btn-alarm btn-lg mt-4 w-full">
                      <Megaphone className="h-5 w-5" aria-hidden="true" />
                      {t.report}
                    </button>
                  )}
                </div>
              </m.div>
            ) : (
              <div className="card-flat hidden flex-col items-center justify-center gap-4 p-10 text-center lg:flex">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-soft text-amber-ink">
                  <TriangleAlert className="h-8 w-8" aria-hidden="true" />
                </span>
                <p className="max-w-[30ch] text-muted">{t.caveat}</p>
              </div>
            )}
          </section>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
