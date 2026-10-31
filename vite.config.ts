import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      entryRoot: resolve(import.meta.dirname, 'src'),
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts'],
      bundleTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: { index: resolve(import.meta.dirname, 'src/index.ts') },
      formats: ['es', 'cjs'],
      fileName: (format, entryAlias) => `${entryAlias}.${format === 'es' ? 'mjs' : 'cjs'}`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', '@dskripchenko/ui', '@dskripchenko/wysiwyg', /^@dskripchenko\/wysiwyg\//],
    },
    minify: false,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
