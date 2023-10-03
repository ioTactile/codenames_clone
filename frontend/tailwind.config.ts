import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'border-yellow': '#fef9c2',
        yellow: '#fee400',
        'border-orange': '#e16000',
        orange: '#fa0',
        purple: '#881247',
        darkPurple: '#430027',
        blackPurple: '#1D0011',
        lightGray: '#CCCCCC',
        darkGray: '#727272',
        tutorial: '#FDE39C',
        'tutorial-desktop': 'hsla(86,70%,87%,.7)'
      },
      screens: {
        '1201px': '1201px',
        '1460px': '1460px'
      },
      borderRadius: {
        '20px': '20px'
      },
      boxShadow: {
        sharp: '4px 4px 0px 0px rgba(0, 0, 0, .59)',
        inset: 'inset 2px 2px 0px 0px silver'
      },
      fontSize: {
        vw: '4.5vw'
      },
      width: {
        '500px': '500px',
        '26vw': '26vw',
        '30vw': '30vw',
        '32vw': '32vw',
        '38vw': '38vw'
      },
      minHeight: {
        '700px': '700px'
      },
      spacing: {
        '50': '50px'
      }
    }
  },
  plugins: []
} satisfies Config
