import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

import path from 'path'; // Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: ['**/*.tsx', '**/*.ts'],
    }),
    visualizer({ open: true, filename: 'dist/stats.html' }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 8000000, // Increase limit to 8MB
        globIgnores: ['**\/stats.html'], // Ignore stats.html
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Redecell PDV',
        short_name: 'Redecell',
        description: 'Ponto de Venda e Gestão para Lojas de Celular',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separa as dependências em chunks separados para melhor análise
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  resolve: { // Add resolve configuration
    alias: {
      '@utils': path.resolve(__dirname, './src/utils'),
      stream: 'stream-browserify',
      events: 'events', // Add events alias
    },
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  optimizeDeps: {
    include: ['axios'],
    exclude: [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.tsx',
    testTimeout: 100000,
    // isolate: true,
    include: ['**/*.test.tsx', '**/*.test.ts'],
    // pool: 'forks',
    esbuild: {
      jsx: 'automatic',
    },
    server: {
      deps: {
        inline: ['styled-components', '@mui/material', 'react-joyride'],
      },
    },
  },
});
