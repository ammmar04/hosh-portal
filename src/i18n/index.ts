import en, { type Dictionary } from './en';
import ur from './ur';
import type { Lang } from './config';

const dictionaries: Record<Lang, Dictionary> = { en, ur };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };
