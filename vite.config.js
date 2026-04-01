import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/main.jsx'],
      refresh: false,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./resources/js/src', import.meta.url)),
      '@components': fileURLToPath(new URL('./resources/js/src/components', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      host: 'localhost',
    },
  },
  css: {
    postcss: {
      config: false,
    },
  },
})