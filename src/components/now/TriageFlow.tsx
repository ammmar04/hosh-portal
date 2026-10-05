'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, PhoneCall, TriangleAlert } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CONTACTS } from '@/data/contacts';
import { fmt } from '@/i18n/config';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'hosh-triage-v1';

/**
 * "I already shared a code or sent money": four tickable steps with a progress bar.
 * Built on <details> and real checkboxes, so it opens and ticks even before
 * JavaScript loads (or offline). JS adds the progress count and remembers ticks.
 */
export function TriageFlow({ lang, t, contactNames, opensInNewTab }: { lang: Lang; t: Dictionary['now']; contactNames: Dictionary['contacts']; opensInNewTab: string }) {
  const steps = t.triage.steps;
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as boolean[] | null;
      if (Array.isArray(saved) && saved.length === steps.length) {
        setDone(saved);
        if (saved.some(Boolean)) setOpen(true);
      }
    } catch {}
  }, [steps.length]);

  function toggle(i: number, value: boolean) {
    setDone((prev) => {
      const next = prev.map((d, j) => (j === i ? value : d));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const count = done.filter(Boolean).length;
  const jazz = CONTACTS.jazzcash_helpline;
  const easypaisa = CONTACTS.easypaisa_helpline;
  const whatsapp = CONTACTS.whatsapp_recover;

  return (
    <details className="triage group mt-6" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="flex min-h-[64px] items-center gap-3 rounded-[22px] bg-gold px-5 py-3 text-[1.125rem] font-bold leading-snug text-navy transition-transform active:scale-[0.98]">
        <TriangleAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span className="flex-1">{t.alreadyShared}</span>
        <ArrowRight className="mirror-rtl h-5 w-5 shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>

      <div className="mt-5 rounded-[26px] bg-offwhite/[0.06] p-4 ring-1 ring-offwhite/10 sm:p-6">
        <h2 className="text-[1.375rem] font-extrabold leading-snug font-display">{t.triage.title}</h2>

        <div className="mt-4" aria-live="polite">
          <div className="flex gap-1.5" aria-hidden="true">
            {steps.map((_, i) => (
              <span key={i} className={cn('h-2 flex-1 rounded-full transition-colors duration-300', done[i] ? 'bg-gold' : 'bg-offwhite/15')} />
            ))}
          </div>
          <p className="mt-2 text-[0.95rem] font-semibold text-offwhite/80">
            {count === steps.length ? t.triage.allDone : fmt(t.triage.progress, { done: count, total: steps.length })}
          </p>
        </div>

        <ol className="mt-5 grid gap-3">
          {steps.map((step, i) => (
            <li key={i} className={cn('rounded-[20px] bg-navy-2 p-4 ring-1 transition-colors sm:p-5', done[i] ? 'ring-gold/60' : 'ring-offwhite/10')}>
              <label className="flex cursor-pointer items-start gap-3.5">
                <input type="checkbox" className="peer sr-only" checked={done[i]} onChange={(e) => toggle(i, e.target.checked)} />
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-offwhite/40 text-navy transition-colors peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
                >
                  {done[i] ? <Check className="h-5 w-5" strokeWidth={3} /> : <span className="t-num text-[0.95rem] font-bold text-offwhite">{i + 1}</span>}
                </span>
                <span className="flex-1">
                  <span className={cn('block text-[1.2rem] font-bold leading-snug', done[i] && 'text-offwhite/70')}>{step.title}</span>
                  <span className="mt-1.5 block text-[1rem] leading-relaxed text-offwhite/75">{step.body}</span>
                  <span className="sr-only">{done[i] ? t.triage.done : t.triage.markDone}</span>
                </span>
              </label>

              {i === 0 && (
                <div className="mt-4 flex flex-wrap gap-2 ps-[3.25rem]">
                  <a href={jazz.href} className="btn btn-on-navy min-h-12 px-4 text-[0.98rem]">
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                    {contactNames.jazzcash_helpline.short}
                  </a>
                  <a href={easypaisa.href} className="btn btn-on-navy min-h-12 px-4 text-[0.98rem]">
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                    <bdi>{contactNames.easypaisa_helpline.short}</bdi>
                  </a>
                  <p className="basis-full pt-1 text-[0.95rem] text-offwhite/70">{t.triage.cardNumber}</p>
                </div>
              )}
              {i === 2 && (
                <div className="mt-4 ps-[3.25rem]">
                  <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="btn btn-on-navy min-h-12 px-4 text-[0.98rem]">
                    {contactNames.whatsapp_recover.name}
                    <ArrowUpRight className="mirror-rtl h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{opensInNewTab}</span>
                  </a>
                </div>
              )}
              {i === 3 && (
                <div className="mt-4 flex flex-wrap gap-2 ps-[3.25rem]">
                  <Link href={`/${lang}/report`} className="btn btn-alarm min-h-12 px-5">
                    {t.triage.reportHosh}
                  </Link>
                  <Link href={`/${lang}/how-to-report`} className="btn btn-on-navy min-h-12 px-5">
                    {t.triage.reportOfficial}
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
