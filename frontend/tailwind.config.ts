import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dash-bg': '#0a0a0a',
        'dash-surface': '#111111',
        'dash-surface-2': '#18181c',
        'dash-border': '#2a2a2a',
        'dash-text': '#e0e0e0',
        'dash-muted': '#666666',
        'dash-green': '#00cc66',
        'dash-red': '#ff4444',
        'dash-yellow': '#d29922',
        'dash-header': '#161616',
        'dash-panel-header': '#1a1a1a',
        'accent': '#771128',
        'accent-light': '#9a2240',
        'accent-dark': '#5a0d1e',
        'accent-blue': '#1a8fff',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-fade': 'slideFade 0.3s ease-out forwards',
        'marquee': 'marquee 40s linear infinite',
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
        slideFade: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
