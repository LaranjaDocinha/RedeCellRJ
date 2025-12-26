import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface InactivityTrackerContextType {
  isLocked: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
}

const InactivityTrackerContext = createContext<InactivityTrackerContextType | undefined>(undefined);

export const useInactivityTracker = () => {
  const context = useContext(InactivityTrackerContext);
  if (!context) throw new Error('useInactivityTracker must be used within InactivityTrackerProvider');
  return context;
};

export const InactivityTrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutos por padrão

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback((pin: string) => {
    if (pin === '1234') { // Mock PIN para o protótipo
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      if (!isLocked) {
        timer = setTimeout(lock, INACTIVITY_LIMIT);
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timer);
    };
  }, [isLocked, lock]);

  return (
    <InactivityTrackerContext.Provider value={{ isLocked, unlock, lock }}>
      {children}
    </InactivityTrackerContext.Provider>
  );
};