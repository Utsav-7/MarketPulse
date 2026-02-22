/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
        },
        positive: '#10b981',
        negative: '#ef4444',
        accent: '#3b82f6',
        warning: '#f59e0b',
        border: '#334155',
      },
    },
  },
  plugins: [],
}
