import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin } from 'vite'

// Inline plugin: ensures .glb files are served with the correct MIME type
// in the Vite dev server. The build pipeline (vite build) copies /public/
// verbatim to /dist/ and is unaffected — no special config needed there.
function glbMimePlugin(): Plugin {
  return {
    name: 'glb-mime',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith('.glb')) {
          res.setHeader('Content-Type', 'model/gltf-binary')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), glbMimePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // For GitHub Pages - update this when you know your repo name
  // If using custom domain, set base: '/'
  base: './',
})
