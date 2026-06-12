/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Apple 端末では ui-serif = New York（上質なモダンセリフ）。
        // 他環境では Georgia 等にフォールバック。
        serif: ['ui-serif', 'Georgia', 'Hiragino Mincho ProN', 'serif'],
      },
      colors: {
        // 深海パレット
        abyss: {
          950: '#08233a',
          900: '#0d2d48',
          800: '#123a5b',
          700: '#18496e',
          600: '#1f5a83',
        },
        // 生物発光（bioluminescence）
        lume: {
          DEFAULT: '#34e7d3',
          cyan: '#22d3ee',
          soft: '#7ff0e6',
          deep: '#1ba89a',
        },
      },
      boxShadow: {
        glow: '0 0 26px -6px rgba(52, 231, 211, 0.5)',
        'glow-sm': '0 0 14px -3px rgba(52, 231, 211, 0.45)',
        card: '0 10px 30px -16px rgba(0, 0, 0, 0.8)',
      },
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '12%': { opacity: 'var(--bubble-opacity, 0.5)' },
          '88%': { opacity: 'var(--bubble-opacity, 0.5)' },
          '100%': { transform: 'translateY(-110vh) scale(1.15)', opacity: '0' },
        },
        sheen: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.6' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 20s linear infinite',
        sheen: 'sheen 9s ease-in-out infinite',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
