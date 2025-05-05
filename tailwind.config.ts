import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary))',
        'primary-dark': 'rgb(var(--primary-dark))',
        'primary-light': 'rgb(var(--primary-light))',
        secondary: 'rgb(var(--secondary))',
        accent: 'rgb(var(--accent))',
      },
    },
  },
  plugins: [],
}

export default config
