import axios from 'axios';
import toast from 'react-hot-toast';

// A URL base da API será lida das variáveis de ambiente
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- Eventos de Carregamento Global ---
const dispatchStartLoading = () => window.dispatchEvent(new CustomEvent('start-loading'));
const dispatchStopLoading = () => window.dispatchEvent(new CustomEvent('stop-loading'));
// ------------------------------------

// Instância Axios para requisições autenticadas
const axiosApi = axios.create({
  baseURL: API_URL,
});

// Interceptador para adicionar o token JWT dinamicamente a cada requisição autenticada
axiosApi.interceptors.request.use(
  (config) => {
    const authUser = localStorage.getItem('auth-storage'); // Corrigido para 'auth-storage' do Zustand
    if (authUser) {
      const { token } = JSON.parse(authUser).state;
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['Authorization'] = 'Bearer ' + token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Helper function to extract a readable error message
const getErrorMessage = (error) => {
  if (error && typeof error.message === 'string' && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocorreu um erro inesperado.';
};

// Interceptador de resposta para requisições autenticadas (tratamento de erros e redirecionamento)
axiosApi.interceptors.response.use(
  (response) => {
    // Se a resposta contiver uma mensagem de sucesso, exiba-a
    if (response.data && response.data.message && typeof response.data.message === 'string') {
      // Do not show toast for GET requests, as they are usually not direct user actions
      if (response.config.method !== 'get') {
        toast.success(response.data.message);
      }
    }
    return response.data;
  },
  (error) => {
    
    const errorMessage = getErrorMessage(error);

    if (error.response) {
      if (error.response.status === 401) {
        if (!error.config.url.includes('/api/users/login')) {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        } else {
          // Apenas rejeita a Promise para que o componente de login possa tratar
        }
      } else if (error.response.status === 403) {
        toast.error('Você não tem permissão para acessar esta funcionalidade.', {
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px',
          },
        });
      } else {
        toast.error(errorMessage, {
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px',
          },
        });
      }
    } else {
      toast.error(errorMessage, {
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px',
        },
      });
    }
    
    // Attach a user-friendly message to the error object
    if (error.response && typeof error.response.data === 'object' && error.response.data !== null) {
        error.response.data.friendlyMessage = errorMessage;
    } else if (!error.response) {
        error.friendlyMessage = errorMessage;
    }

    return Promise.reject(error);
  },
);

// Instância Axios para requisições PÚBLICAS (sem autenticação)
const axiosPublicApi = axios.create({
  baseURL: API_URL,
});

// Interceptador de resposta para requisições PÚBLICAS (apenas tratamento de erros, sem redirecionamento 401)
axiosPublicApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.message && typeof response.data.message === 'string') {
      // Do not show toast for GET requests
      if (response.config.method !== 'get') {
        toast.success(response.data.message);
      }
    }
    return response.data;
  },
  (error) => {
    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      style: {
        whiteSpace: 'pre-line',
        maxWidth: '500px',
      },
    });
    
    if (error.response && typeof error.response.data === 'object' && error.response.data !== null) {
        error.response.data.friendlyMessage = errorMessage;
    } else if (!error.response) {
        error.friendlyMessage = errorMessage;
    }

    return Promise.reject(error);
  },
);


// Funções para requisições autenticadas
export async function get(url, config = {}) {
  dispatchStartLoading();
  try {
    return await axiosApi.get(url, { ...config });
  } finally {
    dispatchStopLoading();
  }
}

export async function post(url, data, config = {}) {
  dispatchStartLoading();
  try {
    return await axiosApi.post(url, data, { ...config });
  } finally {
    dispatchStopLoading();
  }
}

export async function put(url, data, config = {}) {
  dispatchStartLoading();
  try {
    return await axiosApi.put(url, data, { ...config });
  } finally {
    dispatchStopLoading();
  }
}

export async function patch(url, data, config = {}) {
  dispatchStartLoading();
  try {
    return await axiosApi.patch(url, data, { ...config });
  } finally {
    dispatchStopLoading();
  }
}

export async function del(url, config = {}) {
  dispatchStartLoading();
  try {
    return await axiosApi.delete(url, { ...config });
  } finally {
    dispatchStopLoading();
  }
}

// Nova função para requisições PÚBLICAS (sem autenticação)
export async function publicGet(url, config = {}) {
  try {
    return await axiosPublicApi.get(url, { ...config });
  } finally {
  }
}