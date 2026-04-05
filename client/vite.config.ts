import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo name on GitHub — used as the base path for GitHub Pages.
// e.g. https://utsav-7.github.io/MarketPulse/
const REPO_NAME = 'MarketPulse'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // In CI (GitHub Actions) set base to /<repo>/, otherwise serve from /
  base: mode === 'production' && process.env['GITHUB_ACTIONS'] === 'true'
    ? `/${REPO_NAME}/`
    : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5167',
        changeOrigin: true,
      },
    },
  },
}))
