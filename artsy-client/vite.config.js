import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/users": "http://localhost:3005",
      "/events": "http://localhost:3005",
      "/genres": "http://localhost:3005",
      "/posts": "http://localhost:3005",
      "/api": "http://localhost:3005",
      "/messages/conversations": "http://localhost:3005",
    },
  },
});
