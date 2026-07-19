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
        // Formato rgb(var(...) / <alpha-value>): é o que permite classes com
        // opacidade (ex.: bg-ink-800/60) continuarem funcionando com cores
        // dinâmicas — variáveis CSS puras (ex.: var(--x)) NÃO suportam o "/60".
        ink: {
          950: 'rgb(var(--color-ink-950) / <alpha-value>)',
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)',
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
          50: 'rgb(var(--color-parchment-50) / <alpha-value>)',
          100: 'rgb(var(--color-parchment-100) / <alpha-value>)',
          300: 'rgb(var(--color-parchment-300) / <alpha-value>)',
          500: 'rgb(var(--color-parchment-500) / <alpha-value>)',
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
