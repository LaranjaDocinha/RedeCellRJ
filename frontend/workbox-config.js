
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
      urlPattern: /api\//, // Cache API calls
      handler: 'NetworkFirst', // Or 'StaleWhileRevalidate' depending on data freshness needs
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10, // If network fails for 10s, fallback to cache
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
      },\n    },
  ],
};
