import type { Lang } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n';
import type { CardKind } from '@/lib/share-card';
import { ShareButton } from './ShareButton';
import { cardCopy } from './types';

/** Server wrapper: gathers card copy in both languages, renders the client button. */
export function ShareLauncher({
  lang,
  dict,
  initialKind,
  number,
  label,
  className,
  icon = true,
  children,
}: {
  lang: Lang;
  dict: Dictionary;
  initialKind: CardKind;
  number?: { display: string; norm: string; count: number };
  label: string;
  className?: string;
  icon?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <ShareButton
      label={label}
      className={className}
      icon={icon}
      children={children}
      share={{
        lang,
        copy: { en: cardCopy(getDictionary('en')), ur: cardCopy(getDictionary('ur')) },
        ui: dict.share,
        closeLabel: dict.common.close,
        initialKind,
        number,
      }}
    />
  );
}
