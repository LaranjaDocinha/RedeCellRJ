import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../contexts/NotificationContext';

interface UseBarcodeScannerOptions {
  onBarcodeScanned: (barcode: string) => void;
  // Threshold to differentiate between typing and scanning
  scanTimeout?: number; 
  // Optional: elements to ignore keydown events from (e.g., input fields where user is typing)
  ignoreTags?: string[];
  // Optional: function to determine if scanning should be active (e.g., based on modal open state)
  isScanActive?: () => boolean; 
}

export const useBarcodeScanner = ({
  onBarcodeScanned,
  scanTimeout = 150, // Default timeout for barcode input
  ignoreTags = ['INPUT', 'TEXTAREA', 'SELECT'],
  isScanActive = () => true, // Default to always active
}: UseBarcodeScannerOptions) => {
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotification();
  const { t } = useTranslation();

  const handleBufferReset = useCallback(() => {
    setBarcodeBuffer('');
    setIsScanning(false);
    if (barcodeBuffer.length > 0) { // Only show timeout if something was buffered
      addNotification(t('barcode_scan_timeout'), 'info');
    }
  }, [addNotification, t, barcodeBuffer.length]); // Added barcodeBuffer.length to dependencies

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If scanning is not active based on custom logic, or if a modal is open
      if (!isScanActive() || ignoreTags.includes(event.target instanceof HTMLElement ? event.target.tagName : '')) {
        return;
      }

      // If Enter is pressed and there's content in the buffer, it's a barcode scan
      if (event.key === 'Enter' && barcodeBuffer.length > 0) {
        event.preventDefault(); // Prevent form submission or other default behavior
        setIsScanning(false);
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
          barcodeTimeoutRef.current = null;
        }
        onBarcodeScanned(barcodeBuffer);
        setBarcodeBuffer(''); // Clear buffer after successful scan
        return;
      }

      // If a character key is pressed, append to buffer
      // Ensure it's a single character and not a modifier key combination
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setBarcodeBuffer((prev) => prev + event.key);
        setIsScanning(true);

        // Reset timeout to clear buffer if no more input
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }
        barcodeTimeoutRef.current = setTimeout(handleBufferReset, scanTimeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [
    barcodeBuffer,
    onBarcodeScanned,
    scanTimeout,
    ignoreTags,
    isScanActive,
    handleBufferReset,
    addNotification, // Included to ensure handleBufferReset's dependency is covered
    t, // Included for handleBufferReset's dependency
  ]);

  return { isScanning };
};
