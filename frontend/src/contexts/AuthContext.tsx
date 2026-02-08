import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types/user';
import * as Sentry from '@sentry/react';

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

  const authChannel = React.useMemo(() => new BroadcastChannel('auth_channel'), []);

  const logout = React.useCallback((skipBroadcast = false) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    Sentry.setUser(null);

    if (!skipBroadcast) {
        authChannel.postMessage('LOGOUT');
    }
  }, [authChannel]);

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
        if (event.data === 'LOGOUT') {
            logout(true);
            window.location.reload();
        }
    };

    authChannel.addEventListener('message', handleAuthMessage);
    
    const loadAuthData = () => {
      try {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (storedUser && storedToken) {
          // Validação básica do formato do token (deve ter 2 pontos para ser JWT)
          if (storedToken.split('.').length === 3) {
            const decoded: any = jwtDecode(storedToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
              logout();
            } else {
              setUser(JSON.parse(storedUser));
              setToken(storedToken);
              Sentry.setUser({ id: decoded.id, email: decoded.email });
            }
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();

    return () => {
        authChannel.removeEventListener('message', handleAuthMessage);
    };
  }, [authChannel, logout]);

  const login = (userData: User, userToken: string, rememberMe?: boolean) => {
    setUser(userData);
    setToken(userToken);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', userToken);

    Sentry.setUser({
      id: userData.id,
      email: userData.email,
      username: userData.name || userData.email,
    });
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