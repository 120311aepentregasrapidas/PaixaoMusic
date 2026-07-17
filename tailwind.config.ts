import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fundo — controlado por variáveis CSS (ver globals.css) para permitir
        // troca de tema em tempo real (claro/escuro/OLED/azul) sem recompilar.
        ink: {
          950: 'var(--color-ink-950)',
          900: 'var(--color-ink-900)',
          800: 'var(--color-ink-800)',
          700: 'var(--color-ink-700)',
          600: 'var(--color-ink-600)',
        },
        // Acento primário — "Paixão crimson"
        paixao: {
          400: '#F0616F',
          500: '#E63950',
          600: '#C92943',
          700: '#A21F37',
        },
        // Acento secundário — dourado de vitrola/vinil, para avaliações e "premium"
        vinil: {
          300: '#F4C874',
          400: '#F0A93B',
          500: '#D6912A',
        },
        // Texto — também via variável CSS, inverte automaticamente no tema claro
        parchment: {
          50: 'var(--color-parchment-50)',
          100: 'var(--color-parchment-100)',
          300: 'var(--color-parchment-300)',
          500: 'var(--color-parchment-500)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      backgroundImage: {
        'sprocket-divider':
          "repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 18px)",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-rec': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-rec': 'pulse-rec 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
