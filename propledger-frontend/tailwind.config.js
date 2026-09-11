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
        DEFAULT: '1rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        'full': '9999px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        modal: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
        pill: '0 4px 14px 0 rgba(90, 122, 245, 0.25)',
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
