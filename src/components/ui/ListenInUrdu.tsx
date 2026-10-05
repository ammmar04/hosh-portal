'use client';

import { useId, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Placeholder "Listen in Urdu" button. Spoken guidance is a proposal for
 * NCCIA, not a working feature, and the tooltip says so.
 */
export function ListenInUrdu({
  label,
  tooltip,
  badge,
  onNavy = false,
  className,
}: {
  label: string;
  tooltip: string;
  badge: string;
  onNavy?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className={cn('relative inline-flex', className)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-describedby={id}
        className={cn('btn min-h-12 gap-2 px-4 text-[0.98rem]', onNavy ? 'btn-on-navy' : 'btn-ghost')}
      >
        <Volume2 className="h-5 w-5" aria-hidden="true" />
        <span>{label}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[0.72rem] font-bold', onNavy ? 'bg-gold text-navy' : 'bg-amber-soft text-amber-ink')}>
          {badge}
        </span>
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'absolute start-0 top-full z-20 mt-2 w-[min(82vw,340px)] rounded-2xl bg-ink p-4 text-[0.95rem] leading-relaxed text-bg shadow-[var(--shadow-2)] transition-[opacity,transform] duration-200',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        {tooltip}
      </span>
    </span>
  );
}
