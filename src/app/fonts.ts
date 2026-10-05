import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono, Noto_Naskh_Arabic } from 'next/font/google';
import localFont from 'next/font/local';

// Latin fonts are small and used on every page, so they are preloaded.
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

// Urdu fonts are not preloaded so English pages never pay for them. The browser
// fetches them as soon as Urdu text is laid out.
// adjustFontFallback is off: the generated metric fallback (a Latin system font)
// would otherwise sit in front of our Latin fonts and catch every Latin letter
// on Urdu pages. The CSS stacks in globals.css put the Latin fonts next instead.
export const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-naskh',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

// Nastaliq is used for one display heading only (the Findings headline). It is a
// local subset of Noto Nastaliq Urdu Bold (OFL) limited to the Urdu alphabet and
// marks: 95 KB instead of 154 KB. Regenerate with the command in the README.
export const nastaliq = localFont({
  src: './fonts/NotoNastaliqUrdu-Bold-urdu-subset.woff2',
  weight: '700',
  variable: '--font-nastaliq-urdu',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const fontVariables = [bricolage.variable, instrument.variable, jetbrains.variable, naskh.variable, nastaliq.variable].join(' ');
