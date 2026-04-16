import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/users": "https://2526-cs7025-group2.scss.tcd.ie/",
      "/genres": "https://2526-cs7025-group2.scss.tcd.ie/",
      "/api": "https://2526-cs7025-group2.scss.tcd.ie/",
    },
  },
});
