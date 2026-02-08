import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

interface AuthContextData {
  signed: boolean;
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await authService.getUser();
        const token = await authService.getToken();

        if (storedUser && token) {
          setUser(storedUser);
        }
      } catch (error) {
        console.log('Error loading storage data', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email, password) {
    const response = await authService.login(email, password);
    setUser(response.user);
  }

  function signOut() {
    authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
