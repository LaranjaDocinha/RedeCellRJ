import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

test('renders loading spinner', () => {
  render(<LoadingSpinner />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
