import { useState, useCallback } from 'react';
import api from '../utils/api'; // Import the configured axios instance

const useApi = (method) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async (url, body = null, config = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api[method.toLowerCase()](url, body, config);
        setData(res.data);
        return res.data;
      } catch (err) {
        const errorData = err.response ? err.response.data : { message: err.message };
        setError(errorData);
        throw errorData;
      } finally {
        setIsLoading(false);
      }
    },
    [method],
  );

  return {
    data,
    isLoading,
    error,
    request,
  };
};

export default useApi;
