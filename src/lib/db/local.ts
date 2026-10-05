import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildSampleReports } from '../samples';
import type { NewReport, Report } from '../types';
import { FLAG_HIDE_THRESHOLD, type FlagResult, type Store } from './store';

/**
 * Local demo store: a small JSON file, used whenever Supabase is not
 * configured. Seeds itself with sample reports the first time it runs.
 * Fine for a demo; not meant for real traffic.
 */
type Flag = { report_id: string; fingerprint: string; created_at: string };
type State = { version: 1; reports: Report[]; flags: Flag[] };

const FILE =
  process.env.HOSH_DATA_FILE ||
  (process.env.VERCEL ? '/tmp/hosh-demo.json' : path.join(process.cwd(), '.data', 'hosh-demo.json'));

type Cache = { state: State | null; mtimeMs: number; queue: Promise<unknown>; memoryOnly: boolean };
const g = globalThis as unknown as { __hoshLocal?: Cache };
const cache: Cache = (g.__hoshLocal ??= { state: null, mtimeMs: -1, queue: Promise.resolve(), memoryOnly: false });

function toReport(input: NewReport): Report {
  return {
    id: randomUUID(),
    number_norm: input.number_norm,
    number_display: input.number_display,
    scam_type: input.scam_type,
    asked: input.asked,
    loss_band: input.loss_band,
    story: input.story ?? null,
    lang: input.lang,
    reported_officially: null,
    flag_count: 0,
    hidden: false,
    is_sample: input.is_sample ?? false,
    created_at: input.created_at ?? new Date().toISOString(),
  };
}

let seeding: Promise<State> | null = null;

async function read(): Promise<State> {
  if (cache.memoryOnly && cache.state) return cache.state;
  let stat: Awaited<ReturnType<typeof fs.stat>> | null = null;
  try {
    stat = await fs.stat(FILE);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
  if (!stat) {
    if (cache.state && cache.memoryOnly) return cache.state;
    // First run: seed once with clearly marked sample data.
    seeding ??= (async () => {
      const state: State = { version: 1, reports: buildSampleReports().map(toReport), flags: [] };
      state.reports.sort((a, b) => b.created_at.localeCompare(a.created_at));
      await write(state);
      return state;
    })().finally(() => {
      seeding = null;
    });
    return seeding;
  }
  if (cache.state && stat.mtimeMs === cache.mtimeMs) return cache.state;
  const raw = await fs.readFile(FILE, 'utf8');
  const parsed = JSON.parse(raw) as Partial<State>;
  cache.state = { version: 1, reports: parsed.reports ?? [], flags: parsed.flags ?? [] };
  cache.mtimeMs = stat.mtimeMs;
  return cache.state;
}

async function write(state: State): Promise<void> {
  cache.state = state;
  if (cache.memoryOnly) return;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 1), 'utf8');
    await fs.rename(tmp, FILE);
    cache.mtimeMs = (await fs.stat(FILE)).mtimeMs;
  } catch {
    // Read-only filesystem: keep working in memory for this process.
    cache.memoryOnly = true;
  }
}

/** Serialise every mutation so concurrent requests never clobber each other. */
function mutate<T>(fn: (state: State) => T | Promise<T>): Promise<T> {
  const run = cache.queue.then(async () => {
    const state = await read();
    const result = await fn(state);
    await write(state);
    return result;
  });
  cache.queue = run.catch(() => undefined);
  return run;
}

const newestFirst = (a: Report, b: Report) => b.created_at.localeCompare(a.created_at);

export const localStore: Store = {
  kind: 'local',

  insertReport(input) {
    return mutate((s) => {
      const report = toReport(input);
      s.reports.unshift(report);
      return report;
    });
  },

  insertMany(inputs) {
    return mutate((s) => {
      s.reports.push(...inputs.map(toReport));
      s.reports.sort(newestFirst);
      return inputs.length;
    });
  },

  async recent(limit) {
    const s = await read();
    return s.reports.filter((r) => !r.hidden).sort(newestFirst).slice(0, limit);
  },

  async forNumber(numberNorm) {
    const s = await read();
    return s.reports.filter((r) => !r.hidden && r.number_norm === numberNorm).sort(newestFirst);
  },

  async get(id) {
    const s = await read();
    return s.reports.find((r) => r.id === id) ?? null;
  },

  setReportedOfficially(id, value) {
    return mutate((s) => {
      const r = s.reports.find((x) => x.id === id);
      if (!r) return false;
      r.reported_officially = value;
      return true;
    });
  },

  flag(id, fingerprint) {
    return mutate((s): FlagResult | null => {
      const r = s.reports.find((x) => x.id === id);
      if (!r) return null;
      const duplicate = s.flags.some((f) => f.report_id === id && f.fingerprint === fingerprint);
      if (!duplicate) {
        const before = s.flags.filter((f) => f.report_id === id).length;
        s.flags.push({ report_id: id, fingerprint, created_at: new Date().toISOString() });
        r.flag_count = before + 1;
        // Hide only when crossing the threshold, so an admin "unhide" sticks.
        if (before < FLAG_HIDE_THRESHOLD && r.flag_count >= FLAG_HIDE_THRESHOLD) r.hidden = true;
      }
      return { flag_count: r.flag_count, hidden: r.hidden, duplicate };
    });
  },

  async all() {
    const s = await read();
    return [...s.reports].sort(newestFirst);
  },

  setHidden(id, hidden) {
    return mutate((s) => {
      const r = s.reports.find((x) => x.id === id);
      if (!r) return false;
      r.hidden = hidden;
      return true;
    });
  },

  remove(id) {
    return mutate((s) => {
      const before = s.reports.length;
      s.reports = s.reports.filter((r) => r.id !== id);
      s.flags = s.flags.filter((f) => f.report_id !== id);
      return s.reports.length < before;
    });
  },

  removeSamples() {
    return mutate((s) => {
      const sampleIds = new Set(s.reports.filter((r) => r.is_sample).map((r) => r.id));
      s.reports = s.reports.filter((r) => !r.is_sample);
      s.flags = s.flags.filter((f) => !sampleIds.has(f.report_id));
      return sampleIds.size;
    });
  },
};
