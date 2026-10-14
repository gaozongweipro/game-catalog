import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  preview: {
    host: true,
    allowedHosts: true,
  },
  server: {
    host: true,
    allowedHosts: true,
  },
})
