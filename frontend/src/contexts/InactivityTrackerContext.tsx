import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { InactivityModal } from '../components/ui/InactivityModal';

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
  const { isAuthenticated, logout } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutos para aviso
  const WARNING_DURATION = 60 * 1000; // 1 minuto de aviso
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback((pin: string) => {
    if (pin === '1234') { // Mock PIN
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  const handleLogout = useCallback(() => {
      setShowWarning(false);
      logout();
      window.location.href = '/login?reason=inactivity';
  }, [logout]);

  const startCountdown = useCallback(() => {
      setCountdown(60);
      setShowWarning(true);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      countdownRef.current = setInterval(() => {
          setCountdown(prev => {
              if (prev <= 1) {
                  clearInterval(countdownRef.current!);
                  handleLogout();
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  }, [handleLogout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setShowWarning(false);
    
    if (isAuthenticated && !isLocked) {
        timerRef.current = setTimeout(startCountdown, INACTIVITY_LIMIT);
    }
  }, [isAuthenticated, isLocked, startCountdown]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'mousemove', 'scroll'];
    const throttledReset = () => {
        // Simple throttle to avoid too many calls
        resetTimer();
    };

    events.forEach(event => window.addEventListener(event, throttledReset));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, throttledReset));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer]);

  return (
    <InactivityTrackerContext.Provider value={{ isLocked, unlock, lock }}>
      {children}
      <InactivityModal 
        open={showWarning} 
        onStay={resetTimer} 
        countdown={countdown} 
      />
    </InactivityTrackerContext.Provider>
  );
};
