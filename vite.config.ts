import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix for @react-pdf/renderer pako dependency
      'pako/lib/zlib/zstream': 'pako/lib/zlib/zstream.js',
    },
  },
  optimizeDeps: {
    include: ['pako'],
  },
})

