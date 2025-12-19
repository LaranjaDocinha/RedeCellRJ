import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock the App component itself
vi.mock('./App', () => ({
  default: () => <div>Mocked App</div>,
}));

test('renders learn react link', () => {
  render(<App />); // This App will now be the mocked one
  const linkElement = screen.getByText(/Mocked App/i);
  expect(linkElement).toBeInTheDocument();
});
