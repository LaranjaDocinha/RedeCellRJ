import { get } from '../helpers/api_helper';

export const dashboardLoader = async ({ request }) => {
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "today"; // Default para 'today'
  
  try {
    const data = await get(`/api/dashboard/summary?period=${period}`);
    return { dashboardData: data, period };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    throw new Response("Falha ao carregar dados do dashboard.", { status: 500 });
  }
};