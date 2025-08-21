const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    'src': path.resolve(__dirname, 'src'),
    'pages': path.resolve(__dirname, 'src/pages'), // Add alias for 'pages'
    'components': path.resolve(__dirname, 'src/components'), // Add alias for 'components'
    'hooks': path.resolve(__dirname, 'src/hooks'), // Add alias for 'hooks'
    'helpers': path.resolve(__dirname, '../helpers'), // Add alias for 'helpers'
    'store': path.resolve(__dirname, 'src/store'), // Add alias for 'store'
  };

  // Add src to module resolution paths
  config.resolve.modules = [path.resolve(__dirname, 'src'), 'node_modules'];

  return config;
};