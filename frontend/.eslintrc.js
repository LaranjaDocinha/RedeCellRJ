// frontend/.eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended', // Adiciona o plugin do Prettier
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jsx-a11y',
    'import', // Adiciona o plugin de import
    'react-hooks',
    'prettier' // Adiciona o plugin do Prettier
  ],
  rules: {
    'prettier/prettier': 'warn', // Mostra avisos do Prettier como 'warn'
    'react/react-in-jsx-scope': 'off', // O novo JSX Transform do React 17+ torna isso desnecessário
    'react-hooks/rules-of-hooks': 'error', // Garante que os hooks são usados corretamente
    'react-hooks/exhaustive-deps': 'warn', // Avisa sobre dependências ausentes em hooks
    'import/order': [ // Ordena e agrupa os imports
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        'newlines-between': 'always',
      },
    ],
    'import/no-duplicates': 'warn', // Avisa sobre imports duplicados
    'jsx-a11y/anchor-is-valid': 'warn', // Avisa sobre âncoras sem href válido
    'react/prop-types': 'off', // Desativado por enquanto, podemos ativar no futuro se usarmos PropTypes
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
