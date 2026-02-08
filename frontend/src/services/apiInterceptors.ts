import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = uuidv4();
    }
  }

  return config;
};

export const responseErrorInterceptor = (error: any) => {
  if (error.response?.status === 401) {
    console.warn('Sessão expirada. Limpando dados e redirecionando...');
    localStorage.clear();
    sessionStorage.clear();
    
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
  }
  return Promise.reject(error);
};

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    responseErrorInterceptor
  );
};
