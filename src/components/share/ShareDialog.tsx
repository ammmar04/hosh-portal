'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Download, MessageCircle, Share2, X } from 'lucide-react';
import { fmt, plural, type Lang } from '@/i18n/config';
import { ltrIsolate } from '@/lib/phone';
import { canvasToBlob, renderShareCard, type CardFormat, type CardKind } from '@/lib/share-card';
import { cn } from '@/lib/cn';
import { HangUpSpinner } from '@/components/brand/HangUp';
import type { ShareProps } from './types';

type Props = ShareProps & { open: boolean; onClose: () => void };

export function ShareDialog({ lang, copy, ui, closeLabel, initialKind, number, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<CardKind>(initialKind);
  const [cardLang, setCardLang] = useState<Lang>(lang);
  const [format, setFormat] = useState<CardFormat>('square');
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const kinds: CardKind[] = number ? ['number', 'tagline', 'rule1', 'rule2', 'rule3', 'stat'] : ['tagline', 'rule1', 'rule2', 'rule3', 'stat'];
  const c = copy[cardLang];

  const draw = useCallback(async () => {
    setBusy(true);
    try {
      const ruleIndex = kind.startsWith('rule') ? Number(kind.slice(4)) - 1 : 0;
      const canvas = await renderShareCard({
        kind,
        format,
        lang: cardLang,
        host: window.location.host,
        number: number ? { display: number.display, count: number.count } : undefined,
        text: {
          tagline1: c.tagline1,
          tagline2: c.tagline2,
          taglineSub: c.taglineSub,
          ruleLabel: fmt(c.ruleLabel, { n: ruleIndex + 1 }),
          ruleTitle: c.rules[ruleIndex] ?? '',
          numberTitle: c.numberTitle,
          numberUnit: number && number.count === 1 ? c.numberUnit.one : c.numberUnit.other,
          numberNote: c.numberNote,
          statLine1: c.statLine1,
          statLine2: c.statLine2,
          statSource: c.statSource,
          footer: c.footer,
        },
      });
      const b = await canvasToBlob(canvas);
      setBlob(b);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(b);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }, [kind, format, cardLang, c, number]);

  useEffect(() => {
    if (open) draw();
  }, [open, draw]);

  useEffect(() => () => setPreview((old) => (old && URL.revokeObjectURL(old), null)), []);

  function pageUrl(): string {
    const origin = window.location.origin;
    if (kind === 'number' && number) return `${origin}/${cardLang}/n/${encodeURIComponent(number.norm)}`;
    if (kind === 'stat') return `${origin}/${cardLang}/findings`;
    return `${origin}/${cardLang}/learn`;
  }

  function message(): string {
    const url = pageUrl();
    if (kind === 'number' && number) {
      const display = cardLang === 'ur' ? ltrIsolate(number.display) : number.display;
      return fmt(c.text.number, { number: display, count: plural(c.reports, number.count), url });
    }
    if (kind === 'stat') return fmt(c.text.stat, { url });
    if (kind.startsWith('rule')) return fmt(c.text.rule, { rule: c.rules[Number(kind.slice(4)) - 1] ?? '', url });
    return fmt(c.text.tagline, { url });
  }

  const fileName = () => `hosh-${kind}-${cardLang}-${format}.png`;

  function save() {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus(ui.saved);
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], fileName(), { type: 'image/png' });
    const data: ShareData = { files: [file], text: message(), title: 'HOSH' };
    try {
      if (navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
    save();
    setStatus(ui.shareFailed);
  }

  const kindLabel: Record<CardKind, string> = ui.kinds;

  return (
    <dialog
      ref={ref}
      aria-labelledby="share-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="share-dialog fixed inset-0 m-0 hidden h-[100dvh] w-full items-end justify-center bg-transparent p-0 open:flex sm:items-center sm:p-6"
    >
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          {open && (
            <m.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="max-h-[94dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-surface p-5 text-ink shadow-[var(--shadow-2)] sm:rounded-[28px] sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="share-title" className="t-h3">
                  {ui.dialogTitle}
                </h2>
                <button type="button" onClick={onClose} className="btn btn-soft btn-icon" aria-label={closeLabel}>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className={cn('relative mx-auto mt-5 overflow-hidden rounded-2xl bg-navy', format === 'story' ? 'aspect-[9/16] max-h-[46dvh]' : 'aspect-square max-h-[42dvh]')}>
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={ui.previewAlt} className={cn('h-full w-full object-contain transition-opacity', busy && 'opacity-60')} />
                )}
                {busy && (
                  <span className="absolute inset-0 grid place-items-center text-offwhite">
                    <HangUpSpinner label={ui.making} />
                  </span>
                )}
              </div>

              <fieldset className="mt-5">
                <legend className="mb-2 font-semibold">{ui.cardLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className="chip min-h-11 px-3.5 py-1.5 text-[0.95rem]">
                      {kindLabel[k]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <fieldset>
                  <legend className="mb-2 font-semibold">{ui.languageLabel}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(['en', 'ur'] as Lang[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        lang={l}
                        aria-pressed={cardLang === l}
                        onClick={() => setCardLang(l)}
                        className={cn('chip min-h-11 px-3.5 py-1.5 text-[0.95rem]', l === 'ur' && 'font-urdu')}
                      >
                        {l === 'en' ? ui.english : ui.urdu}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 font-semibold">{ui.formatLabel}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(['square', 'story'] as CardFormat[]).map((f) => (
                      <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className="chip min-h-11 px-3.5 py-1.5 text-[0.95rem]">
                        {f === 'square' ? ui.square : ui.story}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                <button type="button" onClick={share} disabled={busy || !blob} className="btn btn-alarm btn-lg">
                  <Share2 className="h-5 w-5" aria-hidden="true" />
                  {ui.share}
                </button>
                <button type="button" onClick={save} disabled={busy || !preview} className="btn btn-ink btn-lg">
                  <Download className="h-5 w-5" aria-hidden="true" />
                  {ui.save}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(typeof window === 'undefined' ? '' : message())}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  {ui.whatsapp}
                </a>
              </div>
              <p role="status" className="mt-3 min-h-6 text-center text-muted t-small">
                {status}
              </p>
            </m.div>
          )}
        </LazyMotion>
      </MotionConfig>
    </dialog>
  );
}
