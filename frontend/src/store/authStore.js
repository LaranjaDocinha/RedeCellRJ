import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Tenta carregar o estado inicial do localStorage de forma segura
const getInitialState = () => {
  try {
    const storedState = localStorage.getItem('auth-storage');
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      return parsedState.state;
    }
  } catch (error) {
    console.error("Falha ao carregar o estado de autenticação:", error);
  }
  return { user: null, token: null, isAuthLoading: false };
};


export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: getInitialState().user,
      token: getInitialState().token,
      isAuthLoading: getInitialState().isAuthLoading,

      // Ação de Login
      login: (userData) => {
        set({ 
          user: userData.user, 
          token: userData.token,
          isAuthLoading: false 
        });
      },

      // Ação de Logout
      logout: () => {
        set({ user: null, token: null });
        // O middleware de persistência já limpa o localStorage
      },

      // Seletor para verificar permissões
      hasRole: (roles) => {
        const { user } = get();
        if (!user || !user.role) {
          return false;
        }
        const rolesToCheck = Array.isArray(roles) ? roles : [roles];
        return rolesToCheck.includes(user.role);
      },

      // Seletor para verificar se está autenticado
      isAuthenticated: () => {
        return !!get().token;
      }
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage), // (opcional) especifica o storage
    }
  )
);

// Dispara a reidratação do estado no carregamento inicial da aplicação
useAuthStore.getState().isAuthLoading = false;
