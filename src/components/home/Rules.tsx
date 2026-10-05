import { HandCoins, KeyRound, PhoneOff, type LucideIcon } from 'lucide-react';
import type { Lang } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { cn } from '@/lib/cn';
import { BRAND_RED } from '@/components/brand/HoshLogo';

const ICONS: LucideIcon[] = [KeyRound, PhoneOff, HandCoins];
// Each rule gets its own surface so the three never read as a template row.
const TONES = ['bg-alarm-soft text-ink', 'card-brand', 'bg-amber-soft text-ink'];

export function RuleCard({
  index,
  rule,
  lang,
  big = false,
  showStory = false,
  storyLabel,
  className,
}: {
  index: number;
  rule: Dictionary['rules'][number];
  lang: Lang;
  big?: boolean;
  showStory?: boolean;
  storyLabel?: string;
  className?: string;
}) {
  const Icon = ICONS[index]!;
  return (
    <li className={cn('reveal relative flex flex-col overflow-hidden rounded-[var(--radius-card)] p-6 sm:p-8', TONES[index], className)}>
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn('grid place-items-center rounded-full font-display font-extrabold text-white', big ? 'h-16 w-16 text-[2rem]' : 'h-12 w-12 text-[1.5rem]')}
          style={{ background: BRAND_RED }}
          aria-hidden="true"
        >
          <span className="t-num" style={{ letterSpacing: 0 }}>
            {index + 1}
          </span>
        </span>
        <Icon className={cn('opacity-80', big ? 'h-12 w-12' : 'h-9 w-9')} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className={cn('mt-8 font-display font-extrabold tracking-tight', big ? 'text-[2rem] leading-[1.02] sm:text-[2.6rem]' : 'text-[1.6rem] leading-[1.08] sm:text-[1.85rem]', 'ur-heading')}>
        {rule.title}
      </h3>
      {lang === 'en' && (
        <p lang="ur" dir="rtl" className="mt-4 font-urdu text-[1.25rem] leading-[1.9] opacity-90">
          {rule.ur}
        </p>
      )}
      <p className={cn('mt-4 max-w-[46ch]', big && 't-lead')}>{rule.body}</p>
      {showStory && (
        <div className="mt-auto pt-6">
          <p className="rounded-2xl bg-ink/[0.06] p-4 text-[0.98rem] leading-relaxed">
            <span className="t-label mb-1 block opacity-70">{storyLabel}</span>
            {rule.story}
          </p>
        </div>
      )}
    </li>
  );
}

export function Rules({ lang, dict, showStories = false }: { lang: Lang; dict: Dictionary; showStories?: boolean }) {
  return (
    <ol className="grid gap-4 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:gap-5">
      <RuleCard index={0} rule={dict.rules[0]!} lang={lang} big className="lg:row-span-2" showStory={showStories} storyLabel={dict.rulesExampleLabel} />
      <RuleCard index={1} rule={dict.rules[1]!} lang={lang} showStory={showStories} storyLabel={dict.rulesExampleLabel} />
      <RuleCard index={2} rule={dict.rules[2]!} lang={lang} showStory={showStories} storyLabel={dict.rulesExampleLabel} />
    </ol>
  );
}
