import { useState, useEffect } from 'react';
import axios from 'axios';

const useTopProductsData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setData([
          { name: 'iPhone 15', Vendas: 120 },
          { name: 'Cabo USB-C', Vendas: 98 },
          { name: 'Película Pro', Vendas: 85 },
          { name: 'Carregador 30W', Vendas: 73 },
          { name: 'Fone BT', Vendas: 51 },
          { name: 'Capa Silicone', Vendas: 45 },
        ]);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useTopProductsData;
