'use client';

import { useEffect, useState } from 'react';
import { formatDateTime, timeAgo, type TimeDict } from '@/lib/time';

/** "3 min ago" that keeps itself up to date. The full date is in the title and dateTime. */
export function TimeAgo({ iso, t, className }: { iso: string; t: TimeDict; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time dateTime={iso} title={formatDateTime(iso, t)} className={className} suppressHydrationWarning>
      {timeAgo(iso, t, now)}
    </time>
  );
}
