import { useState, useEffect } from 'react';
import { get } from '../helpers/api_helper';

const useLowStockProductsData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get('/api/reports/low-stock-products');
        setData(response);
      } catch (err) {
        setError(err);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useLowStockProductsData;
