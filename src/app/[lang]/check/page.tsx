import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, MessageSquareWarning } from 'lucide-react';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { normalizeNumber, type NormalizeError } from '@/lib/phone';
import { SAMPLE_LOOKUPS } from '@/lib/samples';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { NumberChecker } from '@/components/check/NumberChecker';
import { HangBullet } from '@/components/brand/HangUp';

export async function generateMetadata({ params }: PageProps<'/[lang]/check'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/check', getDictionary(lang).meta.pages.check);
}

export default async function CheckPage({ params, searchParams }: PageProps<'/[lang]/check'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const sp = await searchParams;
  const raw = typeof sp.n === 'string' ? sp.n.slice(0, 40) : '';

  let initialError: NormalizeError | null = null;
  if (raw) {
    const result = normalizeNumber(raw);
    if (result.ok) redirect(`/${lang}/n/${encodeURIComponent(result.norm)}`);
    initialError = result.error;
  }

  return (
    <PageShell>
      <section className="wrap grid gap-10 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:pt-20">
        <div>
          <h1 className="t-h1">{dict.check.title}</h1>
          <p className="t-lead mt-5 max-w-[42ch] text-muted">{dict.check.sub}</p>

          <h2 className="t-h3 mt-12">{dict.check.howTitle}</h2>
          <ul className="mt-4 grid gap-3">
            {dict.check.how.map((line) => (
              <li key={line} className="flex items-baseline gap-3">
                <HangBullet />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card p-5 sm:p-7">
            <NumberChecker lang={lang} t={dict.checker} samples={SAMPLE_LOOKUPS} initialValue={raw} initialError={initialError} />
          </div>
          <Link href={`/${lang}/message-check`} className="card-flat group flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-soft text-amber-ink">
              <MessageSquareWarning className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-bold">{dict.home.messageCta.title}</span>
              <span className="block text-muted t-small">{dict.home.messageCta.body}</span>
            </span>
            <ArrowRight className="mirror-rtl h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
