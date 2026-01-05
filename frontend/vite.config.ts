import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Enable polling for Docker on Windows
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      // HMR through Docker
      host: 'localhost',
      port: 5173,
    },
  },
})
