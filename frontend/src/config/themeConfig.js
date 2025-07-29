export const defaultThemeConfig = {
  logos: {
    light: '/redecellrj.png',
    dark: '/dark-mode-logo.png',
  },
  mode: 'light', // 'light' ou 'dark'
  colors: {
    primary: '#556ee6',
    secondary: '#74788d',
    success: '#34c38f',
    info: '#FF6F00',
    warning: '#f1b44c',
    danger: '#f46a6a',
    // Adicione outras cores semânticas aqui
  },
  fonts: {
    primary: {
      name: 'Inter',
      value: 'Inter, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    secondary: {
      name: 'Roboto',
      value: 'Roboto, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    },
    // Adicione outras fontes aqui
  },

  favicon: '/favicon.ico',
  // Adicione outras propriedades de tema (ex: spacing, shadows) aqui
};

export const availableFonts = [
  {
    name: 'Inter',
    value: 'Inter, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Roboto',
    value: 'Roboto, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Open Sans',
    value: 'Open Sans, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
  },
  // ... adicione mais fontes do Google Fonts
];
