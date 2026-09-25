import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from https://<user>.github.io/Tower/ on GitHub Pages, so every
  // built asset URL and route must be resolved relative to /Tower/ instead
  // of the domain root.
  base: '/Tower/',
  plugins: [react()],
  server: {
    port: 5173,
  },
})
