import axios from 'axios';
import axiosRetry from 'axios-retry';
import { setupInterceptors } from './apiInterceptors';
import { API_BASE_URL } from '../config/constants';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  withCredentials: true, // Importante para cookies (refreshToken)
});

// Configurar Retry com Backoff Exponencial
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
  },
  onRetry: (retryCount, error, requestConfig) => {
      console.warn(`Tentativa de retry #${retryCount} para ${requestConfig.url} devido a erro:`, error.message);
  }
});

// Configurar Interceptores (Auth, Idempotency, 401)
setupInterceptors(api);

export default api;
