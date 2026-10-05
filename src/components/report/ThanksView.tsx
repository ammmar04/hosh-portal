'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, MessageCircle, Users } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { ltrIsolate } from '@/lib/phone';
import { formatDateTime, type TimeDict } from '@/lib/time';
import type { PublicReport } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ShareButton } from '@/components/share/ShareButton';
import type { ShareProps } from '@/components/share/types';
import { LAST_REPORT_KEY } from '@/lib/report-keys';

type Stored = { report: PublicReport; token: string; official?: boolean };

export type ThanksText = {
  thanks: Dictionary['thanks'];
  scamTypes: Dictionary['scamTypes'];
  asked: Dictionary['asked'];
  loss: Dictionary['loss'];
  time: TimeDict;
  listSep: string;
};

/** The parts of the thanks page that depend on the report just sent. */
export function ThanksView({ lang, t, share }: { lang: Lang; t: ThanksText; share: Omit<ShareProps, 'number' | 'initialKind'> }) {
  const [stored, setStored] = useState<Stored | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const th = t.thanks;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_REPORT_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        setStored(s);
        if (typeof s.official === 'boolean') setAnswer(s.official);
      }
    } catch {}
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  if (!stored) return <p className="t-lead mt-2 text-ink-2">{th.missing}</p>;

  const r = stored.report;
  const url = `${window.location.origin}/${lang}/n/${encodeURIComponent(r.number_norm)}`;
  const num = lang === 'ur' ? ltrIsolate(r.number_display) : r.number_display;
  const summary = [
    th.summary.heading,
    '',
    `${th.summary.date}: ${formatDateTime(r.created_at, t.time)}`,
    `${th.summary.number}: ${num}`,
    `${th.summary.type}: ${t.scamTypes[r.scam_type].label}`,
    `${th.summary.asked}: ${r.asked.map((a) => t.asked[a].label).join(t.listSep)}`,
    `${th.summary.loss}: ${t.loss[r.loss_band].label}`,
    `${th.summary.story}: ${r.story || th.summary.noStory}`,
    '',
    `${th.summary.footer}: ${url}`,
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  async function answerOfficial(value: boolean) {
    setAnswer(value);
    setSaving(true);
    try {
      await fetch(`/api/reports/${r.id}/official`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answer: value, token: stored!.token }),
      });
      sessionStorage.setItem(LAST_REPORT_KEY, JSON.stringify({ ...stored, official: value }));
    } catch {
      // Never block the person on this; the answer is optional.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Link href={`/${lang}/n/${encodeURIComponent(r.number_norm)}`} className="link inline-flex w-fit items-center gap-2 font-semibold">
        {th.viewReport}: <bdi dir="ltr" className="t-num">{r.number_display}</bdi>
        <ArrowRight className="mirror-rtl h-4 w-4" aria-hidden="true" />
      </Link>

      <section aria-labelledby="summary-title" className="card overflow-hidden">
        <div className="p-5 sm:p-7">
          <h2 id="summary-title" className="t-h3">
            {th.summary.title}
          </h2>
          <p className="mt-2 text-muted">{th.summary.sub}</p>
          <pre
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
            className={cn('mt-5 max-h-[340px] overflow-auto whitespace-pre-wrap rounded-2xl bg-sunk p-4 text-[0.98rem] leading-relaxed', lang === 'ur' ? 'font-urdu' : 'font-mono')}
          >
            {summary}
          </pre>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={copy} className="btn btn-ink btn-lg">
              {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
              {copied ? th.summary.copied : th.summary.copy}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {th.summary.whatsapp}
            </a>
          </div>
          <p className="sr-only" aria-live="polite">
            {copied ? th.summary.copied : ''}
          </p>
        </div>
      </section>

      <section aria-labelledby="official-q" className="card-flat p-5 sm:p-7">
        <h2 id="official-q" className="t-h3">
          {th.question.title}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" aria-pressed={answer === v} disabled={saving} onClick={() => answerOfficial(v)} className="chip min-h-[52px] px-6 text-[1.0625rem]">
              {answer === v && <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />}
              {v ? th.question.yes : th.question.notYet}
            </button>
          ))}
        </div>
        <p className="mt-3 min-h-6 text-ink-2" aria-live="polite">
          {answer === true ? th.question.thanksYes : answer === false ? th.question.thanksNo : ''}
        </p>
      </section>

      <section aria-labelledby="family-title" className="card-brand relative isolate overflow-hidden p-6 sm:p-8">
        <span aria-hidden="true" className="absolute -end-16 -top-16 -z-10 h-56 w-56 rounded-full bg-red opacity-20" />
        <Users className="h-8 w-8 text-gold" aria-hidden="true" />
        <h2 id="family-title" className="t-h3 mt-4 text-offwhite">
          {th.family.title}
        </h2>
        <p className="mt-2 max-w-[44ch] text-offwhite/80">{th.family.body}</p>
        <ShareButton
          label={th.family.button}
          className="btn btn-alarm btn-lg mt-6"
          share={{ ...share, initialKind: 'number', number: { display: r.number_display, norm: r.number_norm, count: 1 } }}
        />
      </section>
    </div>
  );
}
