/**
 * Generates the favicon, Apple touch icon and PWA icons from the HOSH mark
 * (the red hang-up circle). Run with: npm run icons
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const HANDSET =
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z';

/** The mark on a transparent background (favicon). */
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="77 -3 106 106"><circle cx="130" cy="50" r="52" fill="#E5484D"/><path fill="#FFF" transform="translate(130 53) scale(2.6) rotate(135) translate(-12 -12)" d="${HANDSET}"/></svg>`;

/** The mark centred on navy, with room to spare (app icons). `scale` is the circle's share of the tile. */
const tileSvg = (scale) => {
  const r = 50 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#14132B"/><circle cx="50" cy="50" r="${r}" fill="#E5484D"/><path fill="#FFF" transform="translate(50 ${50 + r * 0.0577}) scale(${(2.6 * r) / 52}) rotate(135) translate(-12 -12)" d="${HANDSET}"/></svg>`;
};

await mkdir('public/icons', { recursive: true });
await writeFile('src/app/icon.svg', markSvg);
await sharp(Buffer.from(tileSvg(0.72))).resize(180, 180).png().toFile('src/app/apple-icon.png');
await sharp(Buffer.from(tileSvg(0.72))).resize(192, 192).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(tileSvg(0.72))).resize(512, 512).png().toFile('public/icons/icon-512.png');
// Maskable icons are cropped to a circle or squircle: keep the mark inside the 80% safe zone.
await sharp(Buffer.from(tileSvg(0.56))).resize(512, 512).png().toFile('public/icons/maskable-512.png');
await sharp(Buffer.from(markSvg)).resize(48, 48).png().toFile('public/icons/favicon-48.png');
console.log('Icons written to src/app and public/icons');
