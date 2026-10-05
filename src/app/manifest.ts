import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'HOSH: Scam call? Hang up.',
    short_name: 'HOSH',
    description: 'Report scam calls, check a number, and learn the three rules that stop most scams in Pakistan.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#14132B',
    theme_color: '#14132B',
    lang: 'en',
    dir: 'auto',
    categories: ['utilities', 'security', 'education'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Scam call happening now', short_name: 'Scam call now', url: '/now', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Check a number', short_name: 'Check', url: '/check' },
      { name: 'Report a scam', short_name: 'Report', url: '/report' },
    ],
  };
}
