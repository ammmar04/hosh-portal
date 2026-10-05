import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NewReport, Report } from '../types';
import type { FlagResult, Store } from './store';

/**
 * Supabase (Postgres) store. Uses the service role key, which is only ever
 * read on the server. Row level security is on with no public policies, so
 * the anon key cannot read or write anything. See supabase/schema.sql.
 */
const COLUMNS =
  'id, number_norm, number_display, scam_type, asked, loss_band, story, lang, reported_officially, flag_count, hidden, is_sample, created_at';

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    });
  }
  return client;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

function row(input: NewReport) {
  return {
    number_norm: input.number_norm,
    number_display: input.number_display,
    scam_type: input.scam_type,
    asked: input.asked,
    loss_band: input.loss_band,
    story: input.story ?? null,
    lang: input.lang,
    is_sample: input.is_sample ?? false,
    ...(input.created_at ? { created_at: input.created_at } : {}),
  };
}

export const supabaseStore: Store = {
  kind: 'supabase',

  async insertReport(input) {
    return check(await db().from('reports').insert(row(input)).select(COLUMNS).single()) as Report;
  },

  async insertMany(inputs) {
    if (!inputs.length) return 0;
    const data = check(await db().from('reports').insert(inputs.map(row)).select('id'));
    return data?.length ?? 0;
  },

  async recent(limit) {
    return check(
      await db().from('reports').select(COLUMNS).eq('hidden', false).order('created_at', { ascending: false }).limit(limit),
    ) as Report[];
  },

  async forNumber(numberNorm) {
    return check(
      await db()
        .from('reports')
        .select(COLUMNS)
        .eq('number_norm', numberNorm)
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .limit(500),
    ) as Report[];
  },

  async get(id) {
    return (check(await db().from('reports').select(COLUMNS).eq('id', id).maybeSingle()) as Report | null) ?? null;
  },

  async setReportedOfficially(id, value) {
    const data = check(await db().from('reports').update({ reported_officially: value }).eq('id', id).select('id'));
    return (data?.length ?? 0) > 0;
  },

  async flag(id, fingerprint) {
    const data = check(await db().rpc('flag_report', { p_report_id: id, p_fingerprint: fingerprint })) as
      | { flag_count: number; hidden: boolean; duplicate: boolean }[]
      | null;
    const first = data?.[0];
    return first ? ({ flag_count: first.flag_count, hidden: first.hidden, duplicate: first.duplicate } satisfies FlagResult) : null;
  },

  async all() {
    return check(await db().from('reports').select(COLUMNS).order('created_at', { ascending: false }).limit(5000)) as Report[];
  },

  async setHidden(id, hidden) {
    const data = check(await db().from('reports').update({ hidden }).eq('id', id).select('id'));
    return (data?.length ?? 0) > 0;
  },

  async remove(id) {
    const data = check(await db().from('reports').delete().eq('id', id).select('id'));
    return (data?.length ?? 0) > 0;
  },

  async removeSamples() {
    const data = check(await db().from('reports').delete().eq('is_sample', true).select('id'));
    return data?.length ?? 0;
  },
};
