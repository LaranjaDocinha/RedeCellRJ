
import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TextField
        variant="outlined"
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="input"
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                  width: 28,
                  height: 28,
                  border: 'none',
                  padding: 0,
                  marginRight: 1,
                  background: 'none',
                  cursor: 'pointer',
                  '&::-webkit-color-swatch-wrapper': {
                    padding: 0,
                  },
                  '&::-webkit-color-swatch': {
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  },
                }}
              />
            </InputAdornment>
          ),
        }}
        sx={{ width: 150 }}
      />
    </Box>
  );
};
