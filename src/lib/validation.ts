import { isLang } from '@/i18n/config';
import { cleanText, maskStory, STORY_MAX } from './mask';
import { normalizeNumber, type NormalizeError } from './phone';
import { ASKED, LOSS_BANDS, SCAM_TYPES, type Asked, type LossBand, type NewReport, type ScamType } from './types';

export type ValidationError =
  | { field: 'number'; code: NormalizeError }
  | { field: 'scam_type' | 'asked' | 'loss_band' | 'story' | 'lang' | 'body'; code: string };

const isOneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] =>
  typeof v === 'string' && (list as readonly string[]).includes(v);

/** Allow-list validation for a new report. Returns a clean, masked record or the first error. */
export function validateNewReport(body: unknown): { ok: true; value: NewReport } | { ok: false; error: ValidationError } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: { field: 'body', code: 'invalid' } };
  const b = body as Record<string, unknown>;

  if (typeof b.number !== 'string' || b.number.length > 40) return { ok: false, error: { field: 'number', code: 'empty' } };
  const num = normalizeNumber(b.number);
  if (!num.ok) return { ok: false, error: { field: 'number', code: num.error } };

  if (!isOneOf(SCAM_TYPES, b.scam_type)) return { ok: false, error: { field: 'scam_type', code: 'required' } };

  if (!Array.isArray(b.asked) || b.asked.length === 0 || b.asked.length > ASKED.length)
    return { ok: false, error: { field: 'asked', code: 'required' } };
  const askedSet = new Set<Asked>();
  for (const a of b.asked) {
    if (!isOneOf(ASKED, a)) return { ok: false, error: { field: 'asked', code: 'invalid' } };
    askedSet.add(a);
  }
  // "Nothing yet" cannot be combined with anything else.
  if (askedSet.size > 1) askedSet.delete('nothing');

  if (!isOneOf(LOSS_BANDS, b.loss_band)) return { ok: false, error: { field: 'loss_band', code: 'required' } };

  let story: string | null = null;
  if (b.story != null && b.story !== '') {
    if (typeof b.story !== 'string') return { ok: false, error: { field: 'story', code: 'invalid' } };
    const cleaned = cleanText(b.story);
    if ([...cleaned].length > STORY_MAX) return { ok: false, error: { field: 'story', code: 'too_long' } };
    story = cleaned ? maskStory(cleaned) : null;
  }

  const lang = isLang(b.lang) ? b.lang : 'en';

  return {
    ok: true,
    value: {
      number_norm: num.norm,
      number_display: num.display,
      scam_type: b.scam_type as ScamType,
      asked: ASKED.filter((a) => askedSet.has(a)),
      loss_band: b.loss_band as LossBand,
      story,
      lang,
    },
  };
}

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
