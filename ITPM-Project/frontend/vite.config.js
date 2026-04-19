import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
});
