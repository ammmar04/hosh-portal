'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { ShareProps } from './types';

// The dialog (canvas drawing, motion) only downloads when someone taps Share.
const ShareDialog = dynamic(() => import('./ShareDialog').then((m) => m.ShareDialog), { ssr: false });

export function ShareButton({
  label,
  className,
  icon = true,
  share,
  children,
}: {
  label: string;
  className?: string;
  icon?: boolean;
  share: ShareProps;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-label={children ? label : undefined}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        onPointerEnter={() => setMounted(true)}
      >
        {children ?? (
          <>
            {icon && <Share2 className="h-5 w-5" aria-hidden="true" />}
            {label}
          </>
        )}
      </button>
      {mounted && <ShareDialog {...share} open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
