/**
 * Number normalisation. Every input is reduced to one canonical form so that
 * "0300 1234567", "+92 300 1234567" and "00923001234567" are the same number.
 *
 * Canonical forms
 *   mobile         03001234567        (11 digits, starts 03)
 *   landline       04235761234        (starts 0, area code + subscriber)
 *   uan            111786786          (9 digits, starts 111)
 *   tollfree       080055055          (0800 / 0900 numbers)
 *   shortcode      1799, 15, 8866     (2 to 6 digits)
 *   international  +12025550123       (non-Pakistani, E.164 with +)
 *   sender         EASYPAISA          (alphanumeric SMS sender, upper-cased)
 */

export type NumberKind = 'mobile' | 'landline' | 'uan' | 'tollfree' | 'shortcode' | 'international' | 'sender';

export type NormalizeError =
  | 'empty'
  | 'too_short'
  | 'too_long'
  | 'bad_mobile_length'
  | 'invalid_chars'
  | 'bad_sender'
  | 'unknown_format';

export type NormalizedNumber = { norm: string; display: string; kind: NumberKind };
export type NormalizeResult = ({ ok: true } & NormalizedNumber) | { ok: false; error: NormalizeError };

const URDU_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Convert Urdu (Extended Arabic-Indic) and Arabic-Indic digits to ASCII. */
export function toAsciiDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const u = URDU_DIGITS.indexOf(ch);
    return String(u >= 0 ? u : ARABIC_DIGITS.indexOf(ch));
  });
}

// Spaces, dashes, dots, brackets and invisible direction marks people paste in.
const STRIP = /[\s\-(). ​-‏⁦-⁩‪-‮_/]/g;

// Two-digit area codes for the big cities; everything else uses three digits.
const TWO_DIGIT_AREAS = new Set(['21', '22', '41', '42', '51', '52', '53', '55', '61', '62', '71', '81', '91']);

function ok(norm: string, display: string, kind: NumberKind): NormalizeResult {
  return { ok: true, norm, display, kind };
}
function fail(error: NormalizeError): NormalizeResult {
  return { ok: false, error };
}

export function normalizeNumber(raw: string): NormalizeResult {
  const input = toAsciiDigits(String(raw ?? '')).trim();
  if (!input) return fail('empty');
  if (input.length > 40) return fail('too_long');

  const compact = input.replace(STRIP, '');
  if (!compact) return fail('empty');

  // Alphanumeric sender names (e.g. EASYPAISA, HBL, 8558-ALERT)
  if (/[a-z]/i.test(compact)) {
    const sender = compact.toUpperCase();
    if (!/^[A-Z0-9&]{2,15}$/.test(sender)) return fail('bad_sender');
    return ok(sender, sender, 'sender');
  }

  if (!/^\+?\d+$/.test(compact)) return fail('invalid_chars');

  let digits = compact;
  let international = false;
  if (digits.startsWith('+')) {
    international = true;
    digits = digits.slice(1);
  } else if (digits.startsWith('00')) {
    international = true;
    digits = digits.slice(2);
  }

  if (international) {
    if (digits.startsWith('92')) {
      digits = '0' + digits.slice(2);
    } else {
      if (digits.length < 7) return fail('too_short');
      if (digits.length > 15) return fail('too_long');
      return ok('+' + digits, formatInternational(digits), 'international');
    }
  } else if (digits.startsWith('92') && (digits.length === 11 || digits.length === 12)) {
    // 923001234567 (mobile) or 924235761234 (landline) written without + or 00
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('3') && digits.length === 10) {
    // 3001234567: mobile without the leading zero
    digits = '0' + digits;
  }

  if (digits.length > 15) return fail('too_long');

  if (digits.startsWith('03')) {
    if (digits.length !== 11) return fail('bad_mobile_length');
    return ok(digits, `${digits.slice(0, 4)}-${digits.slice(4)}`, 'mobile');
  }

  if (digits.startsWith('0800') || digits.startsWith('0900')) {
    if (digits.length < 9 || digits.length > 11) return fail(digits.length < 9 ? 'too_short' : 'too_long');
    return ok(digits, `${digits.slice(0, 4)}-${digits.slice(4)}`, 'tollfree');
  }

  if (digits.startsWith('111') && digits.length === 9) {
    return ok(digits, `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`, 'uan');
  }

  // UAN dialled with a city code: 042-111-003737
  if (digits.startsWith('0') && digits.length === 12 && digits.slice(3, 6) === '111') {
    return ok(digits, `${digits.slice(0, 3)}-111-${digits.slice(6)}`, 'uan');
  }

  if (digits.startsWith('0')) {
    if (digits.length < 9) return fail('too_short');
    if (digits.length > 11) return fail('too_long');
    const areaLen = TWO_DIGIT_AREAS.has(digits.slice(1, 3)) ? 2 : 3;
    return ok(digits, `${digits.slice(0, areaLen + 1)}-${digits.slice(areaLen + 1)}`, 'landline');
  }

  if (digits.length >= 2 && digits.length <= 6) {
    return ok(digits, digits, 'shortcode');
  }

  if (digits.length < 2) return fail('too_short');
  return fail('unknown_format');
}

function formatInternational(digits: string): string {
  // Country codes are 1 to 3 digits and we do not ship a numbering database,
  // so foreign numbers are shown ungrouped rather than grouped wrongly.
  return `+${digits}`;
}

/**
 * Live formatting for the dialer input. Keeps only meaningful characters and
 * groups digits the way people read Pakistani numbers aloud.
 */
export function formatDialerInput(raw: string): string {
  const input = toAsciiDigits(raw);
  if (/[a-z]/i.test(input)) {
    return input.replace(/[^a-z0-9&\s-]/gi, '').toUpperCase().slice(0, 20);
  }
  let s = input.replace(/[^\d+]/g, '');
  // only one leading plus
  s = s.replace(/(?!^)\+/g, '');
  if (s.startsWith('+92')) {
    const rest = s.slice(3);
    return ['+92', rest.slice(0, 3), rest.slice(3, 10)].filter(Boolean).join(' ') + (rest.length > 10 ? rest.slice(10) : '');
  }
  if (s.startsWith('0092')) {
    const rest = s.slice(4);
    return ['0092', rest.slice(0, 3), rest.slice(3, 10)].filter(Boolean).join(' ') + (rest.length > 10 ? rest.slice(10) : '');
  }
  if (s.startsWith('03')) {
    return [s.slice(0, 4), s.slice(4, 11)].filter(Boolean).join(' ') + (s.length > 11 ? s.slice(11) : '');
  }
  if (s.startsWith('92') && s.length > 2 && s[2] === '3') {
    return ['92', s.slice(2, 5), s.slice(5, 12)].filter(Boolean).join(' ') + (s.length > 12 ? s.slice(12) : '');
  }
  return s.slice(0, 18);
}

/** Wrap a number in Unicode isolates so it stays left-to-right inside Urdu plain text. */
export function ltrIsolate(text: string): string {
  return `⁦${text}⁩`;
}
