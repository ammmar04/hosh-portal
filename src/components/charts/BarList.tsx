import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type BarRow = { key: string; label: string; value: number; icon?: LucideIcon; emphasis?: boolean };

/**
 * Horizontal bar list for nominal categories: one colour for every bar (the
 * label names it), value at the tip, bars grow from the start edge (right in
 * Urdu). Thin 10px marks, square at the baseline, 4px rounded data end.
 * Every value is printed, so the list doubles as its own table view.
 */
export function BarList({ rows, max, unit, className }: { rows: BarRow[]; max?: number; unit?: string; className?: string }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className={cn('grid gap-3.5', className)}>
      {rows.map((r) => {
        const Icon = r.icon;
        const pct = Math.max(r.value > 0 ? 2 : 0, (r.value / top) * 100);
        return (
          <li key={r.key} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-semibold">
                {Icon && <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />}
                {r.label}
              </span>
              <span className="t-num shrink-0 font-bold">
                {r.value}
                {unit && <span className="ms-1 font-sans font-medium text-muted">{unit}</span>}
              </span>
            </div>
            <div className="h-2.5" aria-hidden="true">
              <div
                className={cn('h-full rounded-e-[4px] transition-[width] duration-700', r.emphasis ? 'bg-alarm' : 'bg-[var(--bar)]')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
