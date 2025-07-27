import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultThemeConfig } from '../config/themeConfig';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: defaultThemeConfig,
      
      setThemeMode: (mode) => {
        set((state) => ({ theme: { ...state.theme, mode } }));
        get().applyCssVariables();
      },
      setPrimaryColor: (color) => {
        set((state) => ({ theme: { ...state.theme, colors: { ...state.theme.colors, primary: color } } }));
        get().applyCssVariables();
      },
      setLogoLight: (url) => set((state) => ({ theme: { ...state.theme, logos: { ...state.theme.logos, light: url } } })),
      setLogoDark: (url) => set((state) => ({ theme: { ...state.theme, logos: { ...state.theme.logos, dark: url } } })),
      setFavicon: (url) => set((state) => ({ theme: { ...state.theme, favicon: url } })),
      setPrimaryFont: (font) => set((state) => ({ theme: { ...state.theme, fonts: { ...state.theme.fonts, primary: font } } })),
      setSecondaryFont: (font) => set((state) => ({ theme: { ...state.theme, fonts: { ...state.theme.fonts, secondary: font } } })),
      // Adicione setters para outras propriedades de tema conforme necessário

      getCurrentLogo: () => {
        const { mode, logos } = get().theme;
        return mode === 'dark' ? logos.dark : logos.light;
      },

      applyCssVariables: () => {
        const { theme } = get();
        const root = document.documentElement;

        // Aplicar cores
        for (const [key, value] of Object.entries(theme.colors)) {
          root.style.setProperty(`--theme-color-${key}`, value);
          const rgb = value.match(/\d+/g);
          if (rgb) {
            root.style.setProperty(`--theme-color-${key}-rgb`, rgb.join(','));
          }
        }

        // Aplicar fontes
        root.style.setProperty('--font-family-primary', theme.fonts.primary.value);
        root.style.setProperty('--font-family-secondary', theme.fonts.secondary.value);

        // Carregar fontes dinamicamente
        const loadFont = (font) => {
          if (font.url && !document.querySelector(`link[href="${font.url}"]`)) {
            const link = document.createElement('link');
            link.href = font.url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        };
        loadFont(theme.fonts.primary);
        loadFont(theme.fonts.secondary);

        // Aplicar favicon
        const faviconLink = document.querySelector("link[rel*='icon']") || document.createElement('link');
        faviconLink.href = theme.favicon;
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);

        const shortcutIconLink = document.querySelector("link[rel*='shortcut icon']") || document.createElement('link');
        shortcutIconLink.href = theme.favicon;
        shortcutIconLink.rel = 'shortcut icon';
        document.head.appendChild(shortcutIconLink);
      },
    }),
    {
      name: 'app-theme-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrate: (state) => {
        state.applyCssVariables(); // Aplicar variáveis CSS na reidratação
      },
    }
  )
);

// Aplicação inicial das variáveis CSS ao carregar o aplicativo
useThemeStore.getState().applyCssVariables();