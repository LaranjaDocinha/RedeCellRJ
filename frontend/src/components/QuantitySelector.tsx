import React, { useState, useEffect } from 'react';
import { IconButton, TextField, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export interface QuantitySelectorProps {
  max: number;
  initialValue?: number;
  onChange: (quantity: number) => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  max,
  initialValue = 1,
  onChange,
}) => {
  const [quantity, setQuantity] = useState(initialValue);



  const handleIncrement = () => {
    const newQuantity = Math.min(quantity + 1, max);
    if (newQuantity !== quantity) {
      setQuantity(newQuantity);
      onChange(newQuantity);
    }
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(quantity - 1, 1);
    if (newQuantity !== quantity) {
      setQuantity(newQuantity);
      onChange(newQuantity);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
      <IconButton onClick={handleDecrement} disabled={quantity <= 1} aria-label="Remover item" data-testid="decrement-button">
        <RemoveIcon />
      </IconButton>
      <TextField
        value={quantity}
        InputProps={{
          readOnly: true,
          sx: {
            '& input': {
              textAlign: 'center',
              width: '40px',
              padding: '8px 0',
            },
            '& fieldset': {
              border: 'none',
            },
          },
        }}
      />
      <IconButton onClick={handleIncrement} disabled={quantity >= max} aria-label="Adicionar item" data-testid="increment-button">
        <AddIcon />
      </IconButton>
    </Box>
  );
};