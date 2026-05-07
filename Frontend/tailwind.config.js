export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        f1: {
          red:    '#E10600',
          dark:   '#15151E',
          darker: '#0A0A0F',
          white:  '#FFFFFF',
          gray:   '#38383F',
          silver: '#C0C0C0',
        },
        podium: {
          gold:   '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
        team: {
          redbull:  '#3671C6',
          ferrari:  '#E8002D',
          mercedes: '#27F4D2',
          mclaren:  '#FF8000',
          aston:    '#358C75',
          alpine:   '#FF87BC',
          williams: '#64C4FF',
          haas:     '#B6BABD',
          sauber:   '#52E252',
          racing:   '#6692FF',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'f1':         '0 0 20px rgba(225, 6, 0, 0.3)',
        'card':       '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}