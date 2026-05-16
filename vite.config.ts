/**
 * @file vite.config.ts
 * @description Vite configuration file. 
 * Includes support for React, Tailwind CSS v4, and optional local HTTPS via mkcert.
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'

const hasCert = fs.existsSync('./localhost-key.pem') && fs.existsSync('./localhost.pem')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: hasCert ? {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    } : undefined,
    host: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      // Reporters: text in terminal, JSON for the GitHub Actions coverage action,
      // HTML for the downloadable artifact, LCOV for third-party tools.
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test-setup.ts',
        'src/main.tsx',          // entry point — no testable logic
        'src/**/*.d.ts',
      ],
      // Soft thresholds — CI warns but does NOT fail while coverage is still
      // being bootstrapped.  Raise these as test coverage matures.
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40,
      },
    },
  },
})
