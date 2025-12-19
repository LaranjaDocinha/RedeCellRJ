import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

test('renders product card skeleton', () => {
  render(<ProductCardSkeleton />);
  // A simple test to check if one of the skeleton elements is rendered
  expect(screen.getAllByTestId('skeleton-element')).not.toBeNull();
});
