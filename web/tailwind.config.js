/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060911',
          900: '#0A0E1A',
          850: '#0E1424',
          800: '#131C31',
          700: '#1E293B',
        },
        cyan: {
          glow: '#22D3EE',
          dim: 'rgba(34, 211, 238, 0.15)',
        },
        amber: {
          glow: '#F59E0B',
          dim: 'rgba(245, 158, 11, 0.15)',
        },
        danger: {
          red: '#EF4444',
          dim: 'rgba(239, 68, 68, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'cyan-glow': '0 0 25px -4px rgba(34, 211, 238, 0.45), 0 0 10px -2px rgba(34, 211, 238, 0.3)',
        'amber-glow': '0 0 25px -4px rgba(245, 158, 11, 0.45)',
        'red-glow': '0 0 25px -4px rgba(239, 68, 68, 0.45)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

