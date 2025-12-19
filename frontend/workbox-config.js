
module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{json,ico,html,png,txt,css,js}',
    'offline.html' // Pre-cache the offline page
  ],
  swDest: 'build/service-worker.js',
  navigateFallback: 'offline.html', // Serve offline.html for offline navigation
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      urlPattern: /\/api\/sales|\/api\/service-orders/, // Intercept POST requests for sales and service orders
      handler: 'NetworkOnly', // Try network first, but queue if failed
      method: 'POST',
      options: {
        backgroundSync: {
          name: 'offline-post-queue',
          options: {
            maxRetentionTime: 24 * 60, // Retry for up to 24 hours
          },
        },
      },
    },
    {
      urlPattern: /\/api\/(dashboard|public-products|customers|service-orders)(\?.*)?$/, // APIs de leitura crítica
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'critical-data-api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hora
        },
        networkTimeoutSeconds: 5, // Tentar buscar da rede por 5s antes de usar o cache
      },
    },
    {
      urlPattern: /api\//, // Regra mais genérica para outras APIs
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutos
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'default',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 20,
        },
      },
    },
  ],
};
