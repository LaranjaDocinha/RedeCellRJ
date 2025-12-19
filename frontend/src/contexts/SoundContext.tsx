// frontend/src/contexts/SoundContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type SoundName = 'addToCart' | 'removeFromCart' | 'checkoutSuccess' | 'error' | 'notification' | 'buttonClick'; // Define specific sound names

interface SoundContextType {
  playSound: (name: SoundName) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

interface SoundProviderProps {
  children: ReactNode;
}

// Define sound file paths. These should be actual paths to your sound assets.
const soundFiles: Record<SoundName, string> = {
  addToCart: '/sounds/add-to-cart.mp3',
  removeFromCart: '/sounds/remove-from-cart.mp3',
  checkoutSuccess: '/sounds/checkout-success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3',
  buttonClick: '/sounds/button-click.mp3',
};

// Store Audio objects to prevent re-creation for each play
const audioPlayers: Partial<Record<SoundName, HTMLAudioElement>> = {};

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const savedPreference = localStorage.getItem('isSoundEnabled');
    return savedPreference ? JSON.parse(savedPreference) : true; // Default to true
  });

  // Load sounds on mount
  useEffect(() => {
    for (const name in soundFiles) {
      if (Object.prototype.hasOwnProperty.call(soundFiles, name)) {
        audioPlayers[name as SoundName] = new Audio(soundFiles[name as SoundName]);
      }
    }
  }, []); // Run only once on component mount to load all sounds

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem('isSoundEnabled', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const playSound = useCallback((name: SoundName) => {
    if (isSoundEnabled && audioPlayers[name]) {
      audioPlayers[name]!.play().catch(error => console.error("Error playing sound:", error));
    }
  }, [isSoundEnabled]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};
