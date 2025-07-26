import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useGlobalFilter } from './GlobalFilterContext';
import useApi from '../hooks/useApi';
import { get } from '../helpers/api_helper';

// --- Helpers & Definitions (mantidos como estão) ---
const getFromLS = (key) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const settings = JSON.parse(localStorage.getItem('dashboard-settings')) || {};
      return settings[key];
    } catch (e) { console.error("Failed to parse localStorage settings", e); }
  }
  return undefined;
};

const saveToLS = (key, value) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const settings = JSON.parse(localStorage.getItem('dashboard-settings')) || {};
      localStorage.setItem('dashboard-settings', JSON.stringify({ ...settings, [key]: value }));
    } catch (e) { console.error("Failed to save to localStorage", e); }
  }
};

const WIDGETS = {
    kpi: { id: 'kpi', title: 'Indicadores Chave', defaultLayout: { w: 12, h: 1 } },
    salesByPayment: { id: 'salesByPayment', title: 'Vendas por Pagamento', defaultLayout: { w: 4, h: 2 } },
    lowStock: { id: 'lowStock', title: 'Alerta de Estoque Baixo', defaultLayout: { w: 4, h: 2 } },
    recentActivity: { id: 'recentActivity', title: 'Atividade Recente', defaultLayout: { w: 4, h: 2 } },
    monthlySales: { id: 'monthlySales', title: 'Vendas e Lucro (Diário)', defaultLayout: { w: 6, h: 2 } },
    topProducts: { id: 'topProducts', title: 'Ranking de Vendedores', defaultLayout: { w: 6, h: 2 } },
};
const ALL_WIDGET_IDS = Object.keys(WIDGETS);
const DEFAULT_WIDGETS = ['kpi', 'salesByPayment', 'monthlySales', 'recentActivity', 'topProducts', 'lowStock'];

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
  const { globalPeriod } = useGlobalFilter();
  const { request: fetchDashboardData, loading } = useApi(get);

  const [dashboardData, setDashboardData] = useState({ kpis: {}, widgets: {} });
  const [activeWidgets, setActiveWidgets] = useState(() => getFromLS('activeWidgets') || DEFAULT_WIDGETS);
  const [layouts, setLayouts] = useState(() => getFromLS('layouts') || getInitialLayouts(activeWidgets));
  const [focusModeWidget, setFocusModeWidget] = useState(null);

  const loadDashboardData = useCallback(() => {
    fetchDashboardData(`/dashboard/summary?period=${globalPeriod}`)
      .then(data => setDashboardData(data))
      .catch(err => {
        toast.error('Falha ao carregar dados do dashboard.');
        console.error(err);
      });
  }, [globalPeriod, fetchDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => { saveToLS('activeWidgets', activeWidgets); }, [activeWidgets]);
  useEffect(() => { saveToLS('layouts', layouts); }, [layouts]);

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
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
    toast.success(`Widget "${widget.title}" removido.`, { icon: '🗑️' });
  };

  const addWidget = (widgetId) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets(prev => [...prev, widgetId]);
    }
  };

  const availableWidgets = ALL_WIDGET_IDS.filter(id => !activeWidgets.includes(id)).map(id => WIDGETS[id]);

  const value = {
    WIDGETS,
    layouts,
    activeWidgets,
    availableWidgets,
    timePeriod: globalPeriod,
    focusModeWidget,
    setFocusModeWidget,
    onLayoutChange: handleLayoutChange,
    onAddWidget: addWidget,
    onRemoveWidget: removeWidget,
    onResetLayout: resetLayout,
    dashboardData,
    loading,
    refreshData: loadDashboardData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};