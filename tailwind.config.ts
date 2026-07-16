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
        // Fundo — "ink" azulado, não preto puro (evita o cliché near-black + acid accent)
        ink: {
          950: '#0A0C10',
          900: '#0E1116',
          800: '#151923',
          700: '#1D2230',
          600: '#2A3142',
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
        // Texto — branco frio, nunca creme
        parchment: {
          50: '#F4F5F7',
          100: '#ECEDF1',
          300: '#B8BCC8',
          500: '#7C8296',
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
