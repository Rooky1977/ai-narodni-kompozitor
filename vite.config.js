import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    include: ['tone', 'wavesurfer.js'],
    exclude: ['@magenta/music'],
  },
  resolve: {
    alias: {
      // Magenta pulls node-ish bits; keep browser build stable
    },
  },
})
