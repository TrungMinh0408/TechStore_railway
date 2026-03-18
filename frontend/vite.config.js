import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: 'all',
    proxy: {

      '/api': {
        target: 'https://techstorerailway-copy-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})