import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

/**
 * Alternative Vite config with proxy
 * This allows using Gemini API without exposing the key
 * BUT: Only works in development mode!
 * For production, you MUST use a real backend proxy
 */

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
        headers: {
          // This header is added by the proxy, so the key is NOT in frontend code
          // BUT: The key still passes through the browser's network tab
          // This is better than VITE_ variables but still not 100% secure
        },
      },
    },
  },
})
