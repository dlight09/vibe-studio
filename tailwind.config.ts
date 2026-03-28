import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['var(--font-newsreader)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
