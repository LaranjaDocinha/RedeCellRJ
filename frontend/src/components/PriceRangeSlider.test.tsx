import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriceRangeSlider } from './PriceRangeSlider';

test('renders price range slider', () => {
  render(<PriceRangeSlider min={0} max={100} onChange={() => {}} />);
  expect(screen.getByText(/Faixa de Preço/i)).toBeInTheDocument();
});
