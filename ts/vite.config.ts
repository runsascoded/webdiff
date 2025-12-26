import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, '../webdiff/static/js'),
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.tsx'),
      output: {
        entryFileNames: 'file_diff.js',
        // Single bundle - no code splitting
        manualChunks: undefined,
        // Inline dynamic imports to keep single bundle
        inlineDynamicImports: true,
      },
    },
  },
})
