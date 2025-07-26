module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'prettier/prettier': 'warn',
    'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
    'complexity': ['warn', { max: 10 }], // Limita a complexidade ciclomática
    'no-unused-vars': ['warn', { args: 'after-used', ignoreRestSiblings: true }],
  },
};
