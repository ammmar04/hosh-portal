/**
 * Share cards drawn with the Canvas API (browser only). 1080x1080 for posts,
 * 1080x1920 for stories, in English or Urdu, always on the HOSH navy.
 * The logo is drawn from the same SVG geometry as <HoshLogo />.
 */
import { HANDSET_PATH } from '@/components/brand/HoshLogo';

export type CardKind = 'tagline' | 'rule1' | 'rule2' | 'rule3' | 'stat' | 'number';
export type CardFormat = 'square' | 'story';
export type CardLang = 'en' | 'ur';

export type CardText = {
  tagline1: string;
  tagline2: string;
  taglineSub: string;
  ruleLabel: string;
  ruleTitle: string;
  numberTitle: string;
  numberUnit: string;
  numberNote: string;
  statLine1: string;
  statLine2: string;
  statSource: string;
  footer: string;
};

export type CardInput = {
  kind: CardKind;
  format: CardFormat;
  lang: CardLang;
  text: CardText;
  number?: { display: string; count: number };
  host: string;
};

const NAVY = '#14132B';
const OFF = '#F2F2EE';
const RED = '#E5484D';
const GOLD = '#FFB81C';
const HAZE = '#A3A2BA';

type Fonts = { display: string; body: string; mono: string; urdu: string; nastaliq: string };

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function fonts(): Fonts {
  return {
    display: cssVar('--font-bricolage', 'sans-serif'),
    body: cssVar('--font-instrument', 'sans-serif'),
    mono: cssVar('--font-jetbrains', 'monospace'),
    urdu: cssVar('--font-naskh', 'serif'),
    nastaliq: cssVar('--font-nastaliq-urdu', 'serif'),
  };
}

async function ensureFonts(f: Fonts, input: CardInput) {
  const sample = Object.values(input.text).join(' ');
  const loads = [
    document.fonts.load(`800 100px ${f.display}`, 'Scam call? Hang up 0123456789'),
    document.fonts.load(`600 40px ${f.body}`, 'Check a number hosh'),
    document.fonts.load(`700 60px ${f.mono}`, '0123456789+-'),
  ];
  if (input.lang === 'ur') {
    loads.push(document.fonts.load(`700 80px ${f.urdu}`, sample), document.fonts.load(`400 40px ${f.urdu}`, sample));
    if (input.kind === 'tagline') loads.push(document.fonts.load(`700 120px ${f.nastaliq}`, sample));
  }
  await Promise.allSettled(loads);
  await document.fonts.ready;
}

/** Greedy word wrap; works for Urdu too because words are space-separated. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Shrinks the font until the text fits in maxLines. Returns the lines and the size used. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, start: number, min: number, maxWidth: number, maxLines: number) {
  let size = start;
  let lines: string[] = [];
  while (size >= min) {
    ctx.font = font(size);
    lines = wrap(ctx, text, maxWidth);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
    size -= 4;
  }
  return { lines, size };
}

function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
  // Same geometry as the SVG: viewBox -2 -4 344 108
  const s = height / 108;
  ctx.save();
  ctx.translate(x + 2 * s, y + 4 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = OFF;
  ctx.lineWidth = 18;
  ctx.lineCap = 'butt';
  ctx.stroke(new Path2D('M9 0V100M55 0V100M9 50H55'));
  ctx.stroke(new Path2D('M253 29.5A24 20.5 0 1 0 229 50A24 20.5 0 1 1 205 70.5'));
  ctx.stroke(new Path2D('M285 0V100M331 0V100M285 50H331'));
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(130, 50, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(130, 53);
  ctx.scale(2.6, 2.6);
  ctx.rotate((135 * Math.PI) / 180);
  ctx.translate(-12, -12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(new Path2D(HANDSET_PATH));
  ctx.restore();
}

function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const s = r / 52;
  ctx.translate(cx, cy + 3 * s);
  ctx.scale(2.6 * s, 2.6 * s);
  ctx.rotate((135 * Math.PI) / 180);
  ctx.translate(-12, -12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(new Path2D(HANDSET_PATH));
  ctx.restore();
}

function drawRings(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxR: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(242,242,238,0.06)';
  ctx.lineWidth = 3;
  for (let r = 120; r < maxR; r += 70) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export async function renderShareCard(input: CardInput): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = input.format === 'story' ? 1920 : 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const f = fonts();
  await ensureFonts(f, input);

  const ur = input.lang === 'ur';
  const M = 96; // outer margin
  const inner = W - M * 2;
  const story = input.format === 'story';

  // Background, rings and the oversized hang-up circle bleeding off the corner
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);
  const markX = ur ? 140 : W - 140;
  const markY = H - (story ? 420 : 250);
  drawRings(ctx, markX, markY, story ? 1100 : 820);
  drawMark(ctx, markX, markY, story ? 210 : 170, 0.95);

  // Header: wordmark on the start side
  const wmH = story ? 92 : 76;
  const wmW = (344 / 108) * wmH;
  drawWordmark(ctx, ur ? W - M - wmW : M, story ? 150 : M, wmH);

  ctx.textBaseline = 'alphabetic';
  ctx.direction = ur ? 'rtl' : 'ltr';
  ctx.textAlign = ur ? 'right' : 'left';
  const x = ur ? W - M : M;
  const top = story ? 520 : 300;
  const maxTextW = inner - (story ? 0 : 60);

  // Latin face first so English words and digits inside Urdu never use Naskh's serif Latin.
  const displayFont = (size: number, w = 800) => (ur ? `700 ${size}px "Bricolage Grotesque", ${f.urdu}` : `${w} ${size}px ${f.display}`);
  const bodyFont = (size: number, w = 500) => (ur ? `400 ${size}px "Instrument Sans", ${f.urdu}` : `${w} ${size}px ${f.body}`);
  const lh = (size: number) => (ur ? size * 1.55 : size * 1.0);

  let y = top;
  const t = input.text;

  if (input.kind === 'tagline') {
    const big = story ? 196 : 168;
    if (ur) {
      ctx.font = `700 ${big * 0.72}px "Bricolage Grotesque", ${f.nastaliq}`;
      ctx.fillStyle = OFF;
      y += big * 0.6;
      ctx.fillText(t.tagline1, x, y);
      ctx.fillStyle = RED;
      y += big * 1.25;
      ctx.fillText(t.tagline2, x, y);
      y += 90;
    } else {
      ctx.font = displayFont(big);
      ctx.fillStyle = OFF;
      y += big * 0.8;
      ctx.fillText(t.tagline1, x, y);
      ctx.fillStyle = RED;
      y += big * 0.95;
      ctx.fillText(t.tagline2, x, y);
      y += 80;
    }
    const sub = fit(ctx, t.taglineSub, (s) => bodyFont(s), 46, 34, maxTextW * 0.8, 3);
    ctx.fillStyle = 'rgba(242,242,238,0.8)';
    for (const line of sub.lines) {
      y += lh(sub.size) * (ur ? 1 : 1.3);
      ctx.fillText(line, x, y);
    }
  } else if (input.kind.startsWith('rule')) {
    // "Rule 1" pill
    ctx.font = ur ? `700 44px "Instrument Sans", ${f.urdu}` : `700 40px ${f.mono}`;
    const label = t.ruleLabel;
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = RED;
    const pillW = lw + 72;
    const pillX = ur ? x - pillW : x;
    ctx.beginPath();
    ctx.roundRect(pillX, y - 10, pillW, 80, 40);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, ur ? x - 36 : x + 36, y + (ur ? 46 : 44));
    y += 120;
    const title = fit(ctx, t.ruleTitle, (s) => displayFont(s), story ? 128 : 112, 64, maxTextW, story ? 6 : 4);
    ctx.fillStyle = OFF;
    ctx.font = displayFont(title.size);
    for (const line of title.lines) {
      y += lh(title.size) * (ur ? 1 : 1.02);
      ctx.fillText(line, x, y);
    }
  } else if (input.kind === 'number' && input.number) {
    ctx.font = bodyFont(story ? 58 : 50, 600);
    ctx.fillStyle = 'rgba(242,242,238,0.85)';
    y += 40;
    ctx.fillText(t.numberTitle, x, y);
    // big count + unit
    const countSize = story ? 300 : 250;
    ctx.font = `800 ${countSize}px ${f.display}`;
    ctx.fillStyle = RED;
    y += countSize * 0.92;
    const countStr = String(input.number.count);
    ctx.direction = 'ltr';
    ctx.textAlign = ur ? 'right' : 'left';
    ctx.fillText(countStr, x, y);
    const cw = ctx.measureText(countStr).width;
    ctx.direction = ur ? 'rtl' : 'ltr';
    ctx.font = displayFont(story ? 76 : 66);
    ctx.fillStyle = OFF;
    ctx.fillText(t.numberUnit, ur ? x - cw - 28 : x + cw + 28, y);
    // the number itself, always left-to-right
    y += story ? 150 : 120;
    const numFit = fit(ctx, input.number.display, (s) => `700 ${s}px ${f.mono}`, story ? 96 : 84, 48, maxTextW, 1);
    ctx.direction = 'ltr';
    ctx.font = `700 ${numFit.size}px ${f.mono}`;
    ctx.fillStyle = GOLD;
    ctx.fillText(input.number.display, x, y);
    ctx.direction = ur ? 'rtl' : 'ltr';
    y += 70;
    ctx.font = bodyFont(36, 500);
    ctx.fillStyle = HAZE;
    ctx.fillText(t.numberNote, x, y);
  } else {
    // stat
    const l1 = fit(ctx, t.statLine1, (s) => displayFont(s), story ? 112 : 96, 56, maxTextW, 4);
    ctx.fillStyle = OFF;
    ctx.font = displayFont(l1.size);
    for (const line of l1.lines) {
      y += lh(l1.size) * (ur ? 1 : 1.02);
      ctx.fillText(line, x, y);
    }
    y += 40;
    const l2 = fit(ctx, t.statLine2, (s) => displayFont(s, 700), story ? 70 : 58, 40, maxTextW, 4);
    ctx.fillStyle = RED;
    ctx.font = displayFont(l2.size, 700);
    for (const line of l2.lines) {
      y += lh(l2.size) * (ur ? 1 : 1.1);
      ctx.fillText(line, x, y);
    }
    y += 70;
    ctx.font = bodyFont(34, 500);
    ctx.fillStyle = HAZE;
    ctx.fillText(t.statSource, x, y);
  }

  // Footer
  const footY = H - (story ? 150 : M);
  ctx.textAlign = ur ? 'right' : 'left';
  ctx.direction = ur ? 'rtl' : 'ltr';
  ctx.font = bodyFont(story ? 40 : 34, 600);
  ctx.fillStyle = OFF;
  ctx.fillText(t.footer, x, footY - (story ? 64 : 54));
  ctx.direction = 'ltr';
  ctx.font = `700 ${story ? 36 : 30}px ${f.mono}`;
  ctx.fillStyle = GOLD;
  const handle = `${input.host}  @hoshkaro`;
  ctx.fillText(handle, x, footY);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}
