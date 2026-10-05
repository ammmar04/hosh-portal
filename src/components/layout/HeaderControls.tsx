'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  BookOpen,
  ChartColumnBig,
  ClipboardList,
  Home,
  Info,
  Megaphone,
  Menu,
  MessageSquareWarning,
  Moon,
  PhoneCall,
  Search,
  Sun,
  X,
  type LucideIcon,
} from 'lucide-react';
import { LANG_COOKIE, swapLangInPath, type Lang } from '@/i18n/config';
import { cn } from '@/lib/cn';
import { HangUpCircle } from '@/components/brand/HangUp';

export type NavKey = 'home' | 'check' | 'report' | 'message' | 'howTo' | 'learn' | 'findings' | 'tracker' | 'about';
export type NavLabels = Record<NavKey, string>;

const NAV: { key: NavKey; path: string; icon: LucideIcon }[] = [
  { key: 'home', path: '', icon: Home },
  { key: 'check', path: '/check', icon: Search },
  { key: 'report', path: '/report', icon: Megaphone },
  { key: 'message', path: '/message-check', icon: MessageSquareWarning },
  { key: 'howTo', path: '/how-to-report', icon: ClipboardList },
  { key: 'learn', path: '/learn', icon: BookOpen },
  { key: 'findings', path: '/findings', icon: ChartColumnBig },
  { key: 'tracker', path: '/tracker', icon: PhoneCall },
  { key: 'about', path: '/about', icon: Info },
];

const DESKTOP: NavKey[] = ['check', 'report', 'howTo', 'findings'];

function isActive(pathname: string, lang: Lang, path: string) {
  const full = `/${lang}${path}`;
  return path === '' ? pathname === full || pathname === `${full}/` : pathname === full || pathname.startsWith(`${full}/`);
}

export function DesktopNav({ lang, labels, ariaLabel }: { lang: Lang; labels: NavLabels; ariaLabel: string }) {
  const pathname = usePathname() || '';
  return (
    <nav aria-label={ariaLabel} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV.filter((n) => DESKTOP.includes(n.key)).map((n) => {
          const active = isActive(pathname, lang, n.path);
          return (
            <li key={n.key}>
              <Link
                href={`/${lang}${n.path}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.95rem] font-semibold transition-colors',
                  active ? 'bg-offwhite/12 text-offwhite' : 'text-offwhite/75 hover:bg-offwhite/8 hover:text-offwhite',
                )}
              >
                {labels[n.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** One tap to switch language. Remembers the choice in a cookie and keeps the current page and query. */
export function LangToggle({ lang, text }: { lang: Lang; text: string }) {
  const pathname = usePathname() || `/${lang}`;
  const to: Lang = lang === 'en' ? 'ur' : 'en';
  const href = swapLangInPath(pathname, to);
  return (
    <a
      href={href}
      lang={to}
      hrefLang={to}
      onClick={(e) => {
        document.cookie = `${LANG_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
        const search = window.location.search;
        if (search) {
          e.preventDefault();
          window.location.assign(href + search);
        }
      }}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full px-4 font-bold text-offwhite ring-1 ring-offwhite/25 transition hover:bg-offwhite/10 active:scale-95',
        to === 'ur' ? 'text-[1.05rem] leading-none' : 'text-[0.95rem]',
      )}
      // On English pages, show "اردو" in the phone's own Arabic-script font so the
      // 90 KB Urdu webfont is never downloaded for one word.
      style={to === 'ur' ? { fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Noto Sans Arabic UI', sans-serif" } : undefined}
    >
      {text}
    </a>
  );
}

const THEME_KEY = 'hosh-theme';

/** Light / dark toggle. Starts from the phone's setting; the icon is chosen by CSS so it never flashes. */
export function ThemeToggle({ toDark, toLight }: { toDark: string; toLight: string }) {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme === 'dark' || root.dataset.theme === 'light'
        ? root.dataset.theme
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle inline-grid h-11 w-11 place-items-center rounded-full text-offwhite ring-1 ring-offwhite/25 transition hover:bg-offwhite/10 active:scale-95"
    >
      <Moon className="theme-icon-moon h-5 w-5" aria-hidden="true" />
      <Sun className="theme-icon-sun h-5 w-5" aria-hidden="true" />
      <span className="theme-label-dark sr-only">{toDark}</span>
      <span className="theme-label-light sr-only">{toLight}</span>
    </button>
  );
}

export function MobileMenu({
  lang,
  labels,
  menuLabel,
  closeLabel,
  ariaLabel,
  emergency,
}: {
  lang: Lang;
  labels: NavLabels;
  menuLabel: string;
  closeLabel: string;
  ariaLabel: string;
  emergency: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname() || '';

  // Close the sheet after navigating.
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-haspopup="dialog"
        className="inline-flex h-11 items-center gap-2 rounded-full ps-3.5 pe-4 font-semibold text-offwhite ring-1 ring-offwhite/25 transition hover:bg-offwhite/10 active:scale-95"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">{menuLabel}</span>
        <span className="sr-only sm:hidden">{menuLabel}</span>
      </button>
      <dialog
        ref={ref}
        aria-label={menuLabel}
        className="menu-sheet fixed inset-0 h-[100dvh] w-full bg-navy text-offwhite on-navy"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
      >
        <div className="wrap flex h-full flex-col py-3">
          <div className="flex h-12 items-center justify-between">
            <HangUpCircle className="h-9 w-9" />
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="inline-flex h-11 items-center gap-2 rounded-full ps-3.5 pe-4 font-semibold ring-1 ring-offwhite/25 hover:bg-offwhite/10"
              autoFocus
            >
              <X className="h-5 w-5" aria-hidden="true" />
              {closeLabel}
            </button>
          </div>
          <nav aria-label={ariaLabel} className="mt-6 flex-1 overflow-y-auto">
            <ul className="grid gap-1">
              {NAV.map((n, i) => {
                const Icon = n.icon;
                const active = isActive(pathname, lang, n.path);
                return (
                  <li key={n.key} className="menu-item" style={{ ['--i' as string]: i }}>
                    <Link
                      href={`/${lang}${n.path}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => ref.current?.close()}
                      className={cn(
                        'flex min-h-14 items-center gap-4 rounded-2xl px-3 text-[1.25rem] font-bold transition-colors',
                        active ? 'bg-offwhite/10' : 'hover:bg-offwhite/6',
                      )}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-offwhite/8">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {labels[n.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <a href="tel:15" className="mt-4 mb-2 flex min-h-14 items-center gap-3 rounded-2xl bg-offwhite/6 px-4 text-[1rem] font-semibold">
            <PhoneCall className="h-5 w-5 text-gold" aria-hidden="true" />
            {emergency}
          </a>
        </div>
      </dialog>
    </>
  );
}
