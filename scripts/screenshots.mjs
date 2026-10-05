/**
 * Visual review helper. Takes screenshots of key pages in English and Urdu,
 * at phone and desktop widths, in light and dark, and reports any page that
 * scrolls sideways or logs errors.
 *
 *   npm run dev            (in another terminal)
 *   npm run shots          -> screenshots/*.png
 *
 * Options (env): BASE=http://localhost:3000  PAGES=/,/now  WIDTHS=390,360  THEMES=light,dark  FULL=1
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:3000';
const PAGES = (process.env.PAGES || '/,/now,/check,/n/03000000001,/n/03009999999,/report,/report/thanks,/message-check,/how-to-report,/learn,/findings,/tracker,/about,/admin')
  .split(',')
  .filter(Boolean);
const LANGS = (process.env.LANGS || 'en,ur').split(',');
const WIDTHS = (process.env.WIDTHS || '390').split(',').map(Number);
const THEMES = (process.env.THEMES || 'light').split(',');
const FULL = process.env.FULL !== '0';
const OUT = process.env.OUT || 'screenshots';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 900 },
      deviceScaleFactor: 2,
      colorScheme: theme,
      reducedMotion: 'reduce',
      isMobile: width < 700,
      hasTouch: width < 700,
    });
    for (const lang of LANGS) {
      for (const path of PAGES) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        const url = `${BASE}/${lang}${path === '/' ? '' : path}`;
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(300);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (overflow > 1) problems.push(`${url} @${width} ${theme}: horizontal overflow ${overflow}px`);
          if (errors.length) problems.push(`${url} @${width} ${theme}: ${errors.slice(0, 3).join(' | ')}`);
          const name = `${OUT}/${lang}${path.replace(/\//g, '_') || '_home'}-${width}-${theme}.png`;
          await page.screenshot({ path: name, fullPage: FULL });
          console.log('saved', name);
        } catch (e) {
          problems.push(`${url}: ${e.message}`);
        }
        await page.close();
      }
    }
    await context.close();
  }
}
await browser.close();
if (problems.length) {
  console.log('\nProblems:');
  for (const p of problems) console.log(' -', p);
  process.exitCode = 1;
} else {
  console.log('\nNo overflow or console errors found.');
}
