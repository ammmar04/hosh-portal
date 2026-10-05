import { cn } from '@/lib/cn';

/** Keeps phone numbers and digits left-to-right inside Urdu text. */
export function Ltr({ children, className, mono = false }: { children: React.ReactNode; className?: string; mono?: boolean }) {
  return (
    <bdi dir="ltr" className={cn(mono && 't-num', className)}>
      {children}
    </bdi>
  );
}
