import { LOSS_BANDS, type LossBand } from '@/lib/types';

const VAR: Record<LossBand, string> = {
  none: 'var(--loss-0)',
  under_5k: 'var(--loss-1)',
  '5k_25k': 'var(--loss-2)',
  '25k_100k': 'var(--loss-3)',
  over_100k: 'var(--loss-4)',
};

/**
 * Small stacked bar of money-lost bands (part-to-whole, ordinal). Segments are
 * separated by a 2px surface gap; the legend lists every band with its count,
 * so the colour is never the only way to read it.
 */
export function LossBar({ counts, labels }: { counts: { key: LossBand; count: number }[]; labels: Record<LossBand, string> }) {
  const total = counts.reduce((s, c) => s + c.count, 0);
  const present = counts.filter((c) => c.count > 0);
  return (
    <div>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-e-[4px]" aria-hidden="true">
        {present.map((c) => (
          <span key={c.key} style={{ flexGrow: c.count, background: VAR[c.key] }} className="h-full min-w-[6px]" />
        ))}
        {total === 0 && <span className="h-full flex-1 bg-[var(--loss-0)]" />}
      </div>
      <ul className="mt-4 grid gap-2">
        {LOSS_BANDS.map((key) => {
          const count = counts.find((c) => c.key === key)?.count ?? 0;
          return (
            <li key={key} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5">
                <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: VAR[key] }} aria-hidden="true" />
                <span className={count === 0 ? 'text-muted' : undefined}>{labels[key]}</span>
              </span>
              <span className={count === 0 ? 't-num text-muted' : 't-num font-bold'}>{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
