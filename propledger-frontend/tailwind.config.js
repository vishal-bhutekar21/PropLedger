/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PropLedger design system
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#a3bfff',
          400: '#7c9dff',
          500: '#5a7af5',  // primary
          600: '#4560e0',
          700: '#3449c7',
          800: '#2c3da6',
          900: '#273582',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark:    '#0f1117',
        },
        muted: {
          DEFAULT: '#f8f9fb',
          dark:    '#1a1d27',
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark:    '#2d3048',
        },
        text: {
          primary:   '#0f172a',
          secondary: '#64748b',
          inverse:   '#ffffff',
        },
        // Status colors
        status: {
          success: '#16a34a',
          warning: '#d97706',
          danger:  '#dc2626',
          info:    '#2563eb',
          neutral: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        dropdown: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        modal: '0 20px 60px -15px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(-4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
