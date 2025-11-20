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
        manualChunks(id) {
          // Vendor chunk for core dependencies (always needed)
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vendor'
          }
          
          // Supabase (used across the app)
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
          
          // Admin-only heavy libraries (lazy loaded)
          if (id.includes('node_modules/chart.js')) {
            return 'charts'
          }
          
          if (id.includes('node_modules/xlsx')) {
            return 'xlsx'
          }
          
          if (id.includes('node_modules/sortablejs')) {
            return 'sortable'
          }
          
          if (id.includes('node_modules/flatpickr')) {
            return 'flatpickr'
          }
          
          // Admin pages bundle
          if (id.includes('/views/admin/')) {
            return 'admin'
          }
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

