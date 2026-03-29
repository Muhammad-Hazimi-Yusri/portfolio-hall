import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin } from 'vite'

// Inline plugin: ensures .glb and .splat files are served with the correct
// MIME type in the Vite dev server. The build pipeline (vite build) copies
// /public/ verbatim to /dist/ and is unaffected — no special config needed.
function assetMimePlugin(): Plugin {
  return {
    name: 'asset-mime',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith('.glb')) {
          res.setHeader('Content-Type', 'model/gltf-binary')
        }
        if (req.url && req.url.endsWith('.splat')) {
          res.setHeader('Content-Type', 'application/octet-stream')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), assetMimePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // For GitHub Pages - update this when you know your repo name
  // If using custom domain, set base: '/'
  base: './',
})
