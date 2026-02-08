import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id?: number;
  permissions: { action: string; subject: string }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (action: string, subject: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        localStorage.removeItem('token'); // Fallback para compatibilidade
        set({ user: null, token: null, isAuthenticated: false });
      },

      hasPermission: (action, subject) => {
        const { user } = get();
        if (!user) return false;
        
        return user.permissions.some(p => 
          (p.action === action && p.subject === subject) ||
          (p.action === 'manage' && p.subject === subject) ||
          (p.subject === 'all')
        );
      },
    }),
    {
      name: 'redecell-auth-storage',
    }
  )
);
