import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types/user';
import * as Sentry from '@sentry/react'; // Importar Sentry

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    Sentry.setUser(null); // Limpar o contexto do usuário no Sentry
  };

  useEffect(() => {
    const loadAuthData = () => {
      let storedUser = localStorage.getItem('user');
      let storedToken = localStorage.getItem('token');

      if (!storedUser || !storedToken) {
        storedUser = sessionStorage.getItem('user');
        storedToken = sessionStorage.getItem('token');
      }

      if (storedUser && storedToken) {
        // Basic JWT format validation (header.payload.signature)
        if (storedToken.split('.').length !== 3) {
          console.warn('AuthContext: Stored token is malformed (invalid format). Logging out.');
          logout();
          setLoading(false);
          return;
        }

        try {
          const decodedToken: { exp: number } = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 < Date.now()) {
            console.log('AuthContext: Token expired, logging out.');
            logout();
          } else {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);
            console.log('AuthContext: Token loaded:', storedToken ? 'yes' : 'no', 'isAuthenticated:', !!storedToken);
            // Definir o contexto do usuário no Sentry ao carregar dados existentes
            Sentry.setUser({
              id: userData.id,
              email: userData.email,
              username: userData.name || userData.email,
            });
            Sentry.setTag('user_id', userData.id);
            // Sentry.setTag('user_role', userData.role); // Assumindo que o role está no User object
          }
        } catch (e) {
          console.warn('AuthContext: Failed to parse or decode stored user or token. Logging out.', e);
          logout();
        }
      }
      setLoading(false);
    };
    loadAuthData();
  }, []);

  const login = (userData: User, userToken: string, rememberMe?: boolean) => {
    setUser(userData);
    setToken(userToken);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', userToken);

    // Adicionar contexto do usuário ao Sentry no login
    Sentry.setUser({
      id: userData.id,
      email: userData.email,
      username: userData.name || userData.email,
    });
    Sentry.setTag('user_id', userData.id);
    // Sentry.setTag('user_role', userData.role); // Assumindo que o role está no User object
  };

  const isAuthenticated = !!user && !!token;

  const authContextValue = React.useMemo(() => ({
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
  }), [user, token, isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
