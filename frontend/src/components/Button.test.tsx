import React from 'react';
import { render } from '@testing-library/react';
import { Button } from './Button';
import { toHaveNoViolations } from 'jest-axe';
import { axe } from 'jest-axe';

// Adiciona toHaveNoViolations ao expect do Vitest
expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Button label="Test Button" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when disabled', async () => {
    const { container } = render(<Button label="Disabled Button" disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when loading', async () => {
    const { container } = render(<Button label="Loading Button" loading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});