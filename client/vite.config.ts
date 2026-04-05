import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo name on GitHub — used as the base path for GitHub Pages.
// e.g. https://utsav-7.github.io/MarketPulse/
const REPO_NAME = 'MarketPulse'

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In GitHub Pages the app lives at /<repo-name>/
  base: isGitHubPages ? `/${REPO_NAME}/` : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5167',
        changeOrigin: true,
      },
    },
  },
})
