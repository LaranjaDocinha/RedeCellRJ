import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 1. Estado inicial é mais simples. O `persist` cuidará da reidratação.
      user: null,
      token: null,
      originalToken: null, // Novo estado para armazenar o token original do admin

      // Ação de Login (sem alterações, já estava ótima)
      login: (userData) => {
        set({
          user: userData.user,
          token: userData.token,
        });
      },

      // Nova ação para definir o token (útil para personificação)
      setToken: (newToken) => {
        set({ token: newToken });
      },

      // Nova ação para definir o token original (ao iniciar a personificação)
      setOriginalToken: (token) => {
        set({ originalToken: token });
      },

      // Ação de Logout (sem alterações)
      logout: () => {
        set({ user: null, token: null, originalToken: null }); // Limpa também o token original
      },

      // Ação para atualizar o perfil do usuário
      updateUserProfile: (newProfileData) => {
        set((state) => ({
          user: { ...state.user, ...newProfileData },
        }));
      },

      // --- Seletores (sem alterações, já eram perfeitos) ---

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
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
