/**
 * Rule-based scam message checker. Runs entirely in the browser.
 * Each signal has English, Roman Urdu and Urdu patterns. Nothing here can
 * prove a message is safe; the UI always says so.
 */
import { BRAND_KEYWORDS, OFFICIAL_DOMAINS, OFFICIAL_SUFFIXES, SHORTENERS } from '@/data/known-domains';
import type { Asked, ScamType } from './types';

export type SignalId =
  | 'otp'
  | 'urgency'
  | 'block'
  | 'prize'
  | 'fee'
  | 'courier'
  | 'link_short'
  | 'link_lookalike'
  | 'link_unknown'
  | 'app'
  | 'authority'
  | 'secret'
  | 'personal';

export const WEIGHTS: Record<SignalId, number> = {
  otp: 3,
  fee: 3,
  app: 3,
  link_short: 3,
  link_lookalike: 3,
  block: 2,
  prize: 2,
  secret: 2,
  personal: 2,
  link_unknown: 1,
  authority: 1,
  urgency: 1,
  courier: 1,
};

/** Display order: strongest signals first. */
export const SIGNAL_ORDER: SignalId[] = [
  'otp',
  'fee',
  'app',
  'link_short',
  'link_lookalike',
  'block',
  'prize',
  'secret',
  'personal',
  'authority',
  'urgency',
  'courier',
  'link_unknown',
];

export type Range = { start: number; end: number; signal: SignalId };
export type Finding = { id: SignalId; quotes: string[]; brand?: string };
export type Level = 'safe' | 'careful' | 'scam';
export type CheckResult = { level: Level; score: number; findings: Finding[]; ranges: Range[] };

// Urdu word characters for boundaries (JS \b only understands ASCII).
const P: Record<Exclude<SignalId, 'link_short' | 'link_lookalike' | 'link_unknown'>, RegExp[]> = {
  otp: [
    /\b(?:share|send|tell|give|forward|read|provide|enter|type|reply\s+with)\s+(?:me\s+|us\s+)?(?:the\s+|your\s+|that\s+|this\s+)?(?:\d-digit\s+)?(?:code|pin|otp|verification\s+code)\b/gi,
    /\b(?:code|pin|otp|kod)\b[^.!?\n]{0,25}?\b(?:bata\w*|bhej\w*|send\s+kar\w*|share\s+kar\w*|de\s*d[eio]\w*)/gi,
    /(?:کوڈ|او\s?ٹی\s?پی|پن\s?کوڈ|پاس\s?ورڈ)[^۔.!؟\n]{0,30}?(?:بھیج|بتا|شیئر|دے\s?د)\S*/gu,
  ],
  urgency: [
    /\b(?:within\s+\d+\s*(?:hours?|hrs?|minutes?|mins?|days?)|urgent(?:ly)?|immediately|right\s+now|today\s+only|last\s+chance|act\s+now|asap|final\s+(?:notice|warning|reminder)|expires?\s+(?:today|soon|in))\b/gi,
    /\b(?:abhi|foran|fauran|fori|jaldi|aaj\s+hi|aaj)\b/gi,
    /(?:فوراً|فورا|ابھی|جلدی|آج\s?ہی|فوری|\d+\s?گھنٹ\S*)/gu,
  ],
  block: [
    /\b(?:account|acc|a\/c|sim|card|wallet|number|whatsapp|connection|jazzcash|easypaisa)\b[^.!?\n]{0,40}?\b(?:block(?:ed)?|suspend(?:ed)?|deactivat(?:e|ed)|clos(?:e|ed)|disabl(?:e|ed)|freez(?:e|ed)|frozen|band)\b/gi,
    /\b(?:will\s+be|has\s+been|is\s+being)\s+(?:blocked|suspended|deactivated|closed|disabled|frozen)\b/gi,
    /\b(?:band|block)\s+ho\s+ja\w*(?:\s+ga)?\b/gi,
    /(?:بند|بلاک|معطل)\s?(?:ہو\s?جائے\s?گا|ہو\s?جائیں\s?گے|کر\s?دیا\s?جائے\s?گا|کر\s?دی\s?جائے\s?گی)/gu,
  ],
  prize: [
    /\b(?:you\s+(?:have|'ve)\s+won|winner|congratulations|congrats|prize|lottery|lucky\s+draw|jackpot|cash\s+reward|reward|bisp|benazir|ehsaas|kafaalat|grant)\b/gi,
    /\b(?:inaam|inam|mubarak\s+ho|qurandazi|jeet\s+gaye)\b/gi,
    /(?:انعام|مبارک\s?ہو|قرعہ\s?اندازی|بینظیر|احساس\s?پروگرام|لاٹری|گرانٹ|جیت\s?گئے)/gu,
  ],
  fee: [
    /\b(?:processing|delivery|redelivery|re-delivery|registration|release|clearance|customs|service|activation|verification|tax|transfer|handling|token)\s+(?:fee|fees|charges?)\b/gi,
    /\b(?:pay|send|deposit|transfer)\s+(?:rs\.?|pkr|rupees?)\s?[\d,]+/gi,
    /\badvance\s+(?:payment|fee)\b/gi,
    /\bfee?s?\s+(?:jama|bhej|ada)\w*/gi,
    /(?:فیس|چارجز|رقم\s?جمع|پیسے\s?جمع)/gu,
  ],
  courier: [
    /\b(?:parcel|package|courier|shipment|consignment|delivery|tracking\s+(?:number|id|code)|tcs|leopards|m&p|dhl|fedex|pakistan\s+post)\b/gi,
    /(?:پارسل|کورئیر|کوریئر|ڈلیوری|ترسیل)/gu,
  ],
  app: [
    /\b(?:install|download)\b[^.!?\n]{0,30}?\b(?:app|application|apk)\b/gi,
    /\b(?:app|apk)\b[^.!?\n]{0,15}?\b(?:install|download)\w*/gi,
    /\b\w+\.apk\b/gi,
    /\b(?:anydesk|teamviewer|quick\s?support|rustdesk|airdroid|screen\s?shar\w*)\b/gi,
    /(?:ایپ|ایپلیکیشن)[^۔\n]{0,15}?(?:انسٹال|ڈاؤن\s?لوڈ)\S*/gu,
    /انسٹال\s?کر\S*/gu,
  ],
  authority: [
    /\b(?:police|fia|nccia|pta|sbp|state\s+bank|nadra|fbr|cyber\s?crime|court|warrant|customs|ministry|govt|government|hbl|ubl|mcb|meezan|alfalah|nbp|allied\s+bank|jazzcash|easypaisa)\b/gi,
    /(?:پولیس|ایف\s?آئی\s?اے|تھانہ|عدالت|وارنٹ|اسٹیٹ\s?بینک|نادرا|پی\s?ٹی\s?اے|حکومت)/gu,
  ],
  secret: [
    /\b(?:do\s+not|don'?t|never)\s+(?:tell|share|inform|show|disclose)\s+(?:this\s+)?(?:to\s+)?(?:anyone|anybody|any\s?one|others|your\s+family)\b/gi,
    /\bkeep\s+(?:it|this)\s+(?:secret|confidential|private)\b/gi,
    /\bkisi\s+ko\s+(?:mat|na|nahi?)\s+bata\w*/gi,
    /کسی\s?کو\s?(?:نہ|مت)\s?بتا\S*/gu,
    /(?:راز|خفیہ)\s?(?:رکھ\S*)/gu,
  ],
  personal: [
    /\b(?:cnic|id\s+card|identity\s+card|date\s+of\s+birth|mother'?s?\s+name|account\s+(?:number|no)|card\s+number|expiry\s+date|iban)\b/gi,
    /\bshanakhti\s+card\b/gi,
    /(?:شناختی\s?کارڈ|اکاؤنٹ\s?نمبر|ب\s?فارم|والدہ\s?کا\s?نام)/gu,
  ],
};

/** Mentioning a code is normal in real OTP messages; only asking for it is a strong sign. */
const OTP_MENTION = /\b(?:otp|one[\s-]?time\s+(?:pass(?:word|code)?|code|pin)|verification\s+code|security\s+code|[4-6][\s-]?digit\s+code|m-?pin|atm\s+pin|cvv)\b/gi;

const TLDS =
  'com|net|org|info|biz|pk|xyz|top|site|online|live|link|click|shop|store|club|app|vip|buzz|icu|win|bid|loan|work|support|help|services|page|tech|digital|today|me|io|co|cc|tk|ml|ga|cf|gq|ly|gl|gd|id|to|ws|us|uk|in|ae|cn|ru|sh|gy|pw|in|lk|bd|tv|fun|space|website|cfd|sbs|rest|bond|monster|cyou|lat|asia|mobi|pro';
const URL_RE = new RegExp(
  String.raw`(?:https?:\/\/)?(?:www\.)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}(?::\d{2,5})?(?:\/[^\s"'<>،۔]*)?`,
  'gi',
);
const TLD_RE = new RegExp(`^(?:${TLDS})$`);

function classifyHost(host: string): { id: 'link_short' | 'link_lookalike' | 'link_unknown' | null; brand?: string } {
  const h = host.toLowerCase().replace(/^www\./, '');
  if (SHORTENERS.some((s) => h === s)) return { id: 'link_short' };
  if (OFFICIAL_SUFFIXES.some((s) => h.endsWith(s))) return { id: null };
  if (OFFICIAL_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`))) return { id: null };
  const brand = BRAND_KEYWORDS.find(([k]) => h.includes(k));
  if (brand) return { id: 'link_lookalike', brand: brand[1] };
  return { id: 'link_unknown' };
}

function findLinks(text: string): { range: Range; brand?: string }[] {
  const out: { range: Range; brand?: string }[] = [];
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[0].replace(/[.,;:!?)]+$/, '');
    const start = m.index ?? 0;
    if (start > 0 && text[start - 1] === '@') continue; // part of an email address
    const explicit = /^(?:https?:\/\/|www\.)/i.test(raw);
    const host = raw.replace(/^https?:\/\//i, '').split(/[/:?#]/)[0] ?? '';
    const tld = host.split('.').pop()?.toLowerCase() ?? '';
    if (!explicit && !TLD_RE.test(tld)) continue;
    if (/^\d+(\.\d+)+$/.test(host)) continue; // version numbers, amounts
    const c = classifyHost(host);
    if (!c.id) continue;
    out.push({ range: { start, end: start + raw.length, signal: c.id }, brand: c.brand });
  }
  return out;
}

export function checkMessage(input: string): CheckResult {
  const text = input.slice(0, 5000);
  const ranges: Range[] = [];
  const quotes = new Map<SignalId, Set<string>>();
  const brands = new Map<SignalId, string>();

  const add = (r: Range) => {
    // Do not swallow trailing punctuation (English or Urdu) into a highlight.
    while (r.end > r.start && /[\s.,;:!?)\u06D4\u060C\u061F]/.test(text[r.end - 1]!)) r.end--;
    ranges.push(r);
    const q = text.slice(r.start, r.end).trim();
    if (!quotes.has(r.signal)) quotes.set(r.signal, new Set());
    if (q) quotes.get(r.signal)!.add(q.length > 60 ? `${q.slice(0, 57)}...` : q);
  };

  for (const link of findLinks(text)) {
    add(link.range);
    if (link.brand) brands.set(link.range.signal, link.brand);
  }

  for (const [id, patterns] of Object.entries(P) as [SignalId, RegExp[]][]) {
    for (const re of patterns) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        const start = m.index ?? 0;
        // A brand name inside a link is the link's signal, not a separate claim.
        if (ranges.some((r) => r.signal.startsWith('link') && start >= r.start && start < r.end)) continue;
        add({ start, end: start + m[0].length, signal: id });
      }
    }
  }

  // Weak "mentions a code" only counts when nothing stronger already asked for it.
  let otpWeight = quotes.has('otp') ? WEIGHTS.otp : 0;
  if (!quotes.has('otp')) {
    OTP_MENTION.lastIndex = 0;
    for (const m of text.matchAll(OTP_MENTION)) {
      const start = m.index ?? 0;
      add({ start, end: start + m[0].length, signal: 'otp' });
      otpWeight = 1;
    }
  }

  const findings: Finding[] = SIGNAL_ORDER.filter((id) => quotes.has(id)).map((id) => ({
    id,
    quotes: [...(quotes.get(id) ?? [])].slice(0, 3),
    brand: brands.get(id),
  }));
  const score = findings.reduce((sum, f) => sum + (f.id === 'otp' ? otpWeight : WEIGHTS[f.id]), 0);
  // One weak sign on its own (a single "abhi", an unknown link) is not enough to warn.
  const level: Level = score >= 4 ? 'scam' : score >= 2 ? 'careful' : 'safe';
  return { level, score, findings, ranges };
}

/** Merge overlapping ranges into highlight segments for display. */
export function segments(text: string, ranges: Range[]): { text: string; signals: SignalId[] }[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: { start: number; end: number; signals: Set<SignalId> }[] = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && r.start < last.end) {
      last.end = Math.max(last.end, r.end);
      last.signals.add(r.signal);
    } else merged.push({ start: r.start, end: r.end, signals: new Set([r.signal]) });
  }
  const out: { text: string; signals: SignalId[] }[] = [];
  let pos = 0;
  for (const m of merged) {
    if (m.start > pos) out.push({ text: text.slice(pos, m.start), signals: [] });
    out.push({ text: text.slice(m.start, m.end), signals: [...m.signals] });
    pos = m.end;
  }
  if (pos < text.length) out.push({ text: text.slice(pos), signals: [] });
  return out;
}

/** Best guess for prefilling the report form from a checked message. */
export function guessReport(result: CheckResult): { scam_type: ScamType; asked: Asked[] } {
  const has = (id: SignalId) => result.findings.some((f) => f.id === id);
  let scam_type: ScamType = 'fake_link';
  if (has('courier')) scam_type = 'courier';
  else if (has('prize')) scam_type = 'prize_scheme';
  else if (has('block')) scam_type = 'bank_wallet';
  else if (has('authority')) scam_type = 'police_govt';
  else if (has('fee')) scam_type = 'job_fee';
  else if (!result.findings.some((f) => f.id.startsWith('link'))) scam_type = 'other';
  const asked: Asked[] = [];
  if (has('otp')) asked.push('otp');
  if (has('fee')) asked.push('money');
  if (has('personal')) asked.push('personal_info');
  if (result.findings.some((f) => f.id.startsWith('link'))) asked.push('link');
  if (has('app')) asked.push('app');
  return { scam_type, asked };
}
