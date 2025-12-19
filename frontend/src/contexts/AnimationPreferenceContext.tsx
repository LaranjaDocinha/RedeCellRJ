import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnimationPreferenceContextType {
  prefersReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const AnimationPreferenceContext = createContext<AnimationPreferenceContextType | undefined>(undefined);

interface AnimationPreferenceProviderProps {
  children: ReactNode;
}

export const AnimationPreferenceProvider: React.FC<AnimationPreferenceProviderProps> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleReducedMotion = () => {
    // Forçar a preferência do usuário, sobrescrevendo a detecção do sistema
    setPrefersReducedMotion(prev => !prev);
    // Em um cenário real, você poderia salvar essa preferência no localStorage
  };

  return (
    <AnimationPreferenceContext.Provider value={{ prefersReducedMotion, toggleReducedMotion }}>
      {children}
    </AnimationPreferenceContext.Provider>
  );
};

export const useAnimationPreference = () => {
  const context = useContext(AnimationPreferenceContext);
  if (context === undefined) {
    throw new Error('useAnimationPreference must be used within an AnimationPreferenceProvider');
  }
  return context;
};
