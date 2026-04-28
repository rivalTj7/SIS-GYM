import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
      colors: {
        bg:       '#0a0a0a',
        surface:  '#111111',
        card:     '#181818',
        border:   '#2a2a2a',
        accent:   '#c8ff00',
        accent2:  '#ff4d4d',
        accent3:  '#4daaff',
        green:    '#3ddc84',
        text:     '#f2f0ea',
        muted:    '#666666',
        muted2:   '#888888',
      },
      letterSpacing: {
        widest: '0.3em',
      },
    },
  },
  plugins: [],
};

export default config;
