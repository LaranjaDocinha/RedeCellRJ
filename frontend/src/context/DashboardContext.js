import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// import { useGlobalFilter } from './GlobalFilterContext'; // Removido ou adaptado
import useApi from '../hooks/useApi';
import { get } from '../helpers/api_helper';

// --- Helpers & Definitions (mantidos como estão) ---
const getFromLS = (key) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const settings = JSON.parse(localStorage.getItem('dashboard-settings')) || {};
      return settings[key];
    } catch (e) {
      console.error('Falha ao parsear configurações do localStorage', e);
    }
  }
};

const saveToLS = (key, value) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const settings = JSON.parse(localStorage.getItem('dashboard-settings')) || {};
      localStorage.setItem('dashboard-settings', JSON.stringify({ ...settings, [key]: value }));
    } catch (e) {
      console.error('Falha ao salvar configurações no localStorage', e);
    }
  }
};

const WIDGETS = {
  kpi: { id: 'kpi', title: 'Indicadores Chave', defaultLayout: { w: 12, h: 1 } },
  predictions: { id: 'predictions', title: 'Previsão de Estoque', defaultLayout: { w: 4, h: 2 } },
  salesVelocity: {
    id: 'salesVelocity',
    title: 'Velocidade de Vendas',
    defaultLayout: { w: 8, h: 2 },
  },
  salesByPayment: {
    id: 'salesByPayment',
    title: 'Vendas por Pagamento',
    defaultLayout: { w: 4, h: 2 },
  },
  lowStock: { id: 'lowStock', title: 'Alerta de Estoque Baixo', defaultLayout: { w: 4, h: 2 } },
  recentActivity: {
    id: 'recentActivity',
    title: 'Atividade Recente',
    defaultLayout: { w: 4, h: 2 },
  },
  monthlySales: {
    id: 'monthlySales',
    title: 'Vendas e Lucro (Diário)',
    defaultLayout: { w: 6, h: 2 },
  },
  topProducts: { id: 'topProducts', title: 'Ranking de Vendedores', defaultLayout: { w: 6, h: 2 } },
};
const ALL_WIDGET_IDS = Object.keys(WIDGETS);
const DEFAULT_WIDGETS = [
  'kpi',
  'monthlySales',
  'salesVelocity',
  'predictions',
  'recentActivity',
  'topProducts',
  'lowStock',
];

const getInitialLayouts = (widgets) => ({
  lg: widgets.map((id, index) => {
    const w = WIDGETS[id]?.defaultLayout.w || 4;
    const h = WIDGETS[id]?.defaultLayout.h || 2;
    return { i: id, x: (index * w) % 12, y: Math.floor((index * w) / 12) * h, w, h };
  }),
});

// --- Context & Provider ---
const DashboardContext = createContext();
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  // const { globalPeriod } = useGlobalFilter(); // Removido ou adaptado
  const [dashboardData, setDashboardData] = useState({ kpis: {}, widgets: {} });
  const [activeWidgets, setActiveWidgets] = useState(
    () => getFromLS('activeWidgets') || DEFAULT_WIDGETS,
  );
  const [layouts, setLayouts] = useState(
    () => getFromLS('layouts') || getInitialLayouts(activeWidgets),
  );
  const [focusModeWidget, setFocusModeWidget] = useState(null);

  // Novo estado para o intervalo de datas
  const [startDate, setStartDate] = useState(() => {
    const savedStartDate = getFromLS('dashboardStartDate');
    return savedStartDate
      ? new Date(savedStartDate)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Padrão: últimos 30 dias
  });
  const [endDate, setEndDate] = useState(() => {
    const savedEndDate = getFromLS('dashboardEndDate');
    return savedEndDate ? new Date(savedEndDate) : new Date(); // Padrão: hoje
  });

  const { request: fetchDashboardData, loading } = useApi(get);

  const loadDashboardData = useCallback(() => {
    // Formatar datas para YYYY-MM-DD para a API
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';

    fetchDashboardData(
      `/api/dashboard/summary?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
    )
      .then((data) => {
        setDashboardData(data);
        // Assumindo que a API de dashboard/summary também retorna recentActivity
        // Se não, uma nova chamada de API será necessária aqui ou em um novo contexto
      })
      .catch((err) => {
        toast.error('Falha ao carregar dados do dashboard.');
      });
  }, [startDate, endDate, fetchDashboardData]); // Dependências incluem startDate e endDate

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    saveToLS('activeWidgets', activeWidgets);
  }, [activeWidgets]);
  useEffect(() => {
    saveToLS('layouts', layouts);
  }, [layouts]);
  // Salvar intervalo de datas no local storage
  useEffect(() => {
    saveToLS('dashboardStartDate', startDate?.toISOString());
  }, [startDate]);
  useEffect(() => {
    saveToLS('dashboardEndDate', endDate?.toISOString());
  }, [endDate]);

  const handleLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
  };

  const resetLayout = () => {
    setActiveWidgets(DEFAULT_WIDGETS);
    const newLayouts = getInitialLayouts(DEFAULT_WIDGETS);
    setLayouts(newLayouts);
    toast.success('Layout resetado para o padrão.');
  };

  const removeWidget = (widgetId) => {
    const widget = WIDGETS[widgetId];
    setActiveWidgets((prev) => prev.filter((id) => id !== widgetId));
    toast.success(`Widget "${widget.title}" removido.`, { icon: '🗑️' });
  };

  const addWidget = (widgetId) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets((prev) => [...prev, widgetId]);
    }
  };

  const availableWidgets = ALL_WIDGET_IDS.filter((id) => !activeWidgets.includes(id)).map(
    (id) => WIDGETS[id],
  );

  const handleDateRangeChange = useCallback(
    (start, end) => {
      const currentStartDateISO = startDate?.toISOString();
      const currentEndDateISO = endDate?.toISOString();
      const newStartDateISO = start?.toISOString();
      const newEndDateISO = end?.toISOString();

      if (currentStartDateISO !== newStartDateISO || currentEndDateISO !== newEndDateISO) {
        setStartDate(start);
        setEndDate(end);
      }
    },
    [startDate, endDate],
  ); // Dependências para useCallback

  const value = {
    WIDGETS,
    layouts,
    activeWidgets,
    availableWidgets,
    // timePeriod: globalPeriod, // Removido ou adaptado
    focusModeWidget,
    setFocusModeWidget,
    onLayoutChange: handleLayoutChange,
    onAddWidget: addWidget,
    onRemoveWidget: removeWidget,
    onResetLayout: resetLayout,
    dashboardData,
    loading,
    refreshData: loadDashboardData,
    startDate, // Expor startDate
    endDate, // Expor endDate
    setDateRange: handleDateRangeChange, // Expor setter para o intervalo de datas
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
