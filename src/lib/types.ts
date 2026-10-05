import type { Lang } from '@/i18n/config';

export const SCAM_TYPES = [
  'courier',
  'bank_wallet',
  'family_arrest',
  'police_govt',
  'prize_scheme',
  'job_fee',
  'whatsapp',
  'fake_link',
  'other',
] as const;
export type ScamType = (typeof SCAM_TYPES)[number];

export const ASKED = ['otp', 'money', 'personal_info', 'link', 'app', 'nothing'] as const;
export type Asked = (typeof ASKED)[number];

export const LOSS_BANDS = ['none', 'under_5k', '5k_25k', '25k_100k', 'over_100k'] as const;
export type LossBand = (typeof LOSS_BANDS)[number];

export type Report = {
  id: string;
  number_norm: string;
  number_display: string;
  scam_type: ScamType;
  asked: Asked[];
  loss_band: LossBand;
  story: string | null;
  lang: Lang;
  reported_officially: boolean | null;
  flag_count: number;
  hidden: boolean;
  is_sample: boolean;
  created_at: string;
};

/** What the public API and public pages are allowed to see. */
export type PublicReport = Pick<
  Report,
  'id' | 'number_norm' | 'number_display' | 'scam_type' | 'asked' | 'loss_band' | 'story' | 'lang' | 'is_sample' | 'created_at'
>;

export type NewReport = Pick<Report, 'number_norm' | 'number_display' | 'scam_type' | 'asked' | 'loss_band' | 'story' | 'lang'> & {
  is_sample?: boolean;
  created_at?: string;
};

export function toPublic(r: Report): PublicReport {
  return {
    id: r.id,
    number_norm: r.number_norm,
    number_display: r.number_display,
    scam_type: r.scam_type,
    asked: r.asked,
    loss_band: r.loss_band,
    story: r.story,
    lang: r.lang,
    is_sample: r.is_sample,
    created_at: r.created_at,
  };
}

export type Risk = 'none' | 'reported' | 'often';

export function riskFor(count: number): Risk {
  if (count <= 0) return 'none';
  if (count < 3) return 'reported';
  return 'often';
}

export type NumberSummary = {
  count: number;
  risk: Risk;
  types: { key: ScamType; count: number }[];
  asked: { key: Asked; count: number }[];
  losses: { key: LossBand; count: number }[];
  lostMoney: number;
  lastReportedAt: string | null;
  hasSamples: boolean;
};

export function summarize(reports: PublicReport[]): NumberSummary {
  const typeCounts = new Map<ScamType, number>();
  const askedCounts = new Map<Asked, number>();
  const lossCounts = new Map<LossBand, number>();
  for (const r of reports) {
    typeCounts.set(r.scam_type, (typeCounts.get(r.scam_type) ?? 0) + 1);
    for (const a of r.asked) askedCounts.set(a, (askedCounts.get(a) ?? 0) + 1);
    lossCounts.set(r.loss_band, (lossCounts.get(r.loss_band) ?? 0) + 1);
  }
  const byCount = <K,>(m: Map<K, number>) =>
    [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  return {
    count: reports.length,
    risk: riskFor(reports.length),
    types: byCount(typeCounts),
    asked: byCount(askedCounts),
    losses: LOSS_BANDS.map((key) => ({ key, count: lossCounts.get(key) ?? 0 })),
    lostMoney: reports.filter((r) => r.loss_band !== 'none').length,
    lastReportedAt: reports[0]?.created_at ?? null,
    hasSamples: reports.some((r) => r.is_sample),
  };
}
