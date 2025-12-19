import React from 'react';
import { render, screen } from '@testing-library/react';
import { Modal } from './Modal';

test('renders modal when open', () => {
  render(<Modal open={true} onClose={() => {}}>Test Content</Modal>);
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});