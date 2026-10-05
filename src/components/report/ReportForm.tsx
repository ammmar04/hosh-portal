'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ArrowRight, Check, Info, Lock, Pencil } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import { fmt } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDialerInput, normalizeNumber, type NormalizeError } from '@/lib/phone';
import { maskStory, STORY_MAX } from '@/lib/mask';
import { ASKED, LOSS_BANDS, SCAM_TYPES, type Asked, type LossBand, type PublicReport, type ScamType } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ASKED_ICONS, SCAM_ICONS } from '@/components/icons';
import { HangUpCircle } from '@/components/brand/HangUp';
import { Ltr } from '@/components/ui/Ltr';
import { LAST_REPORT_KEY, PREFILL_KEY } from '@/lib/report-keys';

export type ReportFormText = {
  report: Dictionary['report'];
  scamTypes: Dictionary['scamTypes'];
  asked: Dictionary['asked'];
  loss: Dictionary['loss'];
  numberErrors: Dictionary['checker']['errors'];
  justNow: string;
};


const STEPS = ['number', 'type', 'asked', 'loss', 'story'] as const;
type Step = (typeof STEPS)[number];
const REVIEW = STEPS.length;

export function ReportForm({ lang, t, initialNumber = '' }: { lang: Lang; t: ReportFormText; initialNumber?: string }) {
  const r = t.report;
  const router = useRouter();
  const uid = useId();
  const [active, setActive] = useState(0);
  const [number, setNumber] = useState(() => formatDialerInput(initialNumber));
  const [numberError, setNumberError] = useState<NormalizeError | null>(null);
  const [scamType, setScamType] = useState<ScamType | null>(null);
  const [asked, setAsked] = useState<Asked[]>([]);
  const [loss, setLoss] = useState<LossBand | null>(null);
  const [story, setStory] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [reached, setReached] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hanging, setHanging] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRefs = useRef<(HTMLElement | null)[]>([]);
  const firstRender = useRef(true);

  // Prefill from the message checker ("Report this message").
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PREFILL_KEY);
      const p = JSON.parse(raw) as { scam_type?: ScamType; asked?: Asked[]; story?: string };
      if (p.scam_type && SCAM_TYPES.includes(p.scam_type)) setScamType(p.scam_type);
      if (Array.isArray(p.asked)) setAsked(p.asked.filter((a) => ASKED.includes(a)));
      if (typeof p.story === 'string') setStory([...p.story].slice(0, STORY_MAX).join(''));
      setPrefilled(true);
    } catch {}
  }, []);

  // Move focus to the step that just opened (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = active < REVIEW ? headingRefs.current[active] : document.getElementById(`${uid}-submit`);
    el?.focus({ preventScroll: false });
  }, [active, uid]);

  const num = normalizeNumber(number);
  const done: Record<Step, boolean> = {
    number: num.ok,
    type: scamType !== null,
    asked: asked.length > 0,
    loss: loss !== null,
    story: reached,
  };
  const requiredDone = done.number && done.type && done.asked && done.loss;
  const masked = maskStory(story.trim());
  const storyLen = [...story].length;
  const completed = STEPS.filter((s) => done[s]).length;

  /** Opens the next unanswered question. Once the person has reached review, edits return to review. */
  function goNext(from: number, justAnswered: Partial<Record<Step, boolean>> = {}) {
    const d = { ...done, ...justAnswered };
    for (let i = from + 1; i < STEPS.length; i++) {
      const s = STEPS[i]!;
      if (s === 'story') {
        if (!reached) return setActive(i);
        continue;
      }
      if (!d[s]) return setActive(i);
    }
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i]!;
      if (s !== 'story' && !d[s]) return setActive(i);
    }
    goReview();
  }

  function goReview() {
    setReached(true);
    setActive(REVIEW);
  }

  function nextFromNumber() {
    const res = normalizeNumber(number);
    if (!res.ok) {
      setNumberError(res.error);
      return;
    }
    setNumberError(null);
    setNumber(formatDialerInput(number));
    goNext(0, { number: true });
  }

  function pickType(v: ScamType) {
    setScamType(v);
    window.setTimeout(() => goNext(1, { type: true }), 240);
  }

  function toggleAsked(v: Asked) {
    setAsked((prev) => {
      if (v === 'nothing') return prev.includes('nothing') ? [] : ['nothing'];
      const without = prev.filter((x) => x !== 'nothing');
      return without.includes(v) ? without.filter((x) => x !== v) : [...without, v];
    });
  }

  function pickLoss(v: LossBand) {
    setLoss(v);
    window.setTimeout(() => goNext(3, { loss: true }), 240);
  }

  async function submit() {
    if (!requiredDone || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setHanging(true);
    const animation = new Promise((res) => window.setTimeout(res, 650));
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ number, scam_type: scamType, asked, loss_band: loss, story: story.trim() || null, lang }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; report: PublicReport; token: string }
        | { ok: false; error: string; field?: string }
        | null;
      await animation;
      if (res.status === 429) throw new Error(r.errors.rate);
      if (!res.ok || !data || !data.ok) {
        const field = data && !data.ok ? data.field : undefined;
        const idx = field === 'number' ? 0 : field === 'scam_type' ? 1 : field === 'asked' ? 2 : field === 'loss_band' ? 3 : field === 'story' ? 4 : -1;
        if (idx >= 0) setActive(idx);
        throw new Error(res.status >= 500 ? r.errors.server : (field && r.errors[field as keyof typeof r.errors]) || r.errors.server);
      }
      try {
        sessionStorage.setItem(LAST_REPORT_KEY, JSON.stringify({ report: data.report, token: data.token }));
      } catch {}
      router.push(`/${lang}/report/thanks`);
    } catch (e) {
      await animation;
      setHanging(false);
      setSubmitting(false);
      setSubmitError(e instanceof TypeError ? r.errors.network : (e as Error).message || r.errors.network);
    }
  }

  const summaries: Record<Step, React.ReactNode> = {
    number: num.ok ? <Ltr mono className="font-bold">{num.display}</Ltr> : null,
    type: scamType ? t.scamTypes[scamType].label : null,
    asked: asked.length ? asked.map((a) => t.asked[a].label).join(lang === 'ur' ? '، ' : ', ') : null,
    loss: loss ? t.loss[loss].label : null,
    story: story.trim() ? masked : null,
  };

  const labels: Record<Step, string> = {
    number: r.steps.number.label,
    type: r.steps.type.label,
    asked: r.steps.asked.label,
    loss: r.steps.loss.label,
    story: r.steps.story.label,
  };

  function body(step: Step) {
    switch (step) {
      case 'number':
        return (
          <div className="grid gap-3">
            <p id={`${uid}-number-hint`} className="text-muted">
              {r.steps.number.hint}
            </p>
            <div className={cn('dialer-screen', numberError && 'is-error')}>
              <input
                id={`${uid}-number`}
                value={number}
                onChange={(e) => {
                  setNumber(formatDialerInput(e.target.value));
                  setNumberError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    nextFromNumber();
                  }
                }}
                dir="ltr"
                inputMode="tel"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                maxLength={24}
                placeholder={r.steps.number.placeholder}
                aria-invalid={numberError ? true : undefined}
                aria-describedby={`${uid}-number-hint ${uid}-number-error`}
                aria-labelledby={`${uid}-h-0`}
                className="t-num h-[68px] w-full bg-transparent px-4 text-center text-[1.6rem] font-bold text-offwhite outline-none placeholder:text-[1.25rem] placeholder:font-medium placeholder:text-offwhite/45 xs:text-[1.8rem]"
              />
            </div>
            <p id={`${uid}-number-error`} role="alert" className={cn('font-semibold text-alarm-ink', !numberError && 'sr-only')}>
              {numberError ? t.numberErrors[numberError] : ''}
            </p>
            <button type="button" onClick={nextFromNumber} className="btn btn-ink btn-lg w-full sm:w-auto sm:self-start">
              {r.next}
              <ArrowRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        );
      case 'type':
        return (
          <div role="radiogroup" aria-labelledby={`${uid}-h-1`} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SCAM_TYPES.map((v) => {
              const Icon = SCAM_ICONS[v];
              const on = scamType === v;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickType(v)}
                  className={cn('type-tile', on && 'is-on')}
                >
                  <span className="type-tile-icon">
                    {on ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <span className="text-start leading-snug">{t.scamTypes[v].label}</span>
                </button>
              );
            })}
          </div>
        );
      case 'asked':
        return (
          <div className="grid gap-4">
            <p className="text-muted" id={`${uid}-asked-hint`}>
              {r.steps.asked.hint}
            </p>
            <div role="group" aria-labelledby={`${uid}-h-2`} aria-describedby={`${uid}-asked-hint`} className="flex flex-wrap gap-2.5">
              {ASKED.map((v) => {
                const Icon = ASKED_ICONS[v];
                const on = asked.includes(v);
                return (
                  <button key={v} type="button" aria-pressed={on} onClick={() => toggleAsked(v)} className="chip min-h-[52px] px-4 text-[1.0625rem]">
                    {on ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : <Icon className="h-5 w-5 opacity-70" aria-hidden="true" />}
                    {t.asked[v].label}
                  </button>
                );
              })}
            </div>
            <button type="button" disabled={!asked.length} onClick={() => goNext(2)} className="btn btn-ink btn-lg w-full sm:w-auto sm:self-start">
              {r.next}
              <ArrowRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        );
      case 'loss':
        return (
          <div role="radiogroup" aria-labelledby={`${uid}-h-3`} className="grid gap-2">
            {LOSS_BANDS.map((v, i) => {
              const on = loss === v;
              return (
                <button key={v} type="button" role="radio" aria-checked={on} onClick={() => pickLoss(v)} className={cn('loss-option', on && 'is-on')}>
                  <span className="loss-dot" style={{ background: `var(--loss-${i})` }} aria-hidden="true" />
                  <span className="flex-1 text-start">{t.loss[v].label}</span>
                  {on && <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        );
      case 'story':
        return (
          <div className="grid gap-3">
            <textarea
              id={`${uid}-story`}
              value={story}
              onChange={(e) => setStory([...e.target.value].slice(0, STORY_MAX).join(''))}
              rows={4}
              dir="auto"
              placeholder={r.steps.story.placeholder}
              aria-labelledby={`${uid}-h-4`}
              aria-describedby={`${uid}-story-count ${uid}-story-mask`}
              className="field min-h-[132px] resize-y text-[1.0625rem] leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-muted t-small">
              <p id={`${uid}-story-mask`} className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                {r.steps.story.maskNote}
              </p>
              <p id={`${uid}-story-count`} className={cn('t-num', storyLen >= STORY_MAX - 20 && 'font-bold text-alarm-ink')}>
                {fmt(r.steps.story.counter, { n: storyLen, max: STORY_MAX })}
              </p>
            </div>
            <span className="sr-only" aria-live="polite">
              {storyLen >= STORY_MAX - 20 ? fmt(r.steps.story.counter, { n: storyLen, max: STORY_MAX }) : ''}
            </span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={goReview} className="btn btn-ink btn-lg">
                {story.trim() ? r.review : r.skip}
                <ArrowRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-14">
          <div className="min-w-0">
            {prefilled && (
              <p className="mb-5 flex items-start gap-2 rounded-2xl bg-amber-soft p-4 font-semibold text-ink">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-ink" aria-hidden="true" />
                {r.prefilledFromMessage}
              </p>
            )}

            <div className="mb-5" aria-hidden="true">
              <div className="flex gap-1.5">
                {STEPS.map((s, i) => (
                  <span key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-300', done[s] ? 'bg-ink' : i === active ? 'bg-alarm' : 'bg-line-strong')} />
                ))}
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              {active < REVIEW ? fmt(r.progress, { n: active + 1, total: STEPS.length }) : ''}
            </p>

            <ol className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {STEPS.map((step, i) => {
                const isActive = active === i;
                const summary = summaries[step];
                const answered = !isActive && (step === 'story' ? reached : done[step]);
                return (
                  <li key={step} className={cn('report-step', isActive ? 'is-active' : answered ? 'is-done' : 'is-todo')}>
                    <div className="flex items-start gap-3">
                      <span className={cn('step-num', isActive ? 'bg-alarm text-navy' : answered ? 'bg-ink text-bg' : 'bg-line text-muted')} aria-hidden="true">
                        {answered ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="t-num text-[0.95rem] font-bold">{i + 1}</span>}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2
                          id={`${uid}-h-${i}`}
                          ref={(el) => {
                            headingRefs.current[i] = el;
                          }}
                          tabIndex={-1}
                          className={cn('font-display font-bold leading-snug outline-none', isActive ? 'text-[1.4rem] sm:text-[1.6rem]' : 'text-[1.0625rem]', !isActive && !answered && 'text-muted')}
                        >
                          {labels[step]}
                          {step === 'story' && <span className="ms-2 text-[0.9rem] font-medium text-muted">({r.steps.story.optional})</span>}
                        </h2>
                        {!isActive && answered && summary && <div className="mt-0.5 min-w-0 truncate text-ink-2">{summary}</div>}
                      </div>
                      {!isActive && (answered || active > i) && (
                        <button type="button" onClick={() => setActive(i)} className="btn btn-soft min-h-11 shrink-0 px-3.5 text-[0.95rem]">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          {r.change}
                          <span className="sr-only">: {labels[step]}</span>
                        </button>
                      )}
                    </div>
                    {isActive && (
                      <m.div
                        key={`body-${step}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        className="mt-4"
                      >
                        {body(step)}
                      </m.div>
                    )}
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 flex items-start gap-2 text-muted t-small">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {r.privacy}
            </p>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
            <section aria-labelledby={`${uid}-preview`} className="card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
                <h2 id={`${uid}-preview`} className="font-semibold">
                  {r.preview.title}
                </h2>
                <span className="t-small text-muted">{completed}/5</span>
              </div>
              <div className="p-5" aria-live="off">
                {!num.ok && !scamType && !asked.length && !loss && !story ? (
                  <p className="py-4 text-center text-muted">{r.preview.empty}</p>
                ) : (
                  <div className="grid gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <Ltr mono className={cn('text-[1.35rem] font-bold leading-tight', !num.ok && 'text-muted')}>
                        {num.ok ? num.display : '03XX-XXXXXXX'}
                      </Ltr>
                      <span className="t-small shrink-0 text-muted">{t.justNow}</span>
                    </div>
                    {scamType && (
                      <p className="inline-flex items-center gap-2 font-semibold">
                        {(() => {
                          const Icon = SCAM_ICONS[scamType];
                          return (
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-alarm-soft text-alarm-ink">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          );
                        })()}
                        {t.scamTypes[scamType].label}
                      </p>
                    )}
                    {asked.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {asked.map((a) => (
                          <span key={a} className="chip-static">
                            {t.asked[a].label}
                          </span>
                        ))}
                      </div>
                    )}
                    {story.trim() && (
                      <blockquote dir="auto" className="rounded-2xl bg-sunk p-3.5 text-[1.0625rem] leading-relaxed">
                        {masked}
                      </blockquote>
                    )}
                    {loss && <p className="text-muted t-small">{t.loss[loss].card}</p>}
                  </div>
                )}
              </div>
              <p className="border-t border-line bg-sunk/60 px-5 py-3 text-muted t-small">{r.preview.publicNote}</p>
            </section>

            {requiredDone && (
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <button
                  id={`${uid}-submit`}
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="submit-circle group flex flex-col items-center gap-3 rounded-[32px] p-2 outline-none"
                >
                  <span className={cn('relative grid h-[108px] w-[108px] place-items-center transition-transform', !submitting && 'group-hover:scale-105 group-active:scale-95')}>
                    <HangUpCircle ring={!submitting} className="h-full w-full drop-shadow-[0_16px_30px_rgb(229_72_77/0.45)]" handsetClassName={hanging ? 'hangup-anim' : undefined} />
                  </span>
                  <span className="text-[1.3rem] font-extrabold">{submitting ? r.submitting : r.submit}</span>
                </button>
                <p role="alert" className={cn('font-semibold text-alarm-ink', !submitError && 'sr-only')}>
                  {submitError ?? ''}
                </p>
              </div>
            )}
          </aside>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
