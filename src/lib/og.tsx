import { HANDSET_PATH } from '@/components/brand/HoshLogo';

export const OG_SIZE = { width: 1200, height: 630 };

/** Fetches a Google Font subset (only the glyphs in `text`) as TTF for next/og. */
export async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { cache: 'force-cache' })).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src, { cache: 'force-cache' });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export function logoDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -4 344 108"><g fill="none" stroke="#F2F2EE" stroke-width="18"><path d="M9 0V100M55 0V100M9 50H55"/><path d="M253 29.5A24 20.5 0 1 0 229 50A24 20.5 0 1 1 205 70.5"/><path d="M285 0V100M331 0V100M285 50H331"/></g><circle cx="130" cy="50" r="52" fill="#E5484D"/><path fill="#FFF" transform="translate(130 53) scale(2.6) rotate(135) translate(-12 -12)" d="${HANDSET_PATH}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function markDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="77 -3 106 106"><circle cx="130" cy="50" r="52" fill="#E5484D"/><path fill="#FFF" transform="translate(130 53) scale(2.6) rotate(135) translate(-12 -12)" d="${HANDSET_PATH}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
