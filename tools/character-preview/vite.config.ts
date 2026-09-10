import { defineConfig } from 'vite'

// Standalone from the app: this is a workshop tool, not something that ships.
export default defineConfig({
  root: __dirname,
  server: { port: 5190, strictPort: true, open: false },
})
