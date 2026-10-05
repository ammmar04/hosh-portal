import type { NewReport, Report } from '../types';

export type FlagResult = { flag_count: number; hidden: boolean; duplicate: boolean };

/** Storage interface. Implemented by Supabase (production) and a local JSON file (demo). */
export interface Store {
  readonly kind: 'supabase' | 'local';
  insertReport(input: NewReport): Promise<Report>;
  insertMany(inputs: NewReport[]): Promise<number>;
  /** Newest first, hidden reports excluded. */
  recent(limit: number): Promise<Report[]>;
  /** Newest first, hidden reports excluded. */
  forNumber(numberNorm: string): Promise<Report[]>;
  get(id: string): Promise<Report | null>;
  setReportedOfficially(id: string, value: boolean): Promise<boolean>;
  /** Records one flag per fingerprint. Hides the report when it reaches 3 distinct flags. */
  flag(id: string, fingerprint: string): Promise<FlagResult | null>;
  /** Admin: everything, newest first. */
  all(): Promise<Report[]>;
  setHidden(id: string, hidden: boolean): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  removeSamples(): Promise<number>;
}

export const FLAG_HIDE_THRESHOLD = 3;
