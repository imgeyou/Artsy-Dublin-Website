import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/events': 'http://localhost:3005',
      '/users': 'http://localhost:3005',
      '/posts': 'http://localhost:3005',
    }
  }
})
