'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import type { Dictionary } from '@/i18n';

type State = 'idle' | 'confirm' | 'sending' | 'done' | 'already' | 'failed';

/** "Report abuse" under a story. Three flags from different people hide the report. */
export function FlagButton({ reportId, t }: { reportId: string; t: Dictionary['number']['abuse'] }) {
  const [state, setState] = useState<State>('idle');

  async function send() {
    setState('sending');
    try {
      const res = await fetch(`/api/reports/${reportId}/flag`, { method: 'POST' });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; duplicate?: boolean } | null;
      if (!res.ok || !data?.ok) return setState('failed');
      setState(data.duplicate ? 'already' : 'done');
    } catch {
      setState('failed');
    }
  }

  return (
    <div aria-live="polite" className="text-[0.95rem]">
      {state === 'idle' && (
        <button type="button" onClick={() => setState('confirm')} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
          <Flag className="h-4 w-4" aria-hidden="true" />
          {t.button}
        </button>
      )}
      {(state === 'confirm' || state === 'sending') && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-sunk p-3">
          <p className="basis-full font-semibold">{t.confirm}</p>
          <button type="button" onClick={send} disabled={state === 'sending'} className="btn btn-ink min-h-11 px-4 text-[0.95rem]">
            {t.yes}
          </button>
          <button type="button" onClick={() => setState('idle')} className="btn btn-ghost min-h-11 px-4 text-[0.95rem]">
            {t.cancel}
          </button>
        </div>
      )}
      {state === 'done' && <p className="font-semibold text-safe">{t.done}</p>}
      {state === 'already' && <p className="font-semibold text-muted">{t.already}</p>}
      {state === 'failed' && (
        <button type="button" onClick={() => setState('confirm')} className="font-semibold text-alarm-ink underline">
          {t.failed}
        </button>
      )}
    </div>
  );
}
