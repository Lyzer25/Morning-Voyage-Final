import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      reporter: ['text', 'html', 'clover', 'json'],
      exclude: [
        'node_modules/**',
        'test/**',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/**',
        '.next/**',
        'public/**',
      ],
    },
    // Mock Next.js specific modules
    alias: {
      '@/': resolve(__dirname, './'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
