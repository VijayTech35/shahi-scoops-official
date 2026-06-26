import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    cssCodeSplit: true,
    sourcemap: false,
    target: 'es2020',
  },
})
