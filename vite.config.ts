import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isStaging = mode === 'staging'

  // Set base path based on mode
  // Development: /
  // Staging: /LifePath/ (for GitHub Pages on this repo)
  // Production: /lifeplan/ (for deployment to horoama.github.io/lifeplan)
  let base = '/lifeplan/'
  if (isDev) {
    base = '/'
  } else if (isStaging) {
    base = '/LifePath/'
  }

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      // Only compress in production/staging (not dev)
      !isDev && viteCompression(),
    ],
    esbuild: {
      // Only drop console/debugger in production/staging
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
