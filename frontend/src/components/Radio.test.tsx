import React from 'react';
import { render, screen, fireEvent } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import Radio from './Radio';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Radio Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Radio label="Test Radio" name="test-group" checked={false} onChange={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when checked', async () => {
    const { container } = render(<Radio label="Test Radio" name="test-group" checked={true} onChange={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with error', async () => {
    const { container } = render(<Radio label="Test Radio" name="test-group" checked={false} onChange={() => {}} error="Error message" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when disabled', async () => {
    const { container } = render(<Radio label="Test Radio" name="test-group" checked={false} onChange={() => {}} disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Radio Basic Rendering and States', () => {
  it('should render radio with label and name', () => {
    render(<Radio label="Option A" name="my-options" checked={false} onChange={() => {}} />);
    expect(screen.getByLabelText(/option a/i)).toBeInTheDocument();
    expect(screen.getByRole('radio')).not.toBeChecked();
    expect(screen.getByRole('radio')).toHaveAttribute('name', 'my-options');
  });

  it('should be checked when checked prop is true', () => {
    render(<Radio label="Option B" name="my-options" checked={true} onChange={() => {}} />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Radio label="Disabled option" name="my-options" checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    render(<Radio label="Required" name="my-options" checked={false} onChange={() => {}} error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    expect(screen.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Radio Interactions', () => {
  it('should call onChange handler when clicked', () => {
    const handleChange = vi.fn();
    render(<Radio label="Select me" name="my-options" checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText(/select me/i));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange handler when disabled', () => {
    const handleChange = vi.fn();
    render(<Radio label="Disabled select" name="my-options" checked={false} onChange={handleChange} disabled />);
    fireEvent.click(screen.getByLabelText(/disabled select/i));
    expect(handleChange).not.toHaveBeenCalled();
  });
});