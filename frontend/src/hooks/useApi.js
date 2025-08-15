import { useState, useCallback } from 'react';

const useApi = (apiFunc) => {
  

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async (...args) => {
      if (typeof apiFunc !== 'function') {
        const err = new Error('apiFunc is not a function');
        setError({ message: err.message });
        return Promise.reject(err);
      }
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorData = err.response ? err.response.data : { message: err.message };
        setError(errorData);
        return Promise.reject(errorData);
      } finally {
        setLoading(false);
      }
    },
    [apiFunc],
  );

  return {
    data,
    loading,
    error,
    request,
  };
};

export default useApi;
