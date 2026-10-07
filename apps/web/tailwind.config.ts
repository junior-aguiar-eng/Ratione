import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/*/src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ratione: {
          bg: '#0B0F14',
          surface: '#11161D',
          surfaceHover: '#161C24',
          border: '#232B35',
          text: '#F2F4F7',
          textMuted: '#A8B0BB',
          textDim: '#737E8C',
          teal: '#2B6F6A',
          tealLight: '#4A918B',
          gold: '#B18A3B',
          norma: '#4F7FC8',
          vigente: '#3E8F70',
          atencao: '#C8903D',
          fragilidade: '#B95D5D',
          relacao: '#8069B0'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-source-serif)', 'Source Serif 4', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
};

export default config;
