import React from 'react';
import { render, screen, fireEvent } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import Switch from './Switch';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Switch Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Switch label="Test Switch" checked={false} onChange={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when checked', async () => {
    const { container } = render(<Switch label="Test Switch" checked={true} onChange={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with error', async () => {
    const { container } = render(<Switch label="Test Switch" checked={false} onChange={() => {}} error="Error message" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when disabled', async () => {
    const { container } = render(<Switch label="Test Switch" checked={false} onChange={() => {}} disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Switch Basic Rendering and States', () => {
  it('should render switch with label', () => {
    render(<Switch label="Enable feature" checked={false} onChange={() => {}} />);
    expect(screen.getByLabelText(/enable feature/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked(); // Switch é semanticamente um checkbox
  });

  it('should be checked when checked prop is true', () => {
    render(<Switch label="Enable feature" checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Switch label="Disabled feature" checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    render(<Switch label="Required" checked={false} onChange={() => {}} error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Switch Interactions', () => {
  it('should call onChange handler when clicked', () => {
    const handleChange = vi.fn();
    render(<Switch label="Toggle me" checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText(/toggle me/i));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange handler when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch label="Disabled toggle" checked={false} onChange={handleChange} disabled />);
    fireEvent.click(screen.getByLabelText(/disabled toggle/i));
    expect(handleChange).not.toHaveBeenCalled();
  });
});