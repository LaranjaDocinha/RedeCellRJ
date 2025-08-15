import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      originalToken: null, 

      login: (userData) => {
        set({
          user: userData.user,
          token: userData.token,
        });
      },

      setToken: (newToken) => {
        set({ token: newToken });
      },

      setOriginalToken: (token) => {
        set({ originalToken: token });
      },

      logout: () => {
        set({ user: null, token: null, originalToken: null });
      },

      updateUserProfile: (newProfileData) => {
        set((state) => ({
          user: { ...state.user, ...newProfileData },
        }));
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user || !user.role) {
          return false;
        }
        const rolesToCheck = Array.isArray(roles) ? roles : [roles];
        return rolesToCheck.includes(user.role);
      },

      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
