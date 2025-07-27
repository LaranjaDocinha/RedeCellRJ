import { useState, useCallback } from 'react';

const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorData = err.response ? err.response.data : { message: err.message };
      setError(errorData);
      // Não relance o erro, o componente que usa o hook deve verificar o estado de 'error'.
      return Promise.reject(errorData);
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return {
    data,
    loading,
    error,
    request,
  };
};

export default useApi;
