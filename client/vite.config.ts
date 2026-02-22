import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Target HTTPS directly to avoid the HTTP→HTTPS 307 redirect
        // that causes browsers to strip the Authorization header cross-origin.
        target: 'https://localhost:7008',
        changeOrigin: true,
        secure: false,        // Accept the self-signed dev certificate
      },
    },
  },
})
