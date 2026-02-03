import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression(),
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'ui-libs': ['lucide-react', 'clsx', 'tailwind-merge', 'html-to-image'],
        },
      },
    },
  },
})
