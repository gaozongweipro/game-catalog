import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        boxDemo: resolve(__dirname, 'box-demo.html'),
        showcase: resolve(__dirname, 'showcase.html'),
        proto: resolve(__dirname, 'proto.html'),
        protoBaked: resolve(__dirname, 'proto-baked.html'),
        protoPathtrace: resolve(__dirname, 'proto-pathtrace.html'),
        protoHybrid: resolve(__dirname, 'proto-hybrid.html'),
      },
    },
  },
  preview: { host: true, allowedHosts: true },
  server: { host: true, allowedHosts: true },
})
