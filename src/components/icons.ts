import {
  Banknote,
  Briefcase,
  CircleHelp,
  Download,
  Gift,
  IdCard,
  KeyRound,
  Landmark,
  Link2,
  MessageCircleWarning,
  MousePointerClick,
  Package,
  ShieldAlert,
  Siren,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';
import type { Asked, ScamType } from '@/lib/types';

export const SCAM_ICONS: Record<ScamType, LucideIcon> = {
  courier: Package,
  bank_wallet: Landmark,
  family_arrest: Siren,
  police_govt: ShieldAlert,
  prize_scheme: Gift,
  job_fee: Briefcase,
  whatsapp: MessageCircleWarning,
  fake_link: Link2,
  other: CircleHelp,
};

export const ASKED_ICONS: Record<Asked, LucideIcon> = {
  otp: KeyRound,
  money: Banknote,
  personal_info: IdCard,
  link: MousePointerClick,
  app: Download,
  nothing: Hourglass,
};
