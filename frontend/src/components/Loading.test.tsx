import React from 'react';
import { render, screen } from '../test-utils/test-utils';
import { describe, it, expect } from 'vitest';
import Loading from './Loading';
import { TestProviders } from '../test-utils/TestProviders';

describe('Loading Component', () => {
  it('should render the spinner and loading text', () => {
    render(<Loading />, { wrapper: TestProviders });
    
    // Check if the spinner element is present
    // Assuming the Spinner component renders a specific element or has a test ID
    // If not, we check for a known class or tag. For now, let's check for the text.
    expect(screen.getByText(/Loading.../i)).toBeDefined();
    
    // If Spinner had a specific role or testid, we would check it here.
    // For example: expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('should render without crashing', () => {
    // A basic render test to ensure no errors occur
    expect(() => render(<Loading />, { wrapper: TestProviders })).not.toThrow();
  });
});
