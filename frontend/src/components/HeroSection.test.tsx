import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

test('renders hero section', () => {
  render(<HeroSection title="Title" subtitle="Subtitle" imageUrl="" />);
  expect(screen.getByText('Title')).toBeInTheDocument();
});
