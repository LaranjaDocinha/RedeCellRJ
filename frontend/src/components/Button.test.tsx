
import React from 'react';
import { render, screen } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Button label="Test Button" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations for a disabled button', async () => {
    const { container } = render(<Button label="Disabled Button" disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations for an outlined button', async () => {
    const { container } = render(<Button label="Outlined Button" variant="outlined" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations for a text button', async () => {
    const { container } = render(<Button label="Text Button" variant="text" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
