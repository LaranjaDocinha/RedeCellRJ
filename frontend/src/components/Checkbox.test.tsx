import React from 'react';
import { render, screen, fireEvent } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import Checkbox from './Checkbox';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Checkbox Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <Checkbox label="Test Checkbox" checked={false} onChange={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when checked', async () => {
    const { container } = render(
      <Checkbox label="Test Checkbox" checked={true} onChange={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with error', async () => {
    const { container } = render(
      <Checkbox label="Test Checkbox" checked={false} onChange={() => {}} error="Error message" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when disabled', async () => {
    const { container } = render(
      <Checkbox label="Test Checkbox" checked={false} onChange={() => {}} disabled />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Checkbox Basic Rendering and States', () => {
  it('should render checkbox with label', () => {
    render(<Checkbox label="Remember me" checked={false} onChange={() => {}} />);
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('should be checked when checked prop is true', () => {
    render(<Checkbox label="Accept terms" checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox label="Disabled option" checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    render(
      <Checkbox
        label="Required"
        checked={false}
        onChange={() => {}}
        error="This field is required"
      />,
    );
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Checkbox Interactions', () => {
  it('should call onChange handler when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Toggle me" checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText(/toggle me/i));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange handler when disabled', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Disabled toggle" checked={false} onChange={handleChange} disabled />);
    fireEvent.click(screen.getByLabelText(/disabled toggle/i));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
