import React from 'react';
import { render, screen } from '@testing-library/react';
import { Snackbar } from './Snackbar';

test('renders snackbar when open', () => {
  render(<Snackbar open={true} message="Test" onClose={() => {}} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
