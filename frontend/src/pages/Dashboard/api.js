// This file simulates a network API.
const kpiData = {
  'Este Mês': [
    { id: 'revenue', title: 'Faturamento Total', value: 18390.80, prefix: 'R$ ', icon: 'bx-dollar-circle', color: '#34c38f', trend: [5, 10, 5, 20, 8, 15], change: 12.5 },
    { id: 'profit', title: 'Lucro Bruto', value: 4320.50, prefix: 'R$ ', icon: 'bx-trending-up', color: '#50a5f1', trend: [10, 12, 15, 14, 18, 17], change: 8.2 },
    { id: 'ticket', title: 'Ticket Médio', value: 75.60, prefix: 'R$ ', icon: 'bx-receipt', color: '#f1b44c', trend: [5, 6, 8, 7, 9, 8], change: -2.1 },
    { id: 'clients', title: 'Novos Clientes', value: 82, prefix: '', icon: 'bx-user-plus', color: '#556ee6', trend: [2, 4, 3, 5, 6, 8], change: 20.0 },
  ],
  'Últimos 7 dias': [
    { id: 'revenue', title: 'Faturamento Total', value: 4250.30, prefix: 'R$ ', icon: 'bx-dollar-circle', color: '#34c38f', trend: [15, 12, 18, 10, 14, 20], change: 5.3 },
    { id: 'profit', title: 'Lucro Bruto', value: 980.10, prefix: 'R$ ', icon: 'bx-trending-up', color: '#50a5f1', trend: [8, 9, 7, 10, 11, 10], change: -1.5 },
    { id: 'ticket', title: 'Ticket Médio', value: 68.90, prefix: 'R$ ', icon: 'bx-receipt', color: '#f1b44c', trend: [6, 7, 6, 8, 7, 7], change: 3.8 },
    { id: 'clients', title: 'Novos Clientes', value: 23, prefix: '', icon: 'bx-user-plus', color: '#556ee6', trend: [3, 2, 4, 5, 3, 6], change: 12.1 },
  ],
  // Add other periods as needed
};

const fetchData = (widgetId, period) => {
  
  return new Promise(resolve => {
    setTimeout(() => {
      switch (widgetId) {
        case 'kpi':
          resolve(kpiData[period] || kpiData['Este Mês']);
          break;
        // Add other widget data mocks here
        default:
          resolve([]);
      }
    }, 1000 + Math.random() * 1500); // Simulate variable network delay
  });
};

export const dashboardAPI = {
  fetchData,
};
