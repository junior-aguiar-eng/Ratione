import type { Config } from 'tailwindcss';

const v = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: v('canvas'),
        surface: { DEFAULT: v('surface'), 2: v('surface-2') },
        line: { DEFAULT: v('line'), strong: v('line-strong') },
        ink: { DEFAULT: v('ink'), soft: v('ink-soft'), mute: v('ink-mute') },
        brand: { DEFAULT: v('brand'), strong: v('brand-strong'), text: v('brand-text'), tint: v('brand-tint') },
        info: { DEFAULT: v('info'), text: v('info-text'), tint: v('info-tint') },
        ok: { DEFAULT: v('ok'), text: v('ok-text'), tint: v('ok-tint') },
        warn: { DEFAULT: v('warn'), text: v('warn-text'), tint: v('warn-tint') },
        danger: { DEFAULT: v('danger'), text: v('danger-text'), tint: v('danger-tint') },
        rel: { DEFAULT: v('rel'), text: v('rel-text'), tint: v('rel-tint') }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-source-serif)', '"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains-mono)', '"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
