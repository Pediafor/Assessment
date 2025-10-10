/** @type {import('tailwindcss').Config} *//** @type {import('tailwindcss').Config} *//** @type {import('tailwindcss').Config} */

module.exports = {

  darkMode: ["class"],module.exports = {module.exports = {

  content: [

    './pages/**/*.{ts,tsx}',  darkMode: ["class"],  darkMode: ['class'],

    './components/**/*.{ts,tsx}',

    './app/**/*.{ts,tsx}',  content: [  content: [

    './src/**/*.{ts,tsx}',

  ],    './pages/**/*.{ts,tsx}',    './pages/**/*.{ts,tsx}',

  prefix: "",

  theme: {    './components/**/*.{ts,tsx}',    './components/**/*.{ts,tsx}',

    container: {

      center: true,    './app/**/*.{ts,tsx}',    './app/**/*.{ts,tsx}',

      padding: "2rem",

      screens: {    './src/**/*.{ts,tsx}',    './src/**/*.{ts,tsx}',

        "2xl": "1400px",

      },  ],  ],

    },

    extend: {  prefix: "",  prefix: '',

      colors: {

        border: "hsl(var(--border))",  theme: {  theme: {

        input: "hsl(var(--input))",

        ring: "hsl(var(--ring))",    container: {    container: {

        background: "hsl(var(--background))",

        foreground: "hsl(var(--foreground))",      center: true,      center: true,

        primary: {

          DEFAULT: "hsl(var(--primary))",      padding: "2rem",      padding: '2rem',

          foreground: "hsl(var(--primary-foreground))",

        },      screens: {      screens: {

        secondary: {

          DEFAULT: "hsl(var(--secondary))",        "2xl": "1400px",        '2xl': '1400px',

          foreground: "hsl(var(--secondary-foreground))",

        },      },      },

        destructive: {

          DEFAULT: "hsl(var(--destructive))",    },    },

          foreground: "hsl(var(--destructive-foreground))",

        },    extend: {    extend: {

        muted: {

          DEFAULT: "hsl(var(--muted))",      colors: {      colors: {

          foreground: "hsl(var(--muted-foreground))",

        },        border: "hsl(var(--border))",        // Pediafor brand colors

        accent: {

          DEFAULT: "hsl(var(--accent))",        input: "hsl(var(--input))",        primary: {

          foreground: "hsl(var(--accent-foreground))",

        },        ring: "hsl(var(--ring))",          DEFAULT: '#ed5622',

        popover: {

          DEFAULT: "hsl(var(--popover))",        background: "hsl(var(--background))",          50: '#fef7f3',

          foreground: "hsl(var(--popover-foreground))",

        },        foreground: "hsl(var(--foreground))",          100: '#fdeee6',

        card: {

          DEFAULT: "hsl(var(--card))",        primary: {          200: '#fadacc',

          foreground: "hsl(var(--card-foreground))",

        },          DEFAULT: "hsl(var(--primary))",          300: '#f6bea2',

      },

      borderRadius: {          foreground: "hsl(var(--primary-foreground))",          400: '#f19977',

        lg: "var(--radius)",

        md: "calc(var(--radius) - 2px)",        },          500: '#ed5622',

        sm: "calc(var(--radius) - 4px)",

      },        secondary: {          600: '#e04017',

    },

  },          DEFAULT: "hsl(var(--secondary))",          700: '#bb2f0e',

  plugins: [],

}          foreground: "hsl(var(--secondary-foreground))",          800: '#9a280f',

        },          900: '#7e2410',

        destructive: {          950: '#440f05',

          DEFAULT: "hsl(var(--destructive))",        },

          foreground: "hsl(var(--destructive-foreground))",        secondary: {

        },          DEFAULT: '#4e4e4e',

        muted: {          50: '#f7f7f7',

          DEFAULT: "hsl(var(--muted))",          100: '#e3e3e3',

          foreground: "hsl(var(--muted-foreground))",          200: '#c8c8c8',

        },          300: '#a4a4a4',

        accent: {          400: '#818181',

          DEFAULT: "hsl(var(--accent))",          500: '#4e4e4e',

          foreground: "hsl(var(--accent-foreground))",          600: '#424242',

        },          700: '#323232',

        popover: {          800: '#262626',

          DEFAULT: "hsl(var(--popover))",          900: '#171717',

          foreground: "hsl(var(--popover-foreground))",          950: '#0d0d0d',

        },        },

        card: {        // Semantic colors

          DEFAULT: "hsl(var(--card))",        success: {

          foreground: "hsl(var(--card-foreground))",          DEFAULT: '#10b981',

        },          50: '#ecfdf5',

      },          100: '#d1fae5',

      borderRadius: {          200: '#a7f3d0',

        lg: "var(--radius)",          300: '#6ee7b7',

        md: "calc(var(--radius) - 2px)",          400: '#34d399',

        sm: "calc(var(--radius) - 4px)",          500: '#10b981',

      },          600: '#059669',

      keyframes: {          700: '#047857',

        "accordion-down": {          800: '#065f46',

          from: { height: "0" },          900: '#064e3b',

          to: { height: "var(--radix-accordion-content-height)" },          950: '#022c22',

        },        },

        "accordion-up": {        warning: {

          from: { height: "var(--radix-accordion-content-height)" },          DEFAULT: '#f59e0b',

          to: { height: "0" },          50: '#fffbeb',

        },          100: '#fef3c7',

      },          200: '#fde68a',

      animation: {          300: '#fcd34d',

        "accordion-down": "accordion-down 0.2s ease-out",          400: '#fbbf24',

        "accordion-up": "accordion-up 0.2s ease-out",          500: '#f59e0b',

      },          600: '#d97706',

    },          700: '#b45309',

  },          800: '#92400e',

  plugins: [require("tailwindcss-animate")],          900: '#78350f',

}          950: '#451a03',
        },
        error: {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Shadcn/ui compatible colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'fade-out': 'fade-out 0.15s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};