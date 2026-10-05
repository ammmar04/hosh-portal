import { cn } from '@/lib/cn';

export type DotKind = 'ring' | 'quiet' | 'ink' | 'red' | 'empty';

const DOT: Record<DotKind, string> = {
  ring: 'border-2 border-muted bg-transparent',
  quiet: 'bg-[var(--dot-quiet)]',
  ink: 'bg-ink',
  red: 'bg-alarm',
  empty: 'border-2 border-dashed border-line-strong bg-transparent',
};

/**
 * Unit chart: one dot per person. Identity is carried by fill (hollow vs solid)
 * as well as colour, and every group is named with its count in the legend.
 */
export function UnitChart({
  groups,
  label,
  columns = 13,
  size = 'md',
  className,
}: {
  groups: { kind: DotKind; count: number }[];
  label: string;
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dots = groups.flatMap((g) => Array.from({ length: g.count }, () => g.kind));
  const gap = size === 'lg' ? 'gap-[7px]' : size === 'sm' ? 'gap-[4px]' : 'gap-[5px]';
  return (
    <div role="img" aria-label={label} className={className}>
      <div dir="ltr" className={cn('dot-grid grid', gap)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {dots.map((kind, i) => (
          <span key={i} className={cn('dot aspect-square rounded-full', DOT[kind])} style={{ ['--d' as string]: `${Math.min(i * 12, 900)}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { kind: DotKind; label: string; count?: number }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-2">
          <span className={cn('h-3.5 w-3.5 shrink-0 rounded-full', DOT[it.kind])} aria-hidden="true" />
          {it.count !== undefined && <span className="t-num font-bold">{it.count}</span>}
          <span className="text-ink-2">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
