import React from 'react';
import { render, screen, fireEvent } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import Input from './Input';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Input Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Input label="Test Input" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with error', async () => {
    const { container } = render(<Input label="Test Input" error="Error message" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with helper text', async () => {
    const { container } = render(<Input label="Test Input" helperText="Helper text" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with adornments', async () => {
    const ExampleIcon = <svg data-testid="adornment-icon" />;
    const { container } = render(
      <Input label="Test Input" startAdornment={ExampleIcon} endAdornment={ExampleIcon} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Input Floating Label', () => {
  it('label should float when input is focused', () => {
    render(<Input label="Floating Label" />);
    const input = screen.getByLabelText(/floating label/i);
    const label = screen.getByText(/floating label/i);

    // Initial state: label should not be floated (check for initial transform/position)
    // This requires inspecting computed styles, which is harder in JSDOM.
    // For now, we'll focus on the state change.

    fireEvent.focus(input);
    // After focus, the label should have the floating styles.
    // This is a visual test, but we can check for a prop change if the styled component exposes it.
    // For now, we'll assume the visual change is handled by styled-components based on isFocused prop.
    // A more robust test would involve snapshot testing or checking computed styles.
    expect(label).toHaveStyle('transform: translateY(-160%) scale(0.75)'); // Assuming this is the floating style
  });

  it('label should float when input has a value', () => {
    render(<Input label="Floating Label" value="some value" onChange={() => {}} />);
    const label = screen.getByText(/floating label/i);
    expect(label).toHaveStyle('transform: translateY(-160%) scale(0.75)'); // Assuming this is the floating style
  });

  it('label should return to initial position when input loses focus and is empty', () => {
    render(<Input label="Floating Label" />);
    const input = screen.getByLabelText(/floating label/i);
    const label = screen.getByText(/floating label/i);

    fireEvent.focus(input);
    fireEvent.blur(input); // Lose focus
    // After blur and empty, label should be in initial position
    expect(label).not.toHaveStyle('transform: translateY(-150%) scale(0.75)'); // Assuming this is the floating style
  });
});

describe('Input Adornments', () => {
  const StartIcon = <svg data-testid="start-adornment-icon" />;
  const EndIcon = <svg data-testid="end-adornment-icon" />;

  it('should render start and end adornments', () => {
    render(<Input label="Adorned Input" startAdornment={StartIcon} endAdornment={EndIcon} />);
    expect(screen.getByTestId('start-adornment-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-adornment-icon')).toBeInTheDocument();
  });

  it('should apply aria-hidden="true" to adornments by default', () => {
    render(<Input label="Adorned Input" startAdornment={StartIcon} endAdornment={EndIcon} />);
    expect(screen.getByTestId('start-adornment-icon').closest('span')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByTestId('end-adornment-icon').closest('span')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('should apply aria-label to adornments when provided', () => {
    render(
      <Input
        label="Adorned Input"
        startAdornment={StartIcon}
        startAdornmentAriaLabel="Search icon"
        endAdornment={EndIcon}
        endAdornmentAriaLabel="Clear input"
      />,
    );
    expect(screen.getByLabelText('Search icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
    expect(screen.getByLabelText('Search icon').closest('span')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByLabelText('Clear input').closest('span')).not.toHaveAttribute('aria-hidden');
  });
});

describe('Input Interactions', () => {
  it('should call onChange handler when input value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Test Input" onChange={handleChange} />);
    const input = screen.getByLabelText(/test input/i);
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object)); // Event object
  });
});
