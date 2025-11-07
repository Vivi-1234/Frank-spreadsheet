import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          'vendor': ['vue', 'vue-router'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['chart.js'],
          'utils': ['sortablejs', 'flatpickr', 'xlsx']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', '@supabase/supabase-js']
  },
  server: {
    port: 5174,
    hmr: {
      overlay: false
    }
  }
})

