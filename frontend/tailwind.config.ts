/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        critical: {
          DEFAULT: 'var(--color-critical)',
          50: 'var(--color-critical-50)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          50: 'var(--color-warning-50)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          50: 'var(--color-success-50)',
        },
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        sidebar: 'var(--bg-sidebar)',
        main: 'var(--text-main)',
        strong: 'var(--text-strong)',
        muted: 'var(--text-muted)',
        'on-primary': 'var(--text-on-primary)',
        subtle: 'var(--border-subtle)',
        'safe-bg': 'var(--color-safe-bg)',
      },
    },
  },
  plugins: [],
};

export default config;
