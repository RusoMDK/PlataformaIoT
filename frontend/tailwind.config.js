/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

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
          hover: '#2563EB',
          dark: '#60A5FA',
        },
        accent: {
          DEFAULT: '#FBBF24',
          dark: '#FACC15',
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
        },
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
      },
    },
  },
};