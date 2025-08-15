import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // O Zustand não fornece um hook reativo para `hasHydrated`, então usamos um estado local
  // para forçar a re-renderização quando a hidratação terminar.
  const [isHydrated, setIsHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Check hydration status on mount
    if (!isHydrated) {
      const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [isHydrated]);

  // Enquanto o store não estiver hidratado, exibe um spinner.
  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size={50} />
      </div>
    );
  }

  // Após a hidratação, se não estiver autenticado, redireciona.
  if (!isAuthenticated()) {
    return <Navigate replace to="/login" />;
  }

  // Se estiver hidratado e autenticado, mostra o conteúdo protegido.
  return <Outlet />;
};

export default ProtectedRoute;
