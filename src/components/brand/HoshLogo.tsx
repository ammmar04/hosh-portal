import { cn } from '@/lib/cn';

/** Lucide "phone" path, rotated 135° into a hang-up handset. Shared by the logo and the motif. */
export const HANDSET_PATH =
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z';

export const BRAND_RED = '#E5484D';

type Props = {
  variant?: 'full' | 'mark' | 'wordmark';
  className?: string;
  /** Tagline under the full lockup. Defaults to the English brand line. */
  tagline?: string;
  title?: string;
};

function Wordmark({ className, title = 'HOSH' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="-2 -4 344 108" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <g fill="none" stroke="currentColor" strokeWidth="18">
        <path d="M9 0V100M55 0V100M9 50H55" />
        <path d="M253 29.5A24 20.5 0 1 0 229 50A24 20.5 0 1 1 205 70.5" />
        <path d="M285 0V100M331 0V100M285 50H331" />
      </g>
      <circle cx="130" cy="50" r="52" fill={BRAND_RED} />
      <path fill="#FFF" transform="translate(130 53) scale(2.6) rotate(135) translate(-12 -12)" d={HANDSET_PATH} />
    </svg>
  );
}

function Mark({ className, title = 'HOSH' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="77 -3 106 106" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="130" cy="50" r="52" fill={BRAND_RED} />
      <path fill="#FFF" transform="translate(130 53) scale(2.6) rotate(135) translate(-12 -12)" d={HANDSET_PATH} />
    </svg>
  );
}

/**
 * <HoshLogo variant="full|mark|wordmark" />
 * The H, S and H take currentColor (off-white on navy). The O is always the red hang-up button.
 */
export function HoshLogo({ variant = 'wordmark', className, tagline = 'Scam call? Hang up.', title }: Props) {
  if (variant === 'mark') return <Mark className={className} title={title} />;
  if (variant === 'wordmark') return <Wordmark className={className} title={title} />;
  // The lockup is English brand artwork, so it stays left-to-right on Urdu pages too.
  return (
    <div dir="ltr" lang="en" className={cn('inline-flex flex-col gap-3 text-left', className)}>
      <Wordmark className="h-auto w-full max-w-[220px]" title={title} />
      <div className="flex flex-col gap-1">
        <span className="font-display text-xl font-extrabold tracking-tight" lang="en">
          {tagline}
        </span>
        <span className="t-label text-[0.75rem] opacity-80" lang="en">
          <span className="text-gold">H</span>alting <span className="text-gold">O</span>nline <span className="text-gold">S</span>cams &amp;{' '}
          <span className="text-gold">H</span>acks
        </span>
      </div>
    </div>
  );
}
