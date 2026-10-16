import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        boxDemo: resolve(__dirname, 'box-demo.html'),
        showcase: resolve(__dirname, 'showcase.html'),
      },
    },
  },
  preview: { host: true, allowedHosts: true },
  server: { host: true, allowedHosts: true },
})
