import { localStore } from './local';
import type { Store } from './store';
import { supabaseStore } from './supabase';

export const isSupabaseConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Supabase when configured, otherwise the local demo file. */
export function getStore(): Store {
  return isSupabaseConfigured() ? supabaseStore : localStore;
}

export type { Store } from './store';
export { FLAG_HIDE_THRESHOLD } from './store';
