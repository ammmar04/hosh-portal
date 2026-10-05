import type { NewReport } from './types';

/**
 * Clearly fictional sample reports so the demo looks alive. Every one is
 * stored with is_sample = true, shows a "Sample" badge, and can be removed in
 * one click from /admin. Numbers follow the obviously fake 03XX-000000N style.
 */
type Sample = Omit<NewReport, 'is_sample' | 'created_at'> & { minutesAgo: number };

const SAMPLES: Sample[] = [
  { number_norm: '03000000001', number_display: '0300-0000001', scam_type: 'courier', asked: ['otp'], loss_band: 'none', lang: 'en', minutesAgo: 3,
    story: 'Said my parcel was stuck at the courier office and asked for the code that came by SMS. I hung up.' },
  { number_norm: '03000000001', number_display: '0300-0000001', scam_type: 'courier', asked: ['otp', 'money'], loss_band: 'under_5k', lang: 'en', minutesAgo: 128,
    story: 'Same story, parcel on hold. Asked me to pay Rs 300 and share the code.' },
  { number_norm: '03000000001', number_display: '0300-0000001', scam_type: 'courier', asked: ['otp'], loss_band: 'none', lang: 'ur', minutesAgo: 1530,
    story: 'کہا آپ کا پارسل رکا ہوا ہے، ایڈریس کنفرم کرنے کے لیے کوڈ بتائیں۔ میں نے فون بند کر دیا۔' },
  { number_norm: '03000000001', number_display: '0300-0000001', scam_type: 'courier', asked: ['otp'], loss_band: '5k_25k', lang: 'en', minutesAgo: 4410,
    story: 'I told them the code and my wallet was emptied within minutes.' },

  { number_norm: '03110000002', number_display: '0311-0000002', scam_type: 'bank_wallet', asked: ['otp', 'personal_info'], loss_band: 'none', lang: 'en', minutesAgo: 18,
    story: 'Caller said he was from my bank and my card would be blocked today. He wanted my CNIC and the OTP.' },
  { number_norm: '03110000002', number_display: '0311-0000002', scam_type: 'bank_wallet', asked: ['otp'], loss_band: 'none', lang: 'en', minutesAgo: 545,
    story: 'Bank ka naam le kar PIN maang raha tha. Maine call kaat di.' },
  { number_norm: '03110000002', number_display: '0311-0000002', scam_type: 'bank_wallet', asked: ['personal_info'], loss_band: 'none', lang: 'en', minutesAgo: 2890,
    story: null },

  { number_norm: '03210000003', number_display: '0321-0000003', scam_type: 'family_arrest', asked: ['money'], loss_band: '25k_100k', lang: 'en', minutesAgo: 47,
    story: 'Called my mother crying, said my brother was arrested and needed money right away. We sent it before we could reach him.' },
  { number_norm: '03210000003', number_display: '0321-0000003', scam_type: 'family_arrest', asked: ['money'], loss_band: 'none', lang: 'ur', minutesAgo: 372,
    story: 'کسی نے بیٹے کی آواز بنا کر کہا کہ وہ تھانے میں ہے۔ میں نے بیٹے کو فون کیا تو وہ گھر پر تھا۔' },

  { number_norm: '03330000004', number_display: '0333-0000004', scam_type: 'police_govt', asked: ['money', 'personal_info'], loss_band: 'none', lang: 'en', minutesAgo: 80,
    story: 'Claimed to be an FIA officer. Said there was a case against my CNIC and I had to pay to close it.' },
  { number_norm: '03330000004', number_display: '0333-0000004', scam_type: 'police_govt', asked: ['money'], loss_band: 'under_5k', lang: 'ur', minutesAgo: 1690,
    story: 'کہا آپ کے نام پر مقدمہ ہے، ابھی پیسے بھیجیں ورنہ گرفتاری ہو گی۔' },

  { number_norm: '03450000005', number_display: '0345-0000005', scam_type: 'prize_scheme', asked: ['personal_info', 'otp'], loss_band: 'none', lang: 'en', minutesAgo: 150,
    story: 'SMS said I won Rs 25,000 from BISP. Then a call asking for my CNIC and the code.' },
  { number_norm: '03450000005', number_display: '0345-0000005', scam_type: 'prize_scheme', asked: ['money'], loss_band: 'under_5k', lang: 'en', minutesAgo: 3020,
    story: 'Paid a "processing fee" for a prize that never came.' },
  { number_norm: '03450000005', number_display: '0345-0000005', scam_type: 'prize_scheme', asked: ['otp'], loss_band: 'none', lang: 'ur', minutesAgo: 5800,
    story: 'بینظیر پروگرام کا نام لے کر کہا انعام نکلا ہے، پھر کوڈ مانگا۔' },

  { number_norm: '03020000006', number_display: '0302-0000006', scam_type: 'job_fee', asked: ['money'], loss_band: '5k_25k', lang: 'en', minutesAgo: 305,
    story: 'Offered me a driver job. Asked for Rs 8,000 for training and a uniform first.' },
  { number_norm: '03020000006', number_display: '0302-0000006', scam_type: 'job_fee', asked: ['money', 'personal_info'], loss_band: 'none', lang: 'en', minutesAgo: 4300,
    story: 'Online data entry job. Registration fee first, salary later.' },

  { number_norm: '03150000007', number_display: '0315-0000007', scam_type: 'whatsapp', asked: ['otp'], loss_band: 'none', lang: 'en', minutesAgo: 35,
    story: "Message from my cousin's WhatsApp asking me to send back a code 'sent by mistake'. Her account had been taken over." },
  { number_norm: '03150000007', number_display: '0315-0000007', scam_type: 'whatsapp', asked: ['otp', 'money'], loss_band: 'under_5k', lang: 'ur', minutesAgo: 1200,
    story: 'دوست کے نمبر سے میسج آیا کہ فوراً کچھ پیسے بھیج دو۔ بعد میں پتا چلا اس کا واٹس ایپ ہیک ہو گیا تھا۔' },

  { number_norm: 'SAMPLEPOST', number_display: 'SAMPLEPOST', scam_type: 'fake_link', asked: ['link', 'money'], loss_band: 'none', lang: 'en', minutesAgo: 240,
    story: 'SMS with a link to pay a customs fee for a parcel I never ordered.' },
  { number_norm: 'SAMPLEPOST', number_display: 'SAMPLEPOST', scam_type: 'fake_link', asked: ['link'], loss_band: 'none', lang: 'en', minutesAgo: 1460,
    story: null },

  { number_norm: '03400000008', number_display: '0340-0000008', scam_type: 'other', asked: ['nothing'], loss_band: 'none', lang: 'en', minutesAgo: 420,
    story: 'Two silent calls at night, then a call asking whether this number has a mobile wallet.' },
  { number_norm: '03400000008', number_display: '0340-0000008', scam_type: 'bank_wallet', asked: ['app'], loss_band: 'over_100k', lang: 'en', minutesAgo: 7300,
    story: 'Asked me to install a screen-sharing app to "fix" my account. Money was taken the same night.' },

  { number_norm: '03010000009', number_display: '0301-0000009', scam_type: 'courier', asked: ['link', 'money'], loss_band: 'under_5k', lang: 'en', minutesAgo: 720,
    story: 'Fake delivery link asking for a small redelivery fee.' },
  { number_norm: '03060000010', number_display: '0306-0000010', scam_type: 'police_govt', asked: ['money'], loss_band: 'none', lang: 'ur', minutesAgo: 1740,
    story: 'کہا میں پولیس افسر ہوں اور آپ کے بیٹے کی گاڑی پکڑی گئی ہے، چھڑوانے کے لیے پیسے بھیجیں۔' },
  { number_norm: '03120000011', number_display: '0312-0000011', scam_type: 'prize_scheme', asked: ['money', 'link'], loss_band: 'none', lang: 'en', minutesAgo: 8650,
    story: 'Lucky draw winner message with a link and a fee to claim the prize.' },
];

export const SAMPLE_COUNT = SAMPLES.length;

export function buildSampleReports(now: number = Date.now()): NewReport[] {
  return SAMPLES.map(({ minutesAgo, ...r }) => ({
    ...r,
    is_sample: true,
    created_at: new Date(now - minutesAgo * 60_000).toISOString(),
  }));
}

/** Handy numbers for "Try a sample" links in the checker. */
export const SAMPLE_LOOKUPS = ['0300-0000001', '0345-0000005', 'SAMPLEPOST'];
