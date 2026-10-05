import { ArrowUpRight, Globe, Mail, MessageSquare, PhoneCall } from 'lucide-react';
import type { Contact } from '@/data/contacts';
import { cn } from '@/lib/cn';
import { Ltr } from './Ltr';

/**
 * Renders a phone number, short code or link from contacts.ts. Verified values
 * become tappable buttons; anything unverified is never shown as fact and
 * points to the official website instead.
 */
export function ContactAction({
  contact,
  label,
  checkOfficial,
  newTab,
  variant = 'ghost',
  className,
  showValue = false,
}: {
  contact: Contact;
  label: string;
  checkOfficial: string;
  newTab: string;
  variant?: 'ghost' | 'ink' | 'amber' | 'alarm' | 'on-navy';
  className?: string;
  showValue?: boolean;
}) {
  const btn = cn('btn min-h-12 px-4 text-[0.98rem]', `btn-${variant}`, className);
  if (!contact.verified) {
    return (
      <a href={contact.fallbackUrl} target="_blank" rel="noopener noreferrer" className={btn}>
        <Globe className="h-4 w-4" aria-hidden="true" />
        {checkOfficial}
        <ArrowUpRight className="mirror-rtl h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{newTab}</span>
      </a>
    );
  }
  const Icon = contact.kind === 'phone' ? PhoneCall : contact.kind === 'sms' ? MessageSquare : contact.kind === 'email' ? Mail : Globe;
  const external = contact.kind === 'url';
  return (
    <a href={contact.href} className={btn} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <bdi>{label}</bdi>
      {showValue && (
        <Ltr mono className="font-bold">
          {contact.value}
        </Ltr>
      )}
      {external && (
        <>
          <ArrowUpRight className="mirror-rtl h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">{newTab}</span>
        </>
      )}
    </a>
  );
}

/** Small "Source" link so officials can see where each number came from. */
export function SourceLink({ contact, label }: { contact: Contact; label: string }) {
  if (!contact.source.startsWith('http')) return null;
  const host = new URL(contact.source).host.replace(/^www\./, '');
  return (
    <a href={contact.source} target="_blank" rel="noopener noreferrer" className="link text-[0.85rem] text-muted">
      {label}: <Ltr>{host}</Ltr>
    </a>
  );
}
