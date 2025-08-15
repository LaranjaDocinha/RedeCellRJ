import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner'; // Supondo que você tenha um spinner

const AuthGate = ({ children }) => {
  const { isHydrated, setHydrated } = useAuthStore((state) => ({
    isHydrated: state.isHydrated,
    setHydrated: state.setHydrated,
  }));

  useEffect(() => {
    // A reidratação acontece no middleware do Zustand, mas precisamos de um gatilho inicial.
    // Esta é uma forma de garantir que o estado de hidratação seja verificado na montagem.
    // O `onRehydrateStorage` no store fará o trabalho pesado.
    // Se o estado já foi reidratado (por exemplo, navegação entre páginas), não faz nada.
    if (!useAuthStore.persist.hasHydrated()) {
      // Força a reidratação se ainda não aconteceu.
      // O listener `onRehydrateStorage` no store chamará `setHydrated`.
      useAuthStore.persist.rehydrate();
    } else if (!isHydrated) {
      // Se o `persist` já hidratou mas nosso estado `isHydrated` não foi setado, seta agora.
      setHydrated();
    }
  }, [isHydrated, setHydrated]);

  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size={50} />
        <p style={{ marginLeft: '1rem' }}>Carregando aplicação...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
