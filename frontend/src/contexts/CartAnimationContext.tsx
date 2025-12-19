import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface AnimationState {
  animating: boolean;
  imageUrl?: string;
  startRect?: DOMRect;
}

interface AnimationContextType {
  animationState: AnimationState;
  startAnimation: (imageUrl: string, startRect: DOMRect) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animationState, setAnimationState] = useState<AnimationState>({ animating: false });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = (imageUrl: string, startRect: DOMRect) => {
    // Clear any existing timer before starting a new one
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAnimationState({ animating: true, imageUrl, startRect });
    timerRef.current = setTimeout(() => {
      setAnimationState({ animating: false });
      timerRef.current = null;
    }, 1000); // Adjust duration
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ animationState, startAnimation }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useCartAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useCartAnimation must be used within an AnimationProvider');
  }
  return context;
};
