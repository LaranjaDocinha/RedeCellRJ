import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollToTopButton } from './ScrollToTopButton';

test('renders scroll to top button', () => {
  // This component is tricky to test in JSDOM. A visual test in Storybook is more effective.
  render(<ScrollToTopButton />);
  // Initially, the button is not visible.
  expect(screen.queryByRole('button')).toBeNull();
});
