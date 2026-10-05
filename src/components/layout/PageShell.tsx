import { ViewTransition } from 'react';
import { cn } from '@/lib/cn';

/**
 * Wraps each page's content. During client navigations React's ViewTransition
 * fades the old page out and lifts the new one in (CSS in globals.css).
 * The header and the floating button are anchored and never move.
 */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <main id="main" tabIndex={-1} className={cn('outline-none', className)}>
        {children}
      </main>
    </ViewTransition>
  );
}
