import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Determine base path based on mode
  let base = '/'
  if (mode === 'production') {
    base = '/aleph/'
  } else if (mode === 'staging') {
    base = '/aleph/staging/'
  }

  return {
    plugins: [vue()],
    base,
  }
})
