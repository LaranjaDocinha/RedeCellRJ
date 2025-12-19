import React from 'react';
import { render, screen } from '@testing-library/react';
import { RatingStars } from './RatingStars';

test('renders rating stars correctly', () => {
  render(<RatingStars value={3} />);
  // MuiRating renders radio buttons for accessibility
  const radioButtons = screen.getAllByRole('radio');
  expect(radioButtons.length).toBe(11); // 5 stars with 0.5 precision + 1 empty radio button
  expect(screen.getByRole('radio', { name: '3 Stars' })).toBeChecked();
});
