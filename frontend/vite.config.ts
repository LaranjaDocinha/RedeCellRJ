import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';

import path from 'path'; // Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: ['**/*.tsx', '**/*.ts'],
    }),
    viteCompression(),
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
  define: {
    'process.env': {},
  },
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
    alias: [
      { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'events', replacement: 'events' },
      { find: 'assert', replacement: 'assert' },
      { find: 'zlib', replacement: 'browserify-zlib' },
      { find: /.+\.(css|less|scss|sass)$/, replacement: path.resolve(__dirname, './src/__mocks__/styleMock.js') }
    ],
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  optimizeDeps: {
    include: ['axios', 'react-window', 'react-virtualized-auto-sizer'],
    exclude: [],
  },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.tsx',
                    testTimeout: 100000,
                    css: false,
                    deps: {
                        inline: ['styled-components', '@mui/material', 'react-joyride', '@mui/x-data-grid'],
        },
        include: ['**/*.test.tsx', '**/*.test.ts'],
  
    // pool: 'forks',
    esbuild: {
      jsx: 'automatic',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**', 'src/pages/**', 'src/contexts/**', 'src/hooks/**', 'src/services/**', 'src/store/**', 'src/utils/**'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts', 'src/stories/**', 'src/test-utils/**'],
      all: true
    },
    server: {
      deps: {
        inline: ['styled-components', '@mui/material', 'react-joyride'],
      },
    },
  },
});
