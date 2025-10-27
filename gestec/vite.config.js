import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import jsconfigPaths from "vite-jsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  optimizeDeps: {
    include: [
      '@emotion/react', 
      '@emotion/styled', 
      '@mui/material/Tooltip'
    ],
  },
  server: {
    proxy: {
      // Proxy API requests to local PHP backend project folder
      '/tecnico': {
        target: 'http://localhost:81/GESTEC',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tecnico/, '/tecnico')
      },
      '/categoria': {
        target: 'http://localhost:81/GESTEC',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/categoria/, '/categoria')
      },
      '/ticket': {
        target: 'http://localhost:81/GESTEC',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ticket/, '/ticket')
      },
      '/uploads': {
        target: 'http://localhost:81/GESTEC',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads/, '/uploads')
      }
    }
  }
})
