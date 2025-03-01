/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        animation: {
          'fade-in-up': 'fadeInUp 1s ease-out forwards',
          'fade-in-up-delay': 'fadeInUp 1s ease-out 0.5s forwards',
          'fade-in-up-delay-more': 'fadeInUp 1s ease-out 1s forwards',
          'fade-in-up-delay-most': 'fadeInUp 1s ease-out 1.5s forwards',
          'scroll': 'scroll 60s linear infinite',
          'spin': 'spin 1s linear infinite',
          'pulse': 'pulse 1.5s infinite',
        },
        keyframes: {
          fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(1.25rem)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          },
          scroll: {
            '0%': { transform: 'translate(0, 0)' },
            '100%': { transform: 'translate(-100%, 0)' }
          },
          spin: {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          },
          pulse: {
            '0%': { opacity: '1' },
            '50%': { opacity: '0.7' },
            '100%': { opacity: '1' }
          }
        },
      },
    },
    plugins: [],
  }