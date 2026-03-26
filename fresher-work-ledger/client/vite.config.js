import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1:5099',
        target: 'https://work-ledger-2.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
