import { ImageResponse } from 'next/og';
import { getDictionary } from '@/i18n';
import { isLang } from '@/i18n/config';
import { OG_SIZE, googleFont, logoDataUri, markDataUri } from '@/lib/og';
import { OG_URDU } from '@/lib/og-urdu.generated';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'HOSH: Scam call? Hang up.';

/* eslint-disable @next/next/no-img-element */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const ur = raw === 'ur';
  const d = getDictionary(isLang(raw) ? raw : 'en');
  const font = ur ? null : await googleFont('Bricolage Grotesque', 800, `${d.home.hero.line1}${d.home.hero.line2}${d.share.card.footer}`);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#14132B', padding: '60px 72px', position: 'relative', fontFamily: 'Display' }}>
        <img src={markDataUri()} width={460} height={460} alt="" style={{ position: 'absolute', right: ur ? 760 : -110, bottom: -150 }} />
        <div style={{ display: 'flex', justifyContent: ur ? 'flex-end' : 'flex-start' }}>
          <img src={logoDataUri()} width={254} height={80} alt="" />
        </div>
        {ur ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <img src={OG_URDU.line1.src} width={OG_URDU.line1.width} height={OG_URDU.line1.height} alt="" />
            <img src={OG_URDU.line2.src} width={OG_URDU.line2.width} height={OG_URDU.line2.height} alt="" style={{ marginTop: -38 }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 132, lineHeight: 0.95, letterSpacing: -4 }}>
            <span style={{ color: '#F2F2EE' }}>{d.home.hero.line1}</span>
            <span style={{ color: '#E5484D' }}>{d.home.hero.line2}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: ur ? 'flex-end' : 'flex-start' }}>
          {ur ? (
            <img src={OG_URDU.footer.src} width={OG_URDU.footer.width} height={OG_URDU.footer.height} alt="" />
          ) : (
            <span style={{ fontSize: 36, color: '#FFB81C' }}>{d.share.card.footer}</span>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: 'Display', data: font, weight: 800, style: 'normal' }] : [] },
  );
}
