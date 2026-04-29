import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy config: route `/api` to local bridge and `/pia` to the backend from the OpenAPI YAML
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/pia': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pia/, '/PiaMiddleware_Beta_NewLocalDevJava/v3/processes/instances')
      }
    }
  }
})
