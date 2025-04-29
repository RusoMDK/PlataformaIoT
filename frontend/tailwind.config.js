// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme'
import animatePlugin from 'tailwindcss-animate'

export default {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
    "*.{js,jsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#111827',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
        dark: {
          bg: '#0A0E1A',
          surface: '#1A202C',
          text: '#E5E7EB',
          muted: '#9CA3AF',
          border: '#374151',
        },
        primary: {
          DEFAULT: '#3B82F6',
          hover:   '#2563EB',
          dark:    '#60A5FA',
        },
        accent: {
          DEFAULT: '#FBBF24',
          dark:    '#FACC15',
        },
        success: {
          DEFAULT: '#10B981',
          hover:   '#059669',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover:   '#DC2626',
        },
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-right': {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        'slide-out-to-right': {
          '0%':   { transform: 'translateX(0)',      opacity: '1' },
          '100%': { transform: 'translateX(100%)',  opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        fadeInScale: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        
      },
      animation: {
        'fade-in-down':        'fade-in-down 0.3s ease-out both',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        fadeOut: 'fadeOut 0.3s ease-in-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out forwards',
        'slide-out-to-right':  'slide-out-to-right 0.2s ease-in forwards',
        fadeInScale: 'fadeInScale 0.25s ease-out',
      },
    },
  },
  plugins: [animatePlugin],
}