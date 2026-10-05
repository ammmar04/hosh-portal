import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { pageMetadata } from '@/lib/metadata';
import { PageShell } from '@/components/layout/PageShell';
import { MessageChecker } from '@/components/message/MessageChecker';

export async function generateMetadata({ params }: PageProps<'/[lang]/message-check'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, '/message-check', getDictionary(lang).meta.pages.message);
}

export default async function MessageCheckPage({ params }: PageProps<'/[lang]/message-check'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <PageShell>
      <section className="wrap pb-24 pt-8 sm:pt-12">
        <div className="max-w-2xl">
          <h1 className="t-h1">{dict.message.title}</h1>
          <p className="t-lead mt-4 text-muted">{dict.message.sub}</p>
        </div>
        <div className="mt-8">
          <MessageChecker lang={lang} t={dict.message} />
        </div>
      </section>
    </PageShell>
  );
}
