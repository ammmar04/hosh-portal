'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';
import { ArrowRight, Delete, Grid3x3, X } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDialerInput, normalizeNumber, type NormalizeError } from '@/lib/phone';
import { cn } from '@/lib/cn';

type Labels = Dictionary['checker'];

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'del'] as const;
const SEPARATORS = /[\s-]/;

/**
 * Dialer-style number checker. Big monospaced digits that format as you type,
 * plus an optional on-screen keypad. Works without JavaScript too: the form
 * falls back to a plain GET to /check?n=...
 */
export function NumberChecker({
  lang,
  t,
  samples,
  initialValue = '',
  initialError = null,
  autoFocus = false,
  className,
}: {
  lang: Lang;
  t: Labels;
  samples: string[];
  initialValue?: string;
  initialError?: NormalizeError | null;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(() => formatDialerInput(initialValue));
  const [error, setError] = useState<NormalizeError | null>(initialError);
  const [keypad, setKeypad] = useState(false);
  const [busy, setBusy] = useState(false);

  function placeCaret(el: HTMLInputElement, formatted: string, meaningfulBefore: number) {
    let count = 0;
    let pos = 0;
    while (pos < formatted.length && count < meaningfulBefore) {
      if (!SEPARATORS.test(formatted[pos]!)) count++;
      pos++;
    }
    requestAnimationFrame(() => el.setSelectionRange(pos, pos));
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, caret).replace(/[\s-]/g, '').length;
    const next = formatDialerInput(el.value);
    setValue(next);
    setError(null);
    placeCaret(el, next, before);
  }

  function press(key: (typeof KEYS)[number]) {
    setError(null);
    setValue((v) => {
      if (key === 'del') return formatDialerInput(v.replace(/[\s-]+$/, '').slice(0, -1));
      if (key === '+') return v.replace(/\s/g, '') === '' ? '+' : v;
      return formatDialerInput(v + key);
    });
    if (navigator.vibrate) navigator.vibrate(8);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = normalizeNumber(value);
    if (!result.ok) {
      setError(result.error);
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    router.push(`/${lang}/n/${encodeURIComponent(result.norm)}`);
  }

  const errorId = `${id}-error`;
  // Shrink the digits as the number gets longer so it always fits on a small screen.
  const len = (value || t.placeholder).length;
  const sizeClass = len <= 12 ? 'text-[1.75rem] xs:text-[1.95rem] sm:text-[2.25rem]' : len <= 15 ? 'text-[1.45rem] xs:text-[1.6rem] sm:text-[2rem]' : 'text-[1.2rem] sm:text-[1.6rem]';

  return (
    <form action={`/${lang}/check`} method="get" onSubmit={submit} noValidate className={cn('flex flex-col gap-4', className)}>
      <label htmlFor={id} className="font-semibold">
        {t.label}
      </label>

      <div className={cn('dialer-screen relative flex items-center', error && 'is-error')}>
        <input
          ref={inputRef}
          id={id}
          name="n"
          type="text"
          dir="ltr"
          value={value}
          onChange={onChange}
          inputMode={keypad ? 'none' : 'tel'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="search"
          maxLength={24}
          placeholder={t.placeholder}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            't-num h-[76px] w-full bg-transparent px-12 text-center font-bold tracking-[0.02em] text-offwhite outline-none placeholder:font-medium placeholder:text-offwhite/45',
            sizeClass,
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('');
              setError(null);
              inputRef.current?.focus();
            }}
            className="absolute end-3 grid h-11 w-11 place-items-center rounded-full text-offwhite/70 hover:bg-offwhite/10 hover:text-offwhite"
            aria-label={t.delete}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <p id={errorId} role="alert" className={cn('-mt-1 min-h-0 font-semibold text-alarm-ink', !error && 'sr-only')}>
        {error ? t.errors[error] : ''}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button type="submit" className="btn btn-ink btn-lg w-full sm:flex-1" disabled={busy}>
          {t.button}
          <ArrowRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setKeypad((k) => !k)}
          aria-expanded={keypad}
          aria-controls={`${id}-keypad`}
          className="btn btn-ghost w-full px-4 sm:w-auto sm:shrink-0"
        >
          <Grid3x3 className="h-5 w-5" aria-hidden="true" />
          <span>{keypad ? t.keypadHide : t.keypadShow}</span>
        </button>
      </div>

      {keypad && (
        <div id={`${id}-keypad`} role="group" aria-label={t.keypadLabel} dir="ltr" className="keypad mx-auto grid w-full max-w-[340px] grid-cols-3 gap-3 pt-1">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === 'del' ? t.delete : k === '+' ? t.plus : undefined}
              className="keypad-key"
            >
              {k === 'del' ? <Delete className="h-6 w-6" aria-hidden="true" /> : <span className="t-num">{k}</span>}
            </button>
          ))}
        </div>
      )}

      {samples.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted t-small">
          <span>{t.tryLabel}:</span>
          {samples.map((s) => (
            <Link key={s} href={`/${lang}/n/${encodeURIComponent(s.replace(/-/g, ''))}`} className="link font-semibold text-ink">
              <bdi dir="ltr" className="t-num">
                {s}
              </bdi>
            </Link>
          ))}
        </p>
      )}
    </form>
  );
}
