/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0c0a09',
          panel: '#1c1917',
          elevated: '#292524',
          border: '#44403c',
          muted: '#a8a29e',
          text: '#fafaf9',
          amber: '#f59e0b',
          gold: '#eab308',
          copper: '#c2410c',
          success: '#22c55e',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-wave': 'pulseWave 1.4s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseWave: {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.5' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
