// frontend/src/contexts/InactivityTrackerContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface InactivityTrackerContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  resetTimer: () => void;
}

const InactivityTrackerContext = createContext<InactivityTrackerContextType | undefined>(undefined);

export const useInactivityTracker = () => {
  const context = useContext(InactivityTrackerContext);
  if (!context) {
    throw new Error('useInactivityTracker must be used within an InactivityTrackerProvider');
  }
  return context;
};

interface InactivityTrackerProviderProps {
  children: ReactNode;
  timeoutMinutes?: number; // Timeout duration in minutes
}

export const InactivityTrackerProvider: React.FC<InactivityTrackerProviderProps> = ({
  children,
  timeoutMinutes = 5, // Default to 5 minutes
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isLocked) { // Only set new timeout if not already locked
      timeoutRef.current = setTimeout(() => {
        setIsLocked(true);
      }, timeoutMinutes * 60 * 1000);
    }
  }, [isLocked, timeoutMinutes]);

  const lockApp = useCallback(() => {
    setIsLocked(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    resetTimer(); // Reset timer immediately after unlocking
  }, [resetTimer]);

  useEffect(() => {
    const handleActivity = () => {
      if (!isLocked) { // Only reset timer if not locked
        resetTimer();
      }
    };

    // Attach activity listeners
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity); // Consider scroll as activity

    // Initial timer start
    resetTimer();

    return () => {
      // Clean up listeners and timer
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLocked, resetTimer]); // Depend on isLocked to re-evaluate listeners when lock state changes

  return (
    <InactivityTrackerContext.Provider value={{ isLocked, lockApp, unlockApp, resetTimer }}>
      {children}
    </InactivityTrackerContext.Provider>
  );
};
