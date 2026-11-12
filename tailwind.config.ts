/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fefdfb',
          100: '#fdf8f0',
          200: '#f9f1e1',
          300: '#f3e4c8',
          400: '#e8d0a4',
          500: '#d4b87a',
        },
        ink: {
          50: '#f5f5f4',
          100: '#e0dfdc',
          200: '#b5b3ae',
          300: '#8a8780',
          400: '#5e5b54',
          500: '#3d3a33',
          600: '#2c2a24',
          700: '#1f1d18',
          800: '#141310',
          900: '#0a0a08',
        },
        cobalt: {
          50: '#eff4fb',
          100: '#d6e3f5',
          200: '#adc7eb',
          300: '#7da5dd',
          400: '#5386cf',
          500: '#1e3a5f',
          600: '#1a3253',
          700: '#152a46',
          800: '#0f1f34',
          900: '#0a1523',
        },
        rust: {
          400: '#c27349',
          500: '#a85d36',
          600: '#8e4d2c',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        logos: {
          css: {
            '--tw-prose-body': theme('colors.ink.700'),
            '--tw-prose-headings': theme('colors.ink.800'),
            '--tw-prose-links': theme('colors.cobalt.500'),
            '--tw-prose-bold': theme('colors.ink.800'),
            '--tw-prose-quotes': theme('colors.ink.600'),
            '--tw-prose-quote-borders': theme('colors.cobalt.300'),
            '--tw-prose-code': theme('colors.ink.700'),
            '--tw-prose-hr': theme('colors.ink.100'),
            fontSize: '1.125rem',
            lineHeight: '1.8',
            h1: {
              fontFamily: theme('fontFamily.serif').toString(),
              fontWeight: '700',
              fontSize: '2.25rem',
              lineHeight: '1.2',
            },
            h2: {
              fontFamily: theme('fontFamily.serif').toString(),
              fontWeight: '600',
              fontSize: '1.75rem',
              lineHeight: '1.3',
            },
            h3: {
              fontFamily: theme('fontFamily.serif').toString(),
              fontWeight: '600',
              fontSize: '1.375rem',
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeftWidth: '3px',
            },
            a: {
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              '&:hover': {
                color: theme('colors.cobalt.400'),
              },
            },
            'ul > li::marker': {
              color: theme('colors.cobalt.400'),
            },
            'ol > li::marker': {
              color: theme('colors.cobalt.400'),
            },
          },
        },
        'logos-dark': {
          css: {
            '--tw-prose-body': theme('colors.ink.100'),
            '--tw-prose-headings': theme('colors.paper.100'),
            '--tw-prose-links': theme('colors.cobalt.300'),
            '--tw-prose-bold': theme('colors.paper.100'),
            '--tw-prose-quotes': theme('colors.ink.200'),
            '--tw-prose-quote-borders': theme('colors.cobalt.500'),
            '--tw-prose-code': theme('colors.ink.100'),
            '--tw-prose-hr': theme('colors.ink.600'),
          },
        },
      }),
      maxWidth: {
        article: '42rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
