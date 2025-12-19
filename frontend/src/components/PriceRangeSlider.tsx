import React, { useState, useEffect } from 'react';
import { Slider, Box, Typography } from '@mui/material';

export interface PriceRangeSliderProps {
  min: number;
  max: number;
  onChange: (value: number[]) => void;
  title?: string;
}

function valuetext(value: number) {
  return `R$${value}`;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  onChange,
  title = "Faixa de Preço",
}) => {
  const [value, setValue] = useState<number[]>([min, max]);

  useEffect(() => {
    setValue([min, max]);
  }, [min, max]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
    onChange(newValue as number[]);
  };

  return (
    <Box sx={{ width: 300 }}>
      <Typography gutterBottom>{title}</Typography>
      <Slider
        getAriaLabel={() => 'Price range'}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        min={min}
        max={max}
        valueLabelFormat={valuetext}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">R$ {value[0]}</Typography>
        <Typography variant="body2">R$ {value[1]}</Typography>
      </Box>
    </Box>
  );
};