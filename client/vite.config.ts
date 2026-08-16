import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), compression({ threshold: 1024 })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // 数学库
          'vendor-math': ['mathjs', 'katex'],
        },
      },
    },
    // 数学渲染依赖较大，提高警告阈值
    chunkSizeWarningLimit: 1500,
  },
})
