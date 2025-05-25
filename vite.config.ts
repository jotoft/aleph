import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  // Only use base path in production (GitHub Pages)
  base: mode === 'production' ? '/aleph/' : '/',
}))
