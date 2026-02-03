import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    // Set base path to /lifeplan/ for production, / for development
    base: isDev ? '/' : '/lifeplan/',
    plugins: [
      react(),
      tailwindcss(),
      // Only compress in production
      !isDev && viteCompression(),
    ],
    esbuild: {
      // Only drop console/debugger in production
      drop: isDev ? [] : ['console', 'debugger'],
    },
    build: {
      // Enable sourcemaps for debugging in dev build
      sourcemap: isDev,
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
  }
})
