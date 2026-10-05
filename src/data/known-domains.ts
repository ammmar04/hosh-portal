/**
 * Domains the message checker treats as official, plus the brand names used
 * to spot lookalike links. Pakistani entries were checked on 5 October 2026
 * by loading each site and reading its title.
 * REVIEW: add banks, couriers and wallets your audience uses; only add a
 * domain after confirming it on the organisation's own channels.
 */

/** Only government bodies and universities can register these. */
export const OFFICIAL_SUFFIXES = ['.gov.pk', '.edu.pk'];

export const OFFICIAL_DOMAINS = [
  // banks and the regulator
  'hbl.com',
  'ubldigital.com',
  'mcb.com.pk',
  'bankalfalah.com',
  'meezanbank.com',
  'nbp.com.pk',
  'abl.com',
  'askaribank.com',
  'bankislami.com.pk',
  'faysalbank.com',
  'jsbl.com',
  'sbp.org.pk',
  // wallets
  'jazzcash.com.pk',
  'easypaisa.com.pk',
  'sadapay.pk',
  'nayapay.com',
  // couriers and shopping
  'tcsexpress.com',
  'leopardscourier.com',
  'mulphilog.com',
  'daraz.pk',
  // mobile networks
  'jazz.com.pk',
  'zong.com.pk',
  'telenor.com.pk',
  'ufone.com',
  // big platforms people forward links from
  'whatsapp.com',
  'wa.me',
  'google.com',
  'youtube.com',
  'facebook.com',
  'instagram.com',
];

export const SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.ly',
  'cutt.ly',
  'rb.gy',
  'is.gd',
  'v.gd',
  'goo.gl',
  'ow.ly',
  'shorturl.at',
  'tiny.cc',
  's.id',
  't.co',
  'rebrand.ly',
  'bl.ink',
  'shorte.st',
  'adf.ly',
  'lnkd.in',
  'buff.ly',
  'soo.gd',
  'short.gy',
  'qrco.de',
  'clck.ru',
  'u.to',
];

/** Keyword found in a host -> the brand it imitates. Longer keywords first. */
export const BRAND_KEYWORDS: [string, string][] = [
  ['jazzcash', 'JazzCash'],
  ['easypaisa', 'easypaisa'],
  ['statebank', 'State Bank'],
  ['alfalah', 'Bank Alfalah'],
  ['meezan', 'Meezan Bank'],
  ['askari', 'Askari Bank'],
  ['faysal', 'Faysal Bank'],
  ['leopards', 'Leopards Courier'],
  ['whatsapp', 'WhatsApp'],
  ['telenor', 'Telenor'],
  ['benazir', 'BISP'],
  ['ehsaas', 'Ehsaas'],
  ['daraz', 'Daraz'],
  ['nadra', 'NADRA'],
  ['nccia', 'NCCIA'],
  ['ufone', 'Ufone'],
  ['bisp', 'BISP'],
  ['zong', 'Zong'],
  ['jazz', 'Jazz'],
  ['hbl', 'HBL'],
  ['ubl', 'UBL'],
  ['mcb', 'MCB'],
  ['nbp', 'NBP'],
  ['sbp', 'State Bank'],
  ['fbr', 'FBR'],
  ['pta', 'PTA'],
  ['fia', 'FIA'],
  ['tcs', 'TCS'],
];
