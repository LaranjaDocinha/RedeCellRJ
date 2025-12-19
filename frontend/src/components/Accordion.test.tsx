import React from 'react';
import { render, screen, waitFor } from '../test-utils/test-utils';
import { Accordion } from './Accordion';
import { axe } from 'jest-axe';
import { TestProviders } from '../test-utils/TestProviders';

describe('Accordion', () => {
  it('renders accordion', () => {
    render(<TestProviders><Accordion title="Section 1">Content 1</Accordion></TestProviders>); // Wrapped with TestProviders
    expect(screen.getByText('Section 1')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TestProviders><Accordion title="Section 1">Content 1</Accordion></TestProviders> // Wrapped with TestProviders
    );
    // Wait for any potential async state updates (e.g., from context providers)
    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});