export const LANGS = ['en', 'ur'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'hosh-lang';

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ur';
}

export function dirFor(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ur' ? 'rtl' : 'ltr';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'ur' : 'en';
}

/** Swap the language prefix of a path: /en/check -> /ur/check */
export function swapLangInPath(pathname: string, to: Lang): string {
  const parts = pathname.split('/');
  if (isLang(parts[1])) {
    parts[1] = to;
    return parts.join('/') || `/${to}`;
  }
  return `/${to}${pathname === '/' ? '' : pathname}`;
}

/** Fill {placeholders} in a dictionary string. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in values ? String(values[key]) : `{${key}}`));
}

export type Plural = { one: string; other: string };

export function plural(forms: Plural, n: number, extra: Record<string, string | number> = {}): string {
  return fmt(n === 1 ? forms.one : forms.other, { n, ...extra });
}
