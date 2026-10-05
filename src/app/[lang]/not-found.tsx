import Link from 'next/link';
import { lang as rootLang } from 'next/root-params';
import { ArrowRight } from 'lucide-react';
import { getDictionary } from '@/i18n';
import { isLang } from '@/i18n/config';
import { PageShell } from '@/components/layout/PageShell';
import { HangUpCircle } from '@/components/brand/HangUp';

export default async function NotFound() {
  const value = await rootLang();
  const lang = isLang(value) ? value : 'en';
  const t = getDictionary(lang).notFound;
  return (
    <PageShell>
      <section className="wrap flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-20">
        <HangUpCircle className="h-20 w-20" />
        <h1 className="t-h1 max-w-[16ch]">{t.title}</h1>
        <p className="t-lead text-muted">{t.body}</p>
        <Link href={`/${lang}`} className="btn btn-ink btn-lg">
          {t.home}
          <ArrowRight className="mirror-rtl h-5 w-5" aria-hidden="true" />
        </Link>
      </section>
    </PageShell>
  );
}
