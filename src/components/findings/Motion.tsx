'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Counts up to `value` when scrolled into view. The final number is in the
 * server HTML and in a screen-reader-only copy, so nothing depends on JS.
 */
export function CountUp({ value, suffix = '', duration = 1200, className }: { value: number; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(value * eased)}${suffix}`;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    el.textContent = `0${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = `${value}${suffix}`;
    };
  }, [value, suffix, duration]);
  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}

/**
 * Marks its children data-inview="false" only if they start off-screen, then
 * "true" once scrolled into view. CSS animates bars and dots from that.
 * Without JS, or with reduced motion, everything is simply shown.
 */
export function InView({ children, className, as: Tag = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'section' | 'ul' | 'ol' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'static' | 'waiting' | 'shown'>('static');
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9) return; // already visible: no animation, no flash
    setState('waiting');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as React.Ref<never>} data-inview={state === 'static' ? undefined : state === 'shown'} className={cn('inview', className)}>
      {children}
    </Tag>
  );
}
