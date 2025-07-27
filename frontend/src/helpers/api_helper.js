import axios from "axios";
import toast from "react-hot-toast";

// A URL base da API será lida das variáveis de ambiente
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
console.log("Frontend API_URL:", API_URL);

// --- Eventos de Carregamento Global ---
const dispatchStartLoading = () => window.dispatchEvent(new CustomEvent('start-loading'));
const dispatchStopLoading = () => window.dispatchEvent(new CustomEvent('stop-loading'));
// ------------------------------------

const axiosApi = axios.create({
  baseURL: API_URL,
});

// Interceptador para adicionar o token JWT dinamicamente a cada requisição
axiosApi.interceptors.request.use(
  (config) => {
    const authUser = localStorage.getItem("auth-storage"); // Corrigido para 'auth-storage' do Zustand
    if (authUser) {
      const { token } = JSON.parse(authUser).state;
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers["Authorization"] = "Bearer " + token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratar respostas e erros de forma centralizada
axiosApi.interceptors.response.use(
  (response) => {
    // Se a resposta contiver uma mensagem de sucesso, exiba-a
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    return response.data;
  },
  (error) => {
    let errorMessage = "Ocorreu um erro inesperado.";

    if (error.response) {
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join('\n');
        errorMessage = `Por favor, corrija os seguintes erros:\n${validationErrors}`;
      } 
      else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = `Erro no servidor: ${error.response.status} ${error.response.statusText}`;
      }

      if (error.response.status === 401) {
        // Se for a rota de login, não redirecionar ou mostrar toast de sessão expirada
        if (error.config.url === '/api/users/login') {
          // Apenas rejeita a Promise para que o componente possa tratar
          return Promise.reject(error);
        } else {
          localStorage.removeItem("auth-storage");
          window.location.href = '/login';
          toast.error("Sua sessão expirou. Por favor, faça login novamente.");
        }
      } else {
        toast.error(errorMessage, { 
          style: { 
            whiteSpace: 'pre-line',
            maxWidth: '500px',
          } 
        });
      }

    } else if (error.request) {
      errorMessage = "Não foi possível se conectar ao servidor. Verifique sua conexão de rede.";
      toast.error(errorMessage);
      console.error("Network Error:", error);
    } else {
      errorMessage = error.message;
      toast.error(errorMessage);
      console.error("General Error:", error);
    }
    
    return Promise.reject(error);
  }
);

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