import { ApexOptions } from 'apexcharts';

// Paleta de Cores Neon Suave
export const chartColors = {
  primary: ['#6200EE', '#B819D2'], // Roxo para Rosa
  secondary: ['#03DAC6', '#006494'], // Ciano para Azul Profundo
  success: ['#4CAF50', '#8BC34A'], // Verde para Lima
  warning: ['#FFC107', '#FF5722'], // Âmbar para Laranja
};

/**
 * Gera opções base para gráficos ApexCharts com estilo Premium.
 * @param isDarkMode Se o tema atual é escuro
 */
export const getPremiumChartOptions = (isDarkMode: boolean): ApexOptions => {
  const textColor = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4, // Linhas pontilhadas elegantes
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth', // Curvas orgânicas
      width: 3,
      lineCap: 'round',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: isDarkMode ? 'dark' : 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.1, // Fade out suave para baixo
        stops: [0, 100],
      },
    },
    xaxis: {
      labels: { style: { colors: textColor, fontSize: '12px', fontFamily: 'Inter' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { style: { colors: textColor, fontSize: '12px', fontFamily: 'Inter' } },
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter',
      },
      // CSS customizado para Glassmorphism no Tooltip via classe global ou style injection do Apex
      // Nota: ApexCharts injeta estilos inline, então o controle total é limitado,
      // mas podemos estilizar o wrapper externo se usarmos custom tooltip render.
      x: { show: false },
      marker: { show: false },
    },
    markers: {
      size: 0,
      hover: { size: 6, sizeOffset: 3 }, // Bolinha aparece só no hover
    },
  };
};
