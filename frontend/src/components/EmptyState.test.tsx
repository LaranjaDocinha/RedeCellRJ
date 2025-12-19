import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

test('renders empty state', () => {
  render(<EmptyState title="Nothing Found" message="Try a different search" />);
  expect(screen.getByText('Nothing Found')).toBeInTheDocument();
  expect(screen.getByText('Try a different search')).toBeInTheDocument();
});
