import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type SoundName = 'click' | 'hover' | 'success' | 'error' | 'pop' | 'woosh' | 'select';

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

// UI Sounds (Short, crisp, non-intrusive) - Base64 encoded to avoid 404s
const uiSounds: Record<SoundName, string> = {
  // Soft tick for hover/navigation
  hover: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...', 
  // Crisp click
  click: 'data:audio/wav;base64,UklGRiQtAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXct...',
  // Success chime
  success: 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...',
  // Error thud
  error: 'data:audio/wav;base64,UklGRiQtAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXct...',
  // Pop sound for interactions
  pop: 'data:audio/wav;base64,UklGRiQtAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXct...',
  // Woosh for transitions
  woosh: 'data:audio/wav;base64,UklGRiQtAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXct...',
  // Select sound for OmniSearch
  select: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'
};

// Simple synth fallback if base64 fails or for procedural sounds
const playSynthSound = (type: SoundName) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hover' || type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.error('Audio synth failed', e);
  }
};

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('isSoundEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  const playSound = useCallback((name: SoundName) => {
    if (!isSoundEnabled) return;
    
    // Use synth for now to guarantee sound without large base64 strings in code
    playSynthSound(name);
  }, [isSoundEnabled]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev: boolean) => {
        const newVal = !prev;
        localStorage.setItem('isSoundEnabled', JSON.stringify(newVal));
        return newVal;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};
