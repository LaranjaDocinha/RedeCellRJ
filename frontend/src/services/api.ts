import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

// Interceptor para injetar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros globais (como 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão expirada. Limpando dados e redirecionando...');
      
      // Limpeza completa
      localStorage.clear();
      sessionStorage.clear();
      
      // Redireciona para o login se já não estiver lá
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
