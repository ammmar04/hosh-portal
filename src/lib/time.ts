/** Time words come from the dictionaries (dict.time) so all copy stays in en.ts / ur.ts. */
export type TimeDict = {
  justNow: string;
  minutes: { one: string; other: string };
  hours: { one: string; other: string };
  yesterday: string;
  days: { one: string; other: string };
  months: string[];
  /** [from hour (0-23), label] in ascending order, e.g. [[0,'am'],[12,'pm']] */
  periods: [number, string][];
  clock12: boolean;
  /** Separator between date and time, e.g. ', ' or the Urdu comma. */
  sep: string;
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const PKT_OFFSET = 5 * HOUR; // Pakistan Standard Time, no daylight saving

const pick = (forms: { one: string; other: string }, n: number) => (n === 1 ? forms.one : forms.other).replace('{n}', String(n));

/** Short relative time: "3 min ago" / "3 منٹ پہلے". */
export function timeAgo(iso: string, t: TimeDict, now: number = Date.now()): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '';
  const diff = Math.max(0, now - ts);
  if (diff < MIN) return t.justNow;
  if (diff < HOUR) return pick(t.minutes, Math.floor(diff / MIN));
  if (diff < DAY) return pick(t.hours, Math.floor(diff / HOUR));
  const days = Math.floor(diff / DAY);
  if (days === 1) return t.yesterday;
  if (days < 30) return pick(t.days, days);
  return formatDate(iso, t);
}

/** "5 October 2026" in Pakistan time. */
export function formatDate(iso: string, t: TimeDict): string {
  const d = new Date(new Date(iso).getTime() + PKT_OFFSET);
  return `${d.getUTCDate()} ${t.months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatTime(iso: string, t: TimeDict): string {
  const d = new Date(new Date(iso).getTime() + PKT_OFFSET);
  const h = d.getUTCHours();
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  let label = '';
  for (const [from, name] of t.periods) if (h >= from) label = name;
  const hh = t.clock12 ? ((h + 11) % 12) + 1 : h;
  return `${hh}:${mm} ${label}`.trim();
}

export function formatDateTime(iso: string, t: TimeDict): string {
  return `${formatDate(iso, t)}${t.sep}${formatTime(iso, t)}`;
}
