import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { availableFonts } from '../config/themeConfig';

// Objeto centralizado para as cores de cada tema
const themePalettes = {
  light: {
    text: '#212529',
    background: '#f8f9fa',
    chartTheme: 'light',
  },
  dark: {
    text: '#f8f9fa',
    background: '#212529',
    chartTheme: 'dark',
  },
  contrast: {
    text: '#000000',
    background: '#ffffff',
    chartTheme: 'light',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Estado principal para o nome do tema
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Estados para cores customizáveis
  const [primaryColor, setPrimaryColorState] = useState(() => localStorage.getItem('primaryColor') || '#556ee6');
  const [secondaryColor, setSecondaryColorState] = useState(() => localStorage.getItem('secondaryColor') || '#74788d');
  
  // Estados para configurações dos gráficos
  const [chartColor1, setChartColor1State] = useState(() => localStorage.getItem('chartColor1') || '#007bff');
  const [chartColor2, setChartColor2State] = useState(() => localStorage.getItem('chartColor2') || '#28a745');
  const [chartColor3, setChartColor3State] = useState(() => localStorage.getItem('chartColor3') || '#ffc107');
  const [dailyRevenueChartType, setDailyRevenueChartTypeState] = useState(() => localStorage.getItem('dailyRevenueChartType') || 'area');
  const [salesPaymentMethodChartType, setSalesPaymentMethodChartTypeState] = useState(() => localStorage.getItem('salesPaymentMethodChartType') || 'donut');
  const [repairStatusChartType, setRepairStatusChartTypeState] = useState(() => localStorage.getItem('repairStatusChartType') || 'donut');
  const [topProductsChartType, setTopProductsChartTypeState] = useState(() => localStorage.getItem('topProductsChartType') || 'bar');
  const [showXAxisLabels, setShowXAxisLabelsState] = useState(() => JSON.parse(localStorage.getItem('showXAxisLabels') ?? 'true'));
  const [showYAxisLabels, setShowYAxisLabelsState] = useState(() => JSON.parse(localStorage.getItem('showYAxisLabels') ?? 'true'));
  const [showChartLegend, setShowChartLegendState] = useState(() => JSON.parse(localStorage.getItem('showChartLegend') ?? 'true'));

  // Estados para fontes
  const [primaryFont, setPrimaryFontState] = useState(() => localStorage.getItem('primaryFont') || 'Inter');
  const [secondaryFont, setSecondaryFontState] = useState(() => localStorage.getItem('secondaryFont') || 'Roboto');

  // Função para converter hex para rgb
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  // Efeito para aplicar o tema principal (Bootstrap e cores derivadas)
  useEffect(() => {
    const currentPalette = themePalettes[theme] || themePalettes.light;

    // Aplica o tema do Bootstrap
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Aplica as cores de texto e fundo do tema atual
    document.documentElement.style.setProperty('--color-text', currentPalette.text);
    document.documentElement.style.setProperty('--color-text-rgb', hexToRgb(currentPalette.text));
    document.documentElement.style.setProperty('--color-background', currentPalette.background);
    document.documentElement.style.setProperty('--color-background-rgb', hexToRgb(currentPalette.background));

    // Salva o tema no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Efeitos para cores e fontes customizáveis
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-secondary-rgb', hexToRgb(secondaryColor));
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [secondaryColor]);

  useEffect(() => {
    const loadFont = (fontName) => {
      const font = availableFonts.find(f => f.name === fontName);
      if (font && font.url) {
        const linkId = `font-link-${fontName}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.href = font.url;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
      }
    };
    loadFont(primaryFont);
    loadFont(secondaryFont);
    document.documentElement.style.setProperty('--font-primary', availableFonts.find(f => f.name === primaryFont)?.value || 'sans-serif');
    document.documentElement.style.setProperty('--font-secondary', availableFonts.find(f => f.name === secondaryFont)?.value || 'sans-serif');
    localStorage.setItem('primaryFont', primaryFont);
    localStorage.setItem('secondaryFont', secondaryFont);
  }, [primaryFont, secondaryFont]);

  // Efeitos para salvar configurações no localStorage
  useEffect(() => { localStorage.setItem('chartColor1', chartColor1); }, [chartColor1]);
  useEffect(() => { localStorage.setItem('chartColor2', chartColor2); }, [chartColor2]);
  useEffect(() => { localStorage.setItem('chartColor3', chartColor3); }, [chartColor3]);
  useEffect(() => { localStorage.setItem('dailyRevenueChartType', dailyRevenueChartType); }, [dailyRevenueChartType]);
  useEffect(() => { localStorage.setItem('salesPaymentMethodChartType', salesPaymentMethodChartType); }, [salesPaymentMethodChartType]);
  useEffect(() => { localStorage.setItem('repairStatusChartType', repairStatusChartType); }, [repairStatusChartType]);
  useEffect(() => { localStorage.setItem('topProductsChartType', topProductsChartType); }, [topProductsChartType]);
  useEffect(() => { localStorage.setItem('showXAxisLabels', JSON.stringify(showXAxisLabels)); }, [showXAxisLabels]);
  useEffect(() => { localStorage.setItem('showYAxisLabels', JSON.stringify(showYAxisLabels)); }, [showYAxisLabels]);
  useEffect(() => { localStorage.setItem('showChartLegend', JSON.stringify(showChartLegend)); }, [showChartLegend]);

  // Funções de callback memorizadas para atualizar o estado
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'contrast' : 'light'));
  }, []);

  const setPrimaryColor = useCallback((color) => setPrimaryColorState(color), []);
  const setSecondaryColor = useCallback((color) => setSecondaryColorState(color), []);
  const setChartColor1 = useCallback((color) => setChartColor1State(color), []);
  const setChartColor2 = useCallback((color) => setChartColor2State(color), []);
  const setChartColor3 = useCallback((color) => setChartColor3State(color), []);
  const setDailyRevenueChartType = useCallback((type) => setDailyRevenueChartTypeState(type), []);
  const setSalesPaymentMethodChartType = useCallback((type) => setSalesPaymentMethodChartTypeState(type), []);
  const setRepairStatusChartType = useCallback((type) => setRepairStatusChartTypeState(type), []);
  const setTopProductsChartType = useCallback((type) => setTopProductsChartTypeState(type), []);
  const setShowXAxisLabels = useCallback((show) => setShowXAxisLabelsState(show), []);
  const setShowYAxisLabels = useCallback((show) => setShowYAxisLabelsState(show), []);
  const setShowChartLegend = useCallback((show) => setShowChartLegendState(show), []);
  const setPrimaryFont = useCallback((font) => setPrimaryFontState(font), []);
  const setSecondaryFont = useCallback((font) => setSecondaryFontState(font), []);

  // Deriva o tema do gráfico do tema principal
  const chartTheme = themePalettes[theme]?.chartTheme || 'light';

  // Monta o valor do contexto
  const contextValue = {
    theme,
    toggleTheme,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    // As cores de texto e fundo são derivadas, não definidas diretamente
    textColor: themePalettes[theme]?.text,
    backgroundColor: themePalettes[theme]?.background,
    chartTheme,
    // Não há mais um setChartTheme, pois ele é derivado
    chartColor1, setChartColor1,
    chartColor2, setChartColor2,
    chartColor3, setChartColor3,
    dailyRevenueChartType, setDailyRevenueChartType,
    salesPaymentMethodChartType, setSalesPaymentMethodChartType,
    repairStatusChartType, setRepairStatusChartType,
    topProductsChartType, setTopProductsChartType,
    showXAxisLabels, setShowXAxisLabels,
    showYAxisLabels, setShowYAxisLabels,
    showChartLegend, setShowChartLegend,
    primaryFont, setPrimaryFont,
    secondaryFont, setSecondaryFont,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
