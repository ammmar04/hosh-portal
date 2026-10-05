/**
 * Inserts ~25 clearly fictional sample reports (is_sample = true) into
 * whichever store is configured: Supabase if SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set, otherwise the local demo file.
 *
 *   npm run seed            add the samples
 *   npm run seed -- --reset remove existing samples first, then add fresh ones
 *
 * Remove them any time from /admin with "Delete all sample data".
 */
import { getStore, isSupabaseConfigured } from '../src/lib/db';
import { buildSampleReports, SAMPLE_COUNT } from '../src/lib/samples';

async function loadEnv() {
  // Minimal .env.local loader so `npm run seed` sees the same settings as `next dev`.
  const { readFile } = await import('node:fs/promises');
  for (const file of ['.env.local', '.env']) {
    try {
      const text = await readFile(file, 'utf8');
      for (const line of text.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !(m[1]! in process.env)) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, '');
      }
    } catch {}
  }
}

async function main() {
  await loadEnv();
  const store = getStore();
  console.log(`Storage: ${isSupabaseConfigured() ? 'Supabase' : 'local demo file (.data/hosh-demo.json)'}`);
  if (process.argv.includes('--reset')) {
    const removed = await store.removeSamples();
    console.log(`Removed ${removed} existing sample reports.`);
  }
  const inserted = await store.insertMany(buildSampleReports());
  console.log(`Inserted ${inserted} of ${SAMPLE_COUNT} sample reports (all marked is_sample = true).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
