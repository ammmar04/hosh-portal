import { ImageResponse } from 'next/og';
import { getDictionary } from '@/i18n';
import { isLang } from '@/i18n/config';
import { getStore } from '@/lib/db';
import { normalizeNumber } from '@/lib/phone';
import { OG_SIZE, googleFont, logoDataUri, markDataUri } from '@/lib/og';
import { OG_URDU } from '@/lib/og-urdu.generated';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'HOSH number warning';

/* eslint-disable @next/next/no-img-element */
export default async function Image({ params }: { params: Promise<{ lang: string; number: string }> }) {
  const { lang: raw, number } = await params;
  const ur = raw === 'ur';
  const d = getDictionary(isLang(raw) ? raw : 'en');
  const num = normalizeNumber(decodeURIComponent(number));
  const display = num.ok ? num.display : decodeURIComponent(number).slice(0, 18);
  let count = 0;
  if (num.ok) {
    try {
      count = (await getStore().forNumber(num.norm)).length;
    } catch {}
  }
  const c = d.share.card;
  const unit = count === 1 ? c.numberUnit.one : c.numberUnit.other;
  const [display800, mono] = await Promise.all([
    googleFont('Bricolage Grotesque', 800, `${c.numberTitle}${unit}${d.number.emptyTitle}${c.numberNote}${d.number.emptyBody}${c.footer}0123456789`),
    googleFont('JetBrains Mono', 700, `${display}0123456789+-`),
  ]);
  const fonts = [
    ...(display800 ? [{ name: 'Display', data: display800, weight: 800 as const, style: 'normal' as const }] : []),
    ...(mono ? [{ name: 'Mono', data: mono, weight: 700 as const, style: 'normal' as const }] : []),
  ];
  const align = ur ? 'flex-end' : 'flex-start';
  const img = (k: keyof typeof OG_URDU, style: React.CSSProperties = {}) => (
    <img src={OG_URDU[k].src} width={OG_URDU[k].width} height={OG_URDU[k].height} alt="" style={style} />
  );

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#14132B', padding: '56px 72px', position: 'relative', fontFamily: 'Display', color: '#F2F2EE' }}>
        <img src={markDataUri()} width={380} height={380} alt="" style={{ position: 'absolute', right: ur ? 860 : -90, bottom: -120 }} />
        <div style={{ display: 'flex', justifyContent: align }}>
          <img src={logoDataUri()} width={222} height={70} alt="" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: align }}>
          {count > 0 ? (
            <>
              {ur ? img('numberTitle') : <span style={{ fontSize: 46, color: 'rgba(242,242,238,0.85)' }}>{c.numberTitle}</span>}
              <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: ur ? 'row-reverse' : 'row', gap: 24 }}>
                <span style={{ fontSize: 190, lineHeight: 0.9, color: '#E5484D' }}>{count}</span>
                {ur ? img(count === 1 ? 'unitOne' : 'unitOther', { marginBottom: 6 }) : <span style={{ fontSize: 64, marginBottom: 14 }}>{unit}</span>}
              </div>
            </>
          ) : ur ? (
            <>
              {img('none')}
              {img('noneSafe')}
            </>
          ) : (
            <>
              <span style={{ fontSize: 64 }}>{d.number.emptyTitle}</span>
              <span style={{ fontSize: 34, color: '#A3A2BA', marginTop: 8 }}>{d.number.emptyBody}</span>
            </>
          )}
          <span style={{ fontFamily: 'Mono', fontSize: 72, color: '#FFB81C', marginTop: 18 }}>{display}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: align }}>
          {ur ? img('note') : <span style={{ fontSize: 30, color: '#A3A2BA' }}>{c.numberNote}</span>}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
