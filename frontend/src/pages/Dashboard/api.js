import { get } from '../../helpers/api_helper';

const fetchData = async (widgetId, period) => {
  try {
        const response = await get(`/api/dashboard?widgetId=${widgetId}&period=${period}`);
    return response;
  } catch (error) {
    console.error(`Error fetching data for widget ${widgetId}:`, error);
    throw error;
  }
};
