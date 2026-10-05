import { cn } from '@/lib/cn';
import { BRAND_RED, HANDSET_PATH } from './HoshLogo';

/**
 * The signature motif: a red circle holding a hang-up handset.
 * Used for the main button, the loading spinner, empty states and bullets.
 */
export function HangUpCircle({
  className,
  handsetClassName,
  label,
  ring = false,
}: {
  className?: string;
  handsetClassName?: string;
  /** Accessible label. Decorative when omitted. */
  label?: string;
  /** Adds pulsing rings around the circle (motion-safe). */
  ring?: boolean;
}) {
  // No positioning class by default, so callers can make it `absolute` for decoration.
  return (
    <span className={cn('inline-grid shrink-0 place-items-center', ring && 'relative', className)}>
      {ring && <span className="pulse-ring" aria-hidden="true" />}
      {/* 1-unit margin in the viewBox keeps the anti-aliased edge of the circle from being clipped flat */}
      <svg viewBox="-1 -1 106 106" className="relative h-full w-full" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        <circle cx="52" cy="52" r="52" fill={BRAND_RED} />
        <g className={handsetClassName}>
          <path fill="#FFF" transform="translate(52 55) scale(2.6) rotate(135) translate(-12 -12)" d={HANDSET_PATH} />
        </g>
      </svg>
    </span>
  );
}

/** Loading state: the hang-up circle with a slowly turning handset. */
export function HangUpSpinner({ className, label, showLabel = true }: { className?: string; label: string; showLabel?: boolean }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <HangUpCircle className="h-6 w-6" handsetClassName="spin-slow origin-center [transform-box:fill-box]" />
      <span className={showLabel ? undefined : 'sr-only'}>{label}</span>
    </span>
  );
}

/** Small red dot used as a list bullet. */
export function HangBullet({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('hang-bullet', className)} />;
}
