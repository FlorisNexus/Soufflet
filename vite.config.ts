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
  },
})
