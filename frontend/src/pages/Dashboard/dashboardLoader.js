import { dashboardAPI } from './api';

const WIDGET_IDS = ['kpi', 'salesByPayment', 'lowStock', 'recentActivity', 'monthlySales', 'topProducts'];

export async function dashboardLoader({ request }) {
  const url = new URL(request.url);
  const timePeriod = url.searchParams.get('period') || 'Este Mês';

  try {
    const dataPromises = WIDGET_IDS.map(widgetId => 
      dashboardAPI.fetchData(widgetId, timePeriod)
    );

    const results = await Promise.all(dataPromises);

    const dashboardData = WIDGET_IDS.reduce((acc, widgetId, index) => {
      acc[widgetId] = results[index];
      return acc;
    }, {});

    return { dashboardData, timePeriod };
  } catch (error) {
    console.error("Failed to load dashboard data", error);
    // Em um app real, poderíamos retornar um objeto de erro
    // para ser tratado por um `errorElement` na rota.
    throw new Response("Não foi possível carregar os dados do dashboard.", { status: 500 });
  }
}
