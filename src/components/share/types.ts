import type { Dictionary } from '@/i18n';
import type { Lang } from '@/i18n/config';
import type { CardKind } from '@/lib/share-card';

/** Everything a share card needs in one language. Small and serialisable. */
export type CardCopy = {
  tagline1: string;
  tagline2: string;
  taglineSub: string;
  ruleLabel: string;
  rules: string[];
  numberTitle: string;
  numberUnit: { one: string; other: string };
  numberNote: string;
  statLine1: string;
  statLine2: string;
  statSource: string;
  footer: string;
  text: Dictionary['share']['text'];
  reports: { one: string; other: string };
};

export type ShareProps = {
  lang: Lang;
  copy: Record<Lang, CardCopy>;
  ui: Dictionary['share'];
  closeLabel: string;
  initialKind: CardKind;
  number?: { display: string; norm: string; count: number };
};

export function cardCopy(d: Dictionary): CardCopy {
  return {
    tagline1: d.home.hero.line1,
    tagline2: d.home.hero.line2,
    taglineSub: d.share.card.taglineSub,
    ruleLabel: d.share.card.ruleLabel,
    rules: d.rules.map((r) => r.title),
    numberTitle: d.share.card.numberTitle,
    numberUnit: d.share.card.numberUnit,
    numberNote: d.share.card.numberNote,
    statLine1: d.share.card.statLine1,
    statLine2: d.share.card.statLine2,
    statSource: d.share.card.statSource,
    footer: d.share.card.footer,
    text: d.share.text,
    reports: d.common.reports,
  };
}
