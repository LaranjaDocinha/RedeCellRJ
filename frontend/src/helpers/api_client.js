import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Importar o store

let activeRequests = 0;

const startLoading = () => {
  window.dispatchEvent(new Event('start-loading'));
};

const stopLoading = () => {
  window.dispatchEvent(new Event('stop-loading'));
};

const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    config => {
      const token = useAuthStore.getState().token; // Obter o token do store
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (activeRequests === 0) {
        startLoading();
      }
      activeRequests++;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  const responseInterceptor = response => {
    activeRequests--;
    if (activeRequests === 0) {
      stopLoading();
    }
    return response;
  };

  const errorInterceptor = error => {
    activeRequests--;
    if (activeRequests === 0) {
      stopLoading();
    }

    // Check for 401 Unauthorized or 403 Forbidden status
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Não remover o token aqui, o logout deve ser explícito
      // O redirecionamento para login deve ser tratado pelo componente de rota protegida
      // ou por um contexto de autenticação global que reage a um estado de não autenticado
      // window.location.href = '/login'; // Evitar redirecionamento forçado aqui
    }

    return Promise.reject(error);
  };

  axios.interceptors.response.use(responseInterceptor, errorInterceptor);
};

export default setupAxiosInterceptors;
