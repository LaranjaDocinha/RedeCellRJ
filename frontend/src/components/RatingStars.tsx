import React from 'react';
import { Rating as MuiRating, Box, Typography } from '@mui/material';

export interface RatingStarsProps {
  value: number;
  onChange?: (newValue: number | null) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  precision?: 0.5 | 1;
  showValue?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'medium',
  precision = 0.5,
  showValue = false,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <MuiRating
        name="product-rating"
        value={value}
        onChange={(event, newValue) => {
          if (onChange) {
            onChange(newValue);
          }
        }}
        readOnly={readOnly}
        size={size}
        precision={precision}
      />
      {showValue && (
        <Typography sx={{ ml: 1 }}>
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};