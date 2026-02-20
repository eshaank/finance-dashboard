import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dash-bg': '#0a0a0b',
        'dash-surface': '#111114',
        'dash-surface-2': '#18181c',
        'dash-border': '#1e1e24',
        'dash-text': '#e6edf3',
        'dash-muted': '#8b949e',
        'dash-green': '#3fb950',
        'dash-red': '#f85149',
        'dash-yellow': '#d29922',
        'accent': '#771128',
        'accent-light': '#9a2240',
        'accent-dark': '#5a0d1e',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
