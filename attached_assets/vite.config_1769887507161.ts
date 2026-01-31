import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Smart Expense Tracker',
        short_name: 'ExpenseTracker',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e40af',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /(https:\/\/your-netlify-app\.netlify\.app)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'netlify-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          }
        ]
      }
    })
  ]
})



