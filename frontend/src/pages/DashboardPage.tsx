import React, { useState, useEffect, useCallback } from 'react';
import DashboardPageSkeleton from '../components/Dashboard/DashboardPageSkeleton';
import TotalSalesWidget from '../components/Dashboard/TotalSalesWidget';
import CategoryProfitabilityWidget from '../components/Dashboard/CategoryProfitabilityWidget';
import SalespersonPerformanceWidget from '../components/Dashboard/SalespersonPerformanceWidget';
import AnnualSalesComparisonWidget from '../components/Dashboard/AnnualSalesComparisonWidget';
import CriticalStockWidget from '../components/Dashboard/CriticalStockWidget';
import MostActiveCustomersWidget from '../components/Dashboard/MostActiveCustomersWidget';
import SalesByChannelWidget from '../components/Dashboard/SalesByChannelWidget';
import PriceTrendsWidget from '../components/Dashboard/PriceTrendsWidget';
import ProductPerformanceWidget from '../components/Dashboard/ProductPerformanceWidget';
import RevenueByHourWidget from '../components/Dashboard/RevenueByHourWidget';
import ReturnMetricsWidget from '../components/Dashboard/ReturnMetricsWidget';
import CustomerSegmentationWidget from '../components/Dashboard/CustomerSegmentationWidget';
import AbandonedCartsWidget from '../components/Dashboard/AbandonedCartsWidget';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import SalesByMonthChartWidget from '../components/Dashboard/SalesByMonthChartWidget';
import TopSellingProductsChartWidget from '../components/Dashboard/TopSellingProductsChartWidget';
import SalesGoalsWidget from '../components/Dashboard/SalesGoalsWidget';
import LoyaltyPointsWidget from '../components/Dashboard/LoyaltyPointsWidget';
import RecentSalesWidget from '../components/Dashboard/RecentSalesWidget';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../hooks/useUserDashboardApi';
import { arrayMove } from '@dnd-kit/sortable';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { FaChartBar } from 'react-icons/fa';
import {
  IconButton,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ButtonGroup,
  SelectChangeEvent
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardWidgetRenderer from '../components/Dashboard/DashboardWidgetRenderer';
import SlowMovingProductsWidget from '../components/Dashboard/SlowMovingProductsWidget'; // Added
import SalesForecastWidget from '../components/Dashboard/SalesForecastWidget'; // Added
import AverageTicketWidget from '../components/Dashboard/AverageTicketWidget'; // Added
import SalesHeatmapWidget from '../components/Dashboard/SalesHeatmapWidget'; // Added
import PurchaseSuggestionsWidget from '../components/Dashboard/PurchaseSuggestionsWidget'; // Adicionado

import ManageWidgetsModal from '../components/Dashboard/ManageWidgetsModal';
import Moment from 'moment';




// StyledEmptyState was imported from AuditLogList.styled.ts, which uses styled-components.
// We need to replace this with a MUI Box and apply styles via sx prop.
// For now, I'll define a simple motion.div with Box for styling
const StyledEmptyState = motion(Box); // Temporarily use motion.div with Box for styling

/**
 * @interface DashboardData
 * @description Define a estrutura dos dados principais do dashboard.
 * @property {number} totalSales - O valor total das vendas.
 * @property {Array<{ month: string; monthly_sales: number }>} salesByMonth - Vendas mensais.
 * @property {Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>} topSellingProducts - Produtos mais vendidos.
 * @property {Array<{ id: number; total_amount: number; sale_date: string }>} recentSales - Vendas recentes.
 */
interface DashboardData {
  totalSales: { mainPeriodSales: number; comparisonPeriodSales: number | null; }; // Alterado para objeto
  salesByMonth: { mainPeriodSalesByMonth: Array<{ month: string; monthly_sales: number }>; comparisonPeriodSalesByMonth: Array<{ month: string; monthly_sales: number }> | null; }; // Alterado para objeto
  topSellingProducts: { mainPeriodTopSellingProducts: Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>; comparisonPeriodTopSellingProducts: Array<{ product_name: string; variation_color: string; total_quantity_sold: number }> | null; }; // Alterado para objeto
  recentSales: { mainPeriodRecentSales: Array<{ id: number; total_amount: number; sale_date: string }>; comparisonPeriodRecentSales: Array<{ id: number; total_amount: number; sale_date: string }> | null; }; // Alterado para objeto
  slowMovingProducts: { mainPeriodSlowMovingProducts: any[]; comparisonPeriodSlowMovingProducts: any[] | null; }; // Alterado para objeto
  salesForecast: { mainPeriodSalesForecast: any; comparisonPeriodSalesForecast: any | null; }; // Alterado para objeto
  averageTicketBySalesperson: { mainPeriodAverageTicketBySalesperson: any[]; comparisonPeriodAverageTicketBySalesperson: any[] | null; }; // Alterado para objeto
  salesHeatmap: { mainPeriodSalesHeatmapData: any[]; comparisonPeriodSalesHeatmapData: any[] | null; }; // Alterado para objeto
}

/**
 * @interface WidgetConfig
 * @description Define a configuração de um widget no dashboard.
 * @property {string} id - Identificador único do widget.
 * @property {boolean} visible - Indica se o widget está visível.
 * @property {number} order - A ordem de exibição do widget.
 * @property {React.FC<any>} component - O componente React do widget.
 * @property {string} title - O título do widget.
 */
interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  component: React.FC<any>;
  title: string;
}

/**
 * @function DashboardPage
 * @description Componente principal da página do Dashboard.
 * Gerencia o estado dos widgets, busca dados, lida com drag-and-drop e configurações do usuário.
 * @returns {React.FC} O componente da página do Dashboard.
 */
const DashboardPage: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    [
      { id: 'totalSales', title: 'Vendas Totais', visible: true, order: 0, component: TotalSalesWidget },
      { id: 'salesByMonthChart', title: 'Vendas por Mês', visible: true, order: 1, component: SalesByMonthChartWidget },
      { id: 'topSellingProductsChart', title: 'Produtos Mais Vendidos', visible: true, order: 2, component: TopSellingProductsChartWidget },
      { id: 'salesGoals', title: 'Metas de Vendas', visible: true, order: 3, component: SalesGoalsWidget },
      { id: 'loyaltyPoints', title: 'Pontos de Fidelidade', visible: true, order: 4, component: LoyaltyPointsWidget },
      { id: 'recentSales', title: 'Vendas Recentes', visible: true, order: 5, component: RecentSalesWidget },
      { id: 'categoryProfitability', title: 'Rentabilidade por Categoria', visible: true, order: 6, component: CategoryProfitabilityWidget },
      { id: 'salespersonPerformance', title: 'Desempenho de Vendedores', visible: true, order: 7, component: SalespersonPerformanceWidget },
      { id: 'annualSalesComparison', title: 'Comparativo de Vendas Anual', visible: true, order: 8, component: AnnualSalesComparisonWidget },
      { id: 'criticalStock', title: 'Estoque Crítico', visible: true, order: 9, component: CriticalStockWidget },
      { id: 'mostActiveCustomers', title: 'Clientes Mais Ativos', visible: true, order: 10, component: MostActiveCustomersWidget },
      { id: 'salesByChannel', title: 'Vendas por Canal', visible: true, order: 11, component: SalesByChannelWidget },
      { id: 'priceTrends', title: 'Tendências de Preços', visible: true, order: 12, component: PriceTrendsWidget },
      { id: 'productPerformance', title: 'Desempenho de Produtos', visible: true, order: 13, component: ProductPerformanceWidget },
      { id: 'revenueByHour', title: 'Receita por Hora do Dia', visible: true, order: 14, component: RevenueByHourWidget },
      { id: 'returnMetrics', title: 'Métricas de Devolução', visible: true, order: 15, component: ReturnMetricsWidget },
      { id: 'customerSegmentation', title: 'Segmentação de Clientes', visible: true, order: 16, component: CustomerSegmentationWidget },
      { id: 'abandonedCarts', title: 'Carrinhos Abandonados', visible: true, order: 17, component: AbandonedCartsWidget },
      { id: 'slowMovingProducts', title: 'Produtos Sem Giro', visible: true, order: 18, component: SlowMovingProductsWidget }, // Added
      { id: 'salesForecast', title: 'Previsão de Vendas', visible: true, order: 19, component: SalesForecastWidget }, // Added
      { id: 'averageTicket', title: 'Ticket Médio por Vendedor', visible: true, order: 20, component: AverageTicketWidget }, // Added
      { id: 'salesHeatmap', title: 'Mapa de Calor de Vendas', visible: true, order: 21, component: SalesHeatmapWidget }, // Added
      { id: 'purchaseSuggestions', title: 'Sugestões de Compra', visible: true, order: 22, component: PurchaseSuggestionsWidget }, // Adicionado
    ]
  );
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last7days');
  const [startDate, setStartDate] = useState<Moment | null>(null);
  const [endDate, setEndDate] = useState<Moment | null>(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>(''); // Novo estado para filtro de vendedor
  const [selectedProduct, setSelectedProduct] = useState<string>(''); // Novo estado para filtro de produto
  const [selectedRegion, setSelectedRegion] = useState<string>(''); // Novo estado para filtro de região
  const [comparePeriod, setComparePeriod] = useState<string>(''); // Novo estado para comparação de período
  const { addToast } = useNotification();
  const { token, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour) {
      setRunTour(true);
      setSteps([
        {
          target: '.MuiTypography-h4',
          content: 'Bem-vindo ao seu Dashboard! Aqui você pode visualizar as principais métricas do seu negócio de forma personalizada.',
          disableBeacon: true,
          placement: 'bottom',
        },
        {
          target: '[data-tut="manage-widgets-button"]',
          content: 'Use este botão para adicionar, remover, reordenar e configurar a visibilidade dos widgets do seu dashboard, adaptando-o às suas necessidades.',
          placement: 'bottom',
        },
        {
          target: '.period-selector-form-control',
          content: 'Filtre os dados exibidos no dashboard por diferentes períodos de tempo pré-definidos, ou selecione um intervalo personalizado para uma análise mais específica.',
          placement: 'bottom',
        },
        {
          target: '.MuiButtonGroup-root', // Target the ButtonGroup for column selection
          content: 'Altere o layout do seu dashboard escolhendo entre 1, 2 ou 3 colunas para organizar seus widgets da melhor forma.',
          placement: 'bottom',
        },
        {
          target: '.widget-totalSales',
          content: 'Este widget exibe o valor total das vendas no período selecionado, fornecendo uma visão rápida da sua performance.',
          placement: 'top',
        },
        {
          target: '.widget-salesByMonthChart',
          content: 'Visualize suas vendas mensais através deste gráfico interativo, ideal para identificar tendências e padrões ao longo do tempo.',
          placement: 'top',
        },
        {
          target: '.widget-topSellingProductsChart',
          content: 'Descubra rapidamente quais são os seus produtos mais vendidos com este gráfico, ajudando na gestão de estoque e estratégias de marketing.',
          placement: 'top',
        },
        {
          target: '.widget-salesGoals',
          content: 'Acompanhe o progresso em relação às suas metas de vendas. Mantenha-se motivado e no caminho certo para atingir seus objetivos.',
          placement: 'top',
        },
        {
          target: '.widget-loyaltyPoints',
          content: 'Monitore os pontos de fidelidade dos seus clientes. Uma ferramenta essencial para programas de recompensa e retenção de clientes.',
          placement: 'top',
        },
        {
          target: '.widget-recentSales',
          content: 'Fique por dentro das últimas vendas realizadas. Uma visão em tempo real das transações mais recentes.',
          placement: 'top',
        },
        {
          target: '.MuiIconButton-root[aria-label="toggle light/dark mode"]', // Target the theme toggle button
          content: 'Alterne entre o modo claro e escuro para uma experiência visual mais confortável, adaptando-se às suas preferências ou condições de iluminação.',
          placement: 'left',
        },
        {
          target: '.MuiButton-root[startIcon] svg[data-testid="DownloadIcon"]', // Target the export CSV button
          content: 'Exporte os dados do seu dashboard para um arquivo CSV, permitindo análises mais aprofundadas ou o uso em outras ferramentas.',
          placement: 'left',
        },
      ]);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenDashboardTour', 'true');
    }
  };

/**
 * @function fetchDashboardData
 * @description Função assíncrona para buscar os dados principais do dashboard.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} period - O período selecionado (ex: 'last7days', 'custom').
 * @param {Moment | null} startDt - Data de início para período customizado.
 * @param {Moment | null} endDt - Data final para período customizado.
 * @param {string} salesperson - O vendedor selecionado.
 * @param {string} product - O produto selecionado.
 * @param {string} region - A região selecionada.
 * @param {string} comparePeriod - O período de comparação selecionado.
 * @returns {Promise<DashboardData>} Uma promessa que resolve com os dados do dashboard.
 * @throws {Error} Se a requisição HTTP falhar.
 */
  const fetchDashboardData = useCallback(async (token: string, period: string, startDt: Moment | null, endDt: Moment | null, salesperson: string, product: string, region: string, comparePeriod: string): Promise<DashboardData> => {
    let apiUrl = `/api/dashboard?period=${period}`;
    if (period === 'custom' && startDt && endDt) {
        apiUrl += `&startDate=${startDt.format('YYYY-MM-DD')}&endDate=${endDt.format('YYYY-MM-DD')}`;
    }
    if (salesperson) {
      apiUrl += `&salesperson=${salesperson}`;
    }
    if (product) {
      apiUrl += `&product=${product}`;
    }
    if (region) {
      apiUrl += `&region=${region}`;
    }
    if (comparePeriod) {
      apiUrl += `&comparePeriod=${comparePeriod}`;
    }
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // A API agora retorna um objeto com os dados principais e os dados de comparação
    const data = await response.json();
    return {
      totalSales: data.totalSales,
      salesByMonth: data.salesByMonth,
      topSellingProducts: data.topSellingProducts,
      recentSales: data.recentSales,
      slowMovingProducts: data.slowMovingProducts,
      salesForecast: data.salesForecast,
      averageTicketBySalesperson: data.averageTicketBySalesperson,
      salesHeatmap: data.salesHeatmap,
    };
  }, []);

  const { data, isLoading, isError, error } = useQuery<DashboardData, Error>({
    queryKey: ['dashboardData', token, selectedPeriod, startDate?.format('YYYY-MM-DD'), endDate?.format('YYYY-MM-DD'), selectedSalesperson, selectedProduct, selectedRegion, comparePeriod], // Add new filter to queryKey
    queryFn: () => fetchDashboardData(token!, selectedPeriod, startDate, endDate, selectedSalesperson, selectedProduct, selectedRegion, comparePeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar dados do dashboard: ${error.message}`, 'error');
    }
  }, [isError, error, addToast]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!isAuthenticated || !user?.id) return;
      try {
        const userSettings = await getSettings(token);
        if (userSettings && userSettings.widgets) {
          const mergedWidgets = widgets.map(defaultWidget => {
            const userWidget = userSettings.widgets.find((s: any) => s.id === defaultWidget.id);
            return { ...defaultWidget, ...userWidget };
          }).sort((a, b) => a.order - b.order);
          setWidgets(mergedWidgets);
        }
        if (userSettings && userSettings.gridColumns) {
          setGridColumns(userSettings.gridColumns);
        }
      } catch (error) {
        console.error('Falha ao buscar configurações do usuário:', error);
      }
    };
    fetchUserSettings();
  }, [isAuthenticated, user?.id, token]);

/**
 * @function handleDragEnd
 * @description Lida com o evento de fim de arrastar e soltar dos widgets, atualizando a ordem e salvando as configurações.
 * @param {any} event - O evento de drag-and-drop.
 */
  const handleDragEnd = useCallback(async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        const updatedOrder = newOrder.map((widget, index) => ({ ...widget, order: index }));
        
        if (isAuthenticated && user?.id) {
          updateSettings(token, { widgets: updatedOrder })
            .catch(err => console.error('Falha ao salvar as configurações do dashboard:', err));
        }
        return updatedOrder;
      });
    }
  }, [isAuthenticated, user?.id, token, setWidgets]);

/**
 * @function handleSaveWidgets
 * @description Salva as configurações atualizadas dos widgets (visibilidade e ordem).
 * @param {WidgetConfig[]} updatedWidgets - A lista de widgets com as configurações atualizadas.
 */
  const handleSaveWidgets = async (updatedWidgets: WidgetConfig[]) => {
    const sortedWidgets = updatedWidgets.map((w, index) => ({ ...w, order: index })).sort((a, b) => a.order - b.order);
    setWidgets(sortedWidgets);

    if (isAuthenticated && user?.id) {
      try {
        await updateSettings(token, { widgets: sortedWidgets });
        addToast('Configurações do dashboard salvas com sucesso!', 'success');
      } catch (err) {
        console.error('Falha ao salvar as configurações do dashboard.', err);
        addToast('Falha ao salvar as configurações do dashboard.', 'error');
      }
    }
  };

  const handleGridColumnsChange = useCallback(async (newColumns: number) => {
    setGridColumns(newColumns);
    if (isAuthenticated && user?.id) {
      try {
        await updateSettings(token, { gridColumns: newColumns });
        addToast('Layout do dashboard atualizado!', 'success');
      } catch (err) {
        console.error('Falha ao salvar as configurações de colunas:', err);
        addToast('Falha ao salvar as configurações de colunas.', 'error');
      }
    }
  }, [isAuthenticated, user?.id, token, addToast]);

/**
 * @function handleExportCsv
 * @description Exporta os dados visíveis do dashboard para um arquivo CSV.
 */
  const handleExportCsv = useCallback(() => {
    if (!data) {
      addToast('Nenhum dado para exportar.', 'info');
      return;
    }

    // Exemplo simples de exportação de dados de vendas totais
    const headers = ['Métrica', 'Valor'];
    const rows = [
      ['Total de Vendas', data.totalSales.mainPeriodSales.toFixed(2)], // Ajustado para mainPeriodSales
      // Adicionar outros dados do dashboard aqui, se necessário
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_data_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Dados do dashboard exportados com sucesso!', 'success');
    } else {
      addToast('Seu navegador não suporta a exportação de CSV.', 'error');
    }
  }, [data, addToast]);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    const period = event.target.value;
    setSelectedPeriod(period);
    if (period !== 'custom') {
        setStartDate(null);
        setEndDate(null);
    }
  };

  const handleStartDateChange = (date: Moment | null) => {
    setStartDate(date);
    if (date && (!endDate || date.isAfter(endDate))) {
        setEndDate(date.clone().add(7, 'days')); // Default to 7 days range
    }
    setSelectedPeriod('custom');
  };

  const handleEndDateChange = (date: Moment | null) => {
    setEndDate(date);
    if (date && (!startDate || date.isBefore(startDate))) {
        setStartDate(date.clone().subtract(7, 'days')); // Default to 7 days range
    }
    setSelectedPeriod('custom');
  };

  if (isLoading && !data) {
    return <DashboardPageSkeleton />; 
  }

  if (!data && !isLoading) {
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        sx={{
          padding: (theme) => theme.spacing(6), // Increased padding for more prominence
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400, // Increased minHeight for a larger empty state area
          color: (theme) => theme.palette.text.secondary,
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: (theme) => theme.borderRadius.large, // Use a larger border-radius for a softer look
          boxShadow: (theme) => theme.shadows.elevation4, // More pronounced shadow
          margin: '0 auto',
          maxWidth: 700, // Increased max-width
          mt: 4,
          '& svg': {
            fontSize: 100, // Even larger icon
            marginBottom: (theme) => theme.spacing(4), // Increased margin
            color: (theme) => theme.palette.primary.main,
          },
        }}
      >
        <FaChartBar />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Seu Dashboard Está Vazio!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 400 }}>
          Parece que não há dados para exibir no momento. Comece a registrar vendas e atividades para ver suas métricas aqui.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={() => window.location.reload()}>
          Começar Agora!
        </Button>
      </StyledEmptyState>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box
        sx={{
          padding: (theme) => theme.spacing(3),
          margin: '0 auto',
          maxWidth: 1200,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" sx={{
            fontSize: (theme) => theme.typography.h4.fontSize,
            lineHeight: (theme) => theme.typography.h4.lineHeight,
            fontWeight: (theme) => theme.typography.h4.fontWeight,
            color: (theme) => theme.palette.text.primary,
          }}>
            Dashboard
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit" aria-label="Alternar tema claro/escuro">
              {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: (theme) => theme.spacing(1), // Consistent spacing
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' }, // Center on small, end on larger
            width: { xs: '100%', sm: 'auto' }, // Take full width on small screens
            mt: { xs: 2, sm: 0 }, // Margin top on small screens
          }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setManageModalOpen(true)}
              data-tut="manage-widgets-button"
              startIcon={<SettingsIcon />}
            >
              Gerenciar Widgets
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportCsv}
              startIcon={<DownloadIcon />}
            >
              Exportar CSV
            </Button>

            <FormControl sx={{ minWidth: 120 }} size="small" className="period-selector-form-control">
              <InputLabel id="period-select-label">Período</InputLabel>
              <Select
                labelId="period-select-label"
                id="period-select"
                value={selectedPeriod}
                label="Período"
                onChange={handlePeriodChange}
              >
                <MenuItem value="today">Hoje</MenuItem>
                <MenuItem value="last7days">Últimos 7 Dias</MenuItem>
                <MenuItem value="last30days">Últimos 30 Dias</MenuItem>
                <MenuItem value="thisMonth">Este Mês</MenuItem>
                <MenuItem value="lastMonth">Mês Passado</MenuItem>
                <MenuItem value="thisYear">Este Ano</MenuItem>
                <MenuItem value="custom">Período Personalizado</MenuItem>
              </Select>
            </FormControl>

            {selectedPeriod === 'custom' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', gap: '8px' }} // Ensure they stay in a row
                >
                    <DatePicker
                        label="Data de Início"
                        value={startDate}
                        onChange={(date) => handleStartDateChange(date)}
                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
                    />
                    <DatePicker
                        label="Data Final"
                        value={endDate}
                        onChange={(date) => handleEndDateChange(date)}
                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
                        minDate={startDate || undefined}
                    />
                </motion.div>
            )}

            <Box sx={{
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' },
                mt: { xs: 2, sm: 0 },
            }}>
                <ButtonGroup variant="outlined" aria-label="layout columns">
                  <Button onClick={() => handleGridColumnsChange(1)} variant={gridColumns === 1 ? 'contained' : 'outlined'}>1 Coluna</Button>
                  <Button onClick={() => handleGridColumnsChange(2)} variant={gridColumns === 2 ? 'contained' : 'outlined'}>2 Colunas</Button>
                  <Button onClick={() => handleGridColumnsChange(3)} variant={gridColumns === 3 ? 'contained' : 'outlined'}>3 Colunas</Button>
                </ButtonGroup>
            </Box>
          </Box>
        </Box>


        {(data || isLoading) && (
          <DashboardWidgetRenderer
            widgets={widgets}
            data={data}
            onDragEnd={handleDragEnd}
            selectedPeriod={selectedPeriod}
            columns={gridColumns} // Pass columns prop
          />
        )}



        <ManageWidgetsModal
          isOpen={isManageModalOpen}
          onClose={() => setManageModalOpen(false)}
          widgets={widgets.map(w => ({ id: w.id, title: w.title, visible: w.visible }))}
          onSave={handleSaveWidgets}
        />

        <Joyride
          run={runTour}
          steps={steps}
          callback={handleJoyrideCallback}
          continuous
          showProgress
          showSkipButton
          styles={{
            options: {
              zIndex: 10000,
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DashboardPage;