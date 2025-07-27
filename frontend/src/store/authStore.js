import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 1. Estado inicial é mais simples. O `persist` cuidará da reidratação.
      user: null,
      token: null,
      
      // Ação de Login (sem alterações, já estava ótima)
      login: (userData) => {
        set({
          user: userData.user,
          token: userData.token,
        });
      },

      // Ação de Logout (sem alterações)
      logout: () => {
        set({ user: null, token: null });
        
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
    }
  )
);