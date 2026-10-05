/**
 * Story masking. Any run of 5 or more digits (allowing single spaces, dots or
 * dashes between them) and anything shaped like a CNIC becomes "•••" before a
 * story is saved or previewed. Works for ASCII, Urdu and Arabic-Indic digits.
 */
const D = '[0-9\\u0660-\\u0669\\u06F0-\\u06F9]';

// 35202-1234567-1 or 3520212345671 written with spaces/dashes
const CNIC = new RegExp(`${D}{5}[\\s.\\-]?${D}{7}[\\s.\\-]?${D}`, 'g');
// 5+ digits, optionally separated by one space/dot/dash: 0300 123 4567, 12345
const DIGIT_RUN = new RegExp(`${D}(?:[\\s.\\-]?${D}){4,}`, 'g');

export const MASK = '•••';
export const STORY_MAX = 200;

export function maskStory(text: string): string {
  return text.replace(CNIC, MASK).replace(DIGIT_RUN, MASK);
}

/** Strip control characters and collapse runs of whitespace. */
export function cleanText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function hasMaskableDigits(text: string): boolean {
  return maskStory(text) !== text;
}
