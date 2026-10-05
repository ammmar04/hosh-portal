/**
 * Every phone number, short code and URL shown on HOSH lives here.
 *
 * Rules
 * - `verified: true` only when the value was confirmed on an official source
 *   (the organisation's own website, or a government press release).
 * - The UI never shows an unverified value as fact: it shows
 *   "Check the official website" with `fallbackUrl` instead.
 * - Labels and descriptions are copy, so they live in the dictionaries
 *   (dict.contacts[id]); this file only holds the facts and their sources.
 *
 * Checked by the HOSH build on 5 October 2026. Re-check before every term.
 */

export type ContactKind = 'phone' | 'sms' | 'url' | 'email';

export type Contact = {
  id: ContactId;
  kind: ContactKind;
  /** What people see, e.g. "1799" or "complaint.nccia.gov.pk" */
  value: string;
  /** tel:, sms:, mailto: or https: link */
  href: string;
  verified: boolean;
  /** Where the value was confirmed */
  source: string;
  /** What exactly was checked */
  sourceNote: string;
  checkedOn: string;
  /** Shown instead of the value when `verified` is false */
  fallbackUrl?: string;
};

export type ContactId =
  | 'nccia_helpline'
  | 'nccia_portal'
  | 'nccia_site'
  | 'nccia_email'
  | 'police_emergency'
  | 'pta_helpline'
  | 'pta_complaint'
  | 'pta_status'
  | 'pta_sim_sms'
  | 'pta_sim_email'
  | 'sbp_sunwai'
  | 'banking_mohtasib'
  | 'jazzcash_helpline'
  | 'jazzcash_uan'
  | 'easypaisa_helpline'
  | 'whatsapp_recover'
  | 'bisp_site'
  | 'instagram';

const CHECKED = '2026-10-05';

export const CONTACTS: Record<ContactId, Contact> = {
  nccia_helpline: {
    id: 'nccia_helpline',
    kind: 'phone',
    value: '1799',
    href: 'tel:1799',
    verified: true,
    source: 'https://pid.gov.pk/site/press_detail/29307',
    sourceNote:
      'Press Information Department (Government of Pakistan), PR No. 19, 3 June 2025: "the NCCIA Helpline is now fully operational, and citizens can report cybercrime complaints by calling 1799." Note: an APP news item (13 April 2026) quoting a PTA advisory says "1999"; the official PID release and the NCCIA site listing say 1799.',
    checkedOn: CHECKED,
  },
  nccia_portal: {
    id: 'nccia_portal',
    kind: 'url',
    value: 'complaint.nccia.gov.pk',
    href: 'https://complaint.nccia.gov.pk/',
    verified: true,
    source: 'https://complaint.nccia.gov.pk/',
    sourceNote:
      'Official .gov.pk subdomain of NCCIA, indexed under the title "NCCIA: National Cyber Crime Investigation Agency". The page sits behind a bot check, so its form fields could not be read automatically. HOSH does not describe the form fields.',
    checkedOn: CHECKED,
  },
  nccia_site: {
    id: 'nccia_site',
    kind: 'url',
    value: 'nccia.gov.pk',
    href: 'https://www.nccia.gov.pk/',
    verified: true,
    source: 'https://www.nccia.gov.pk/',
    sourceNote: 'Official .gov.pk domain of the National Cyber Crime Investigation Agency.',
    checkedOn: CHECKED,
  },
  nccia_email: {
    id: 'nccia_email',
    kind: 'email',
    value: 'helpdesk@nccia.gov.pk',
    href: 'mailto:helpdesk@nccia.gov.pk',
    verified: false,
    source: 'Third-party guides only (legalpoint.pk, consultalawyer.pk)',
    sourceNote: 'Could not be confirmed on an official page because nccia.gov.pk blocks automated reading. Not shown on the site.',
    checkedOn: CHECKED,
    fallbackUrl: 'https://www.nccia.gov.pk/',
  },
  police_emergency: {
    id: 'police_emergency',
    kind: 'phone',
    value: '15',
    href: 'tel:15',
    verified: true,
    source: 'https://www.punjabpolice.gov.pk/emergency_help',
    sourceNote: 'Punjab Police "Emergency Helplines": Punjab Police 15. Islamabad Police helplines page also lists 15.',
    checkedOn: CHECKED,
  },
  pta_helpline: {
    id: 'pta_helpline',
    kind: 'phone',
    value: '0800-55055',
    href: 'tel:080055055',
    verified: true,
    source: 'https://www.pta.gov.pk/category/complaints-298140473-2023-05-30',
    sourceNote: 'PTA "Complaints" page: "Helpline: 0800-55055". PTA posts on X give hours as 9 AM to 9 PM, 7 days a week.',
    checkedOn: CHECKED,
  },
  pta_complaint: {
    id: 'pta_complaint',
    kind: 'url',
    value: 'complaint.pta.gov.pk',
    href: 'https://complaint.pta.gov.pk/RegisterComplaint.aspx',
    verified: true,
    source: 'https://www.pta.gov.pk/category/complaints-298140473-2023-05-30',
    sourceNote: 'Linked from the PTA "Complaints" page as "Complaint Registration Form". Page title: "PTA Complaint Portal".',
    checkedOn: CHECKED,
  },
  pta_status: {
    id: 'pta_status',
    kind: 'url',
    value: 'complaint.pta.gov.pk',
    href: 'https://complaint.pta.gov.pk/Status_Complaint.aspx',
    verified: true,
    source: 'https://www.pta.gov.pk/category/complaints-298140473-2023-05-30',
    sourceNote: 'Linked from the PTA "Complaints" page as "Complaint Status".',
    checkedOn: CHECKED,
  },
  pta_sim_sms: {
    id: 'pta_sim_sms',
    kind: 'sms',
    value: '8866',
    href: 'sms:8866',
    verified: true,
    source: 'https://www.pta.gov.pk/category/pta-sets-up-monitoring-cell-for-sim-related-complaints-263230713-2023-06-01',
    sourceNote: 'PTA monitoring cell for SIM-related complaints (SIM issuance violations): "SMS Short Code: 8866".',
    checkedOn: CHECKED,
  },
  pta_sim_email: {
    id: 'pta_sim_email',
    kind: 'email',
    value: 'simcomplaints@pta.gov.pk',
    href: 'mailto:simcomplaints@pta.gov.pk',
    verified: true,
    source: 'https://www.pta.gov.pk/category/pta-sets-up-monitoring-cell-for-sim-related-complaints-263230713-2023-06-01',
    sourceNote: 'Same PTA page: "Email: simcomplaints@pta.gov.pk".',
    checkedOn: CHECKED,
  },
  sbp_sunwai: {
    id: 'sbp_sunwai',
    kind: 'url',
    value: 'sunwai.sbp.org.pk',
    href: 'https://sunwai.sbp.org.pk/',
    verified: true,
    source: 'https://www.sbp.org.pk/press/2023/Pr-29-Dec-2023-2.pdf',
    sourceNote:
      'SBP press release, 29 December 2023: Sunwai lets customers complain against banks, microfinance banks and DFIs in English or Urdu; "Each complaint is assigned a unique tracking number which is communicated to users via SMS and email." Portal loads at sunwai.sbp.org.pk (title "Sunwai-CCP").',
    checkedOn: CHECKED,
  },
  banking_mohtasib: {
    id: 'banking_mohtasib',
    kind: 'url',
    value: 'bankingmohtasib.gov.pk',
    href: 'https://www.bankingmohtasib.gov.pk/',
    verified: true,
    source: 'https://www.bankingmohtasib.gov.pk/',
    sourceNote: 'Official site of the Banking Mohtasib Pakistan, with "Lodge Complaint" and "Track Complaint". Also referenced on the JazzCash contact page.',
    checkedOn: CHECKED,
  },
  jazzcash_helpline: {
    id: 'jazzcash_helpline',
    kind: 'phone',
    value: '4444',
    href: 'tel:4444',
    verified: true,
    source: 'https://www.jazzcash.com.pk/contact-us/',
    sourceNote: 'JazzCash "Contact Us": "CUSTOMER HELPLINE 4444 From your Jazz number". The page also says "JazzCash will never ask for your PIN, OTP, or password."',
    checkedOn: CHECKED,
  },
  jazzcash_uan: {
    id: 'jazzcash_uan',
    kind: 'phone',
    value: '111-124-444',
    href: 'tel:111124444',
    verified: true,
    source: 'https://www.jazzcash.com.pk/contact-us/',
    sourceNote: 'JazzCash "Contact Us": "UAN: 111-124-444".',
    checkedOn: CHECKED,
  },
  easypaisa_helpline: {
    id: 'easypaisa_helpline',
    kind: 'phone',
    value: '042-111-003737',
    href: 'tel:042111003737',
    verified: true,
    source: 'https://easypaisa.com.pk/contact-us/',
    sourceNote: 'easypaisa "Contact Us" page footer: "phone: 042 111 003737".',
    checkedOn: CHECKED,
  },
  whatsapp_recover: {
    id: 'whatsapp_recover',
    kind: 'url',
    value: 'faq.whatsapp.com',
    href: 'https://faq.whatsapp.com/1131652977717250',
    verified: true,
    source: 'https://faq.whatsapp.com/1131652977717250',
    sourceNote:
      'WhatsApp Help Center, "How to recover a compromised account": log back in with your phone number and the 6-digit SMS code; re-registering logs out everyone else; never share the code; notify family and friends.',
    checkedOn: CHECKED,
  },
  bisp_site: {
    id: 'bisp_site',
    kind: 'url',
    value: 'bisp.gov.pk',
    href: 'https://bisp.gov.pk/',
    verified: true,
    source: 'https://bisp.gov.pk/',
    sourceNote: 'Official site of the Benazir Income Support Programme (page title "Benazir Income Support Programme").',
    checkedOn: CHECKED,
  },
  instagram: {
    id: 'instagram',
    kind: 'url',
    value: '@hoshkaro',
    href: 'https://www.instagram.com/hoshkaro/',
    verified: true,
    source: 'HOSH team brief',
    sourceNote: 'The team\'s own Instagram handle.',
    checkedOn: CHECKED,
  },
};

export function contact(id: ContactId): Contact {
  return CONTACTS[id];
}

/** Known official numbers, so a lookup of e.g. 1799 can say whose number it is. */
export const OFFICIAL_NUMBERS: Record<string, ContactId> = Object.fromEntries(
  Object.values(CONTACTS)
    .filter((c) => c.verified && c.kind === 'phone')
    .map((c) => [c.href.replace('tel:', ''), c.id]),
) as Record<string, ContactId>;

export const UNVERIFIED_CONTACTS = Object.values(CONTACTS).filter((c) => !c.verified);
