'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Download, Eye, EyeOff, Flag, LogOut, RefreshCw, Search, Trash2 } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import { fmt, plural } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { LOSS_BANDS, SCAM_TYPES, type Report } from '@/lib/types';
import { formatDateTime } from '@/lib/time';
import { cn } from '@/lib/cn';
import { Ltr } from '@/components/ui/Ltr';
import type { ReportLabels } from '@/components/reports/labels';

type Filter = 'all' | 'flagged' | 'hidden' | 'visible' | 'sample';

export function AdminPanel({ t, labels, storage, initial }: { lang: Lang; t: Dictionary['admin']; labels: ReportLabels; storage: 'supabase' | 'local'; initial: Report[] }) {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  async function reload() {
    const res = await fetch('/api/admin/reports', { cache: 'no-store' });
    if (res.status === 401) return router.refresh();
    const data = (await res.json()) as { reports: Report[] };
    setReports(data.reports);
  }

  async function setHidden(r: Report, hidden: boolean) {
    setBusyId(r.id);
    const res = await fetch(`/api/admin/reports/${r.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ hidden }) });
    if (res.ok) setReports((all) => all.map((x) => (x.id === r.id ? { ...x, hidden } : x)));
    setBusyId(null);
  }

  async function remove(r: Report) {
    if (!window.confirm(t.confirmDelete)) return;
    setBusyId(r.id);
    const res = await fetch(`/api/admin/reports/${r.id}`, { method: 'DELETE' });
    if (res.ok) setReports((all) => all.filter((x) => x.id !== r.id));
    setBusyId(null);
  }

  async function removeSamples() {
    const n = reports.filter((r) => r.is_sample).length;
    if (!n || !window.confirm(fmt(t.confirmDeleteSamples, { n }))) return;
    const res = await fetch('/api/admin/samples', { method: 'DELETE' });
    if (res.ok) {
      const data = (await res.json()) as { removed: number };
      setReports((all) => all.filter((x) => !x.is_sample));
      setNotice(plural(t.deletedSamples, data.removed));
    }
  }

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  const counts = useMemo(
    () => ({
      total: reports.length,
      flagged: reports.filter((r) => r.flag_count > 0).length,
      hidden: reports.filter((r) => r.hidden).length,
      samples: reports.filter((r) => r.is_sample).length,
      officially: reports.filter((r) => r.reported_officially === true).length,
      byType: SCAM_TYPES.map((k) => ({ k, n: reports.filter((r) => r.scam_type === k).length })).sort((a, b) => b.n - a.n),
      byLoss: LOSS_BANDS.map((k) => ({ k, n: reports.filter((r) => r.loss_band === k).length })),
    }),
    [reports],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[\s-]/g, '');
    return reports.filter((r) => {
      if (filter === 'flagged' && r.flag_count === 0) return false;
      if (filter === 'hidden' && !r.hidden) return false;
      if (filter === 'visible' && r.hidden) return false;
      if (filter === 'sample' && !r.is_sample) return false;
      if (!q) return true;
      return r.number_norm.toLowerCase().includes(q) || (r.story ?? '').toLowerCase().replace(/[\s-]/g, '').includes(q);
    });
  }, [reports, query, filter]);

  const maxType = Math.max(1, ...counts.byType.map((x) => x.n));
  const maxLoss = Math.max(1, ...counts.byLoss.map((x) => x.n));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-static">{storage === 'supabase' ? t.storage.supabase : t.storage.local}</span>
        <div className="ms-auto flex flex-wrap gap-2">
          <button type="button" onClick={reload} className="btn btn-soft min-h-11 px-4 text-[0.95rem]">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.refresh}
          </button>
          <a href="/api/admin/export" className="btn btn-ink min-h-11 px-4 text-[0.95rem]">
            <Download className="h-4 w-4" aria-hidden="true" />
            {t.downloadCsv}
          </a>
          <button type="button" onClick={removeSamples} disabled={!counts.samples} className="btn btn-alarm min-h-11 px-4 text-[0.95rem]">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t.deleteSamples}
          </button>
          <button type="button" onClick={signOut} className="btn btn-ghost min-h-11 px-4 text-[0.95rem]">
            <LogOut className="mirror-rtl h-4 w-4" aria-hidden="true" />
            {t.signOut}
          </button>
        </div>
      </div>
      <p role="status" className={notice ? 'font-semibold text-safe' : 'sr-only'}>
        {notice}
      </p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(
          [
            [t.counts.total, counts.total],
            [t.counts.flagged, counts.flagged],
            [t.counts.hidden, counts.hidden],
            [t.counts.samples, counts.samples],
            [t.counts.officially, counts.officially],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="card p-4">
            <dt className="text-muted t-small">{label}</dt>
            <dd className="font-display text-[2rem] font-extrabold leading-tight">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">{t.byType}</h2>
          <ul className="mt-3 grid gap-2">
            {counts.byType.map(({ k, n }) => (
              <li key={k} className="grid grid-cols-[minmax(0,10rem)_1fr_2rem] items-center gap-3 text-[0.95rem]">
                <span className="truncate">{labels.scamTypes[k].label}</span>
                <span className="h-2 rounded-e-[4px] bg-[var(--bar)]" style={{ width: `${(n / maxType) * 100}%` }} aria-hidden="true" />
                <span className="t-num text-end font-bold">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">{t.byLoss}</h2>
          <ul className="mt-3 grid gap-2">
            {counts.byLoss.map(({ k, n }, i) => (
              <li key={k} className="grid grid-cols-[minmax(0,10rem)_1fr_2rem] items-center gap-3 text-[0.95rem]">
                <span className="truncate">{labels.loss[k].label}</span>
                <span className="h-2 rounded-e-[4px]" style={{ width: `${(n / maxLoss) * 100}%`, background: `var(--loss-${i})` }} aria-hidden="true" />
                <span className="t-num text-end font-bold">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">{t.search}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="field min-h-11 ps-9" />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.columns.status}>
            {(['all', 'flagged', 'hidden', 'visible', 'sample'] as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="chip min-h-10 px-3 text-[0.9rem]">
                {t.filters[f]}
              </button>
            ))}
          </div>
        </div>
        <p className="px-4 pt-3 text-muted t-small">{fmt(t.showing, { shown: shown.length, total: reports.length })}</p>

        {shown.length === 0 ? (
          <p className="p-8 text-center text-muted">{t.noResults}</p>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((r) => (
              <li key={r.id} className={cn('grid gap-2 p-4 md:grid-cols-[11rem_9rem_minmax(0,1fr)_auto] md:items-start md:gap-4', r.hidden && 'bg-sunk/70')}>
                <div className="text-[0.9rem] text-muted">
                  {formatDateTime(r.created_at, labels.time)}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.is_sample && <span className="badge-sample">{labels.sample}</span>}
                    <span className={cn('rounded-full px-2 text-[0.75rem] font-bold', r.hidden ? 'bg-alarm-soft text-alarm-ink' : 'bg-safe-soft text-safe')}>
                      {r.hidden ? t.status.hidden : t.status.visible}
                    </span>
                  </div>
                </div>
                <div>
                  <Ltr mono className="font-bold">
                    {r.number_display}
                  </Ltr>
                  <div className="text-[0.9rem] text-ink-2">{labels.scamTypes[r.scam_type].label}</div>
                </div>
                <div className="min-w-0 text-[0.95rem]">
                  <p className="text-ink-2">
                    {r.asked.map((a) => labels.asked[a].label).join(', ')} · {labels.loss[r.loss_band].label}
                  </p>
                  {r.story && (
                    <p dir="auto" className="mt-1 break-words">
                      {r.story}
                    </p>
                  )}
                  {r.flag_count > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold text-alarm-ink">
                      <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.columns.flags}: {r.flag_count}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 md:justify-end">
                  <button type="button" disabled={busyId === r.id} onClick={() => setHidden(r, !r.hidden)} className="btn btn-soft min-h-10 px-3 text-[0.9rem]">
                    {r.hidden ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                    {r.hidden ? t.unhide : t.hide}
                  </button>
                  <button type="button" disabled={busyId === r.id} onClick={() => remove(r)} className="btn btn-ghost min-h-10 px-3 text-[0.9rem] text-alarm-ink">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {t.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
