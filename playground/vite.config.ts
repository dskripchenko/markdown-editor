import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [vue()],
  build: { outDir: resolve(import.meta.dirname, '../tests/browser/site'), emptyOutDir: true },
})
