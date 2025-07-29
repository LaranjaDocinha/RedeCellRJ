import { useState, useEffect } from 'react';

import { useDashboard } from '../context/DashboardContext';
import { dashboardAPI } from '../pages/Dashboard/api';

const useWidgetData = (widgetId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { timePeriod } = useDashboard();

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await dashboardAPI.fetchData(widgetId, timePeriod);
        setData(result);
      } catch (err) {
        setError(err);
        console.error(`Failed to fetch data for widget ${widgetId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [widgetId, timePeriod]);

  return { data, isLoading, error };
};

export default useWidgetData;
