import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CanvasDraw from 'react-canvas-draw';
import { useTranslation } from 'react-i18next';

interface DeviceCheckInCanvasProps {
  initialData?: string;
  onChange?: (data: string) => void;
  readOnly?: boolean;
}

const DeviceCheckInCanvas: React.FC<DeviceCheckInCanvasProps> = ({ initialData, onChange, readOnly = false }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<any>(null);
  
  // Background image of a generic smartphone (front and back)
  // You should replace this URL with a local asset or a reliable CDN link
  const bgImage = "https://i.imgur.com/5Z1Z1Z1.png"; // Placeholder

  useEffect(() => {
    if (initialData && canvasRef.current) {
      canvasRef.current.loadSaveData(initialData, true);
    }
  }, [initialData]);

  const handleSave = () => {
    if (canvasRef.current && onChange) {
      const data = canvasRef.current.getSaveData();
      onChange(data);
    }
  };

  const handleClear = () => {
    if (canvasRef.current && !readOnly) {
      canvasRef.current.clear();
      if (onChange) onChange('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Typography variant="subtitle2">{t('device_condition_check_in')}</Typography>
      <Box sx={{ border: '1px solid #ccc', position: 'relative' }}>
        <CanvasDraw
          ref={canvasRef}
          brushColor="#ff0000"
          brushRadius={2}
          lazyRadius={0}
          canvasWidth={400}
          canvasHeight={300}
          imgSrc={bgImage}
          disabled={readOnly}
          onChange={readOnly ? undefined : handleSave} // Auto-save on change if not readOnly
        />
      </Box>
      {!readOnly && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={handleClear} variant="outlined" color="error">
            {t('clear')}
          </Button>
          <Button size="small" onClick={() => canvasRef.current?.undo()} variant="outlined">
            {t('undo')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeviceCheckInCanvas;
