import Link from 'next/link';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { HoshLogo } from '@/components/brand/HoshLogo';
import { DesktopNav, LangToggle, MobileMenu, ThemeToggle } from './HeaderControls';

export function Header({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const h = dict.header;
  return (
    <header className="navy-block on-navy sticky top-0 z-40 border-b border-offwhite/10" style={{ viewTransitionName: 'site-header' }}>
      <div className="wrap flex h-16 items-center gap-3 lg:h-[72px]">
        <Link href={`/${lang}`} aria-label={h.homeLabel} className="-ms-1 inline-flex shrink-0 rounded-lg p-1 text-offwhite">
          <HoshLogo variant="wordmark" className="h-[26px] w-auto lg:h-[30px]" title="HOSH" />
        </Link>
        <div className="ms-4 hidden lg:block">
          <DesktopNav lang={lang} labels={dict.nav} ariaLabel={h.mainNav} />
        </div>
        <div className="ms-auto flex items-center gap-2">
          <LangToggle lang={lang} text={h.langText} />
          <ThemeToggle toDark={h.themeToDark} toLight={h.themeToLight} />
          <MobileMenu
            lang={lang}
            labels={dict.nav}
            menuLabel={h.menu}
            closeLabel={h.closeMenu}
            ariaLabel={h.mainNav}
            emergency={h.menuEmergency}
          />
        </div>
      </div>
    </header>
  );
}
