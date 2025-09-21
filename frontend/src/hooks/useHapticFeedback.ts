
import { useCallback } from 'react';

/**
 * Custom hook for triggering haptic feedback (vibration) on supported devices.
 * Uses the Web Haptics API (navigator.vibrate).
 */
const useHapticFeedback = () => {
  const triggerHapticFeedback = useCallback((pattern: VibratePattern = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    } else {
      console.warn('Haptic feedback not supported on this device.');
    }
  }, []);

  return triggerHapticFeedback;
};

export default useHapticFeedback;
