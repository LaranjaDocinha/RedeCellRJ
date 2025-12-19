import React, { useState } from 'react';
import { render, screen, fireEvent } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import ToggleButton from './ToggleButton';
import ToggleButtonGroup from './ToggleButtonGroup';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('ToggleButtonGroup Accessibility', () => {
  it('should not have any accessibility violations for exclusive selection', async () => {
    const TestComponent = () => {
      const [value, setValue] = useState('one');
      return (
        <ToggleButtonGroup value={value} onChange={setValue} exclusive aria-label="Exclusive Group">
          <ToggleButton value="one" label="One" />
          <ToggleButton value="two" label="Two" />
        </ToggleButtonGroup>
      );
    };
    const { container } = render(<TestComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations for multiple selection', async () => {
    const TestComponent = () => {
      const [value, setValue] = useState<string[]>(['one']);
      return (
        <ToggleButtonGroup value={value} onChange={setValue} exclusive={false} aria-label="Multiple Group">
          <ToggleButton value="one" label="One" />
          <ToggleButton value="two" label="Two" />
        </ToggleButtonGroup>
      );
    };
    const { container } = render(<TestComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('ToggleButtonGroup Exclusive Selection', () => {
  it('should allow selecting only one button at a time', () => {
    const handleChange = vi.fn();
    const TestComponent = () => {
      const [value, setValue] = useState('one');
      return (
        <ToggleButtonGroup value={value} onChange={(val) => { setValue(val as string); handleChange(val); }} exclusive aria-label="Exclusive Group">
          <ToggleButton value="one" label="One" />
          <ToggleButton value="two" label="Two" />
          <ToggleButton value="three" label="Three" />
        </ToggleButtonGroup>
      );
    };
    render(<TestComponent />);

    const buttonOne = screen.getByRole('button', { name: /one/i });
    const buttonTwo = screen.getByRole('button', { name: /two/i });
    const buttonThree = screen.getByRole('button', { name: /three/i });

    expect(buttonOne).toHaveAttribute('aria-pressed', 'true');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'false');
    expect(buttonThree).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonTwo);

    expect(handleChange).toHaveBeenCalledWith('two');
    expect(buttonOne).toHaveAttribute('aria-pressed', 'false');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'true');
    expect(buttonThree).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonTwo); // Click the same button again
    expect(handleChange).toHaveBeenCalledWith(''); // Should deselect
    expect(buttonOne).toHaveAttribute('aria-pressed', 'false');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'false');
    expect(buttonThree).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ToggleButtonGroup Multiple Selection', () => {
  it('should allow selecting multiple buttons', () => {
    const handleChange = vi.fn();
    const TestComponent = () => {
      const [value, setValue] = useState<string[]>(['one']);
      return (
        <ToggleButtonGroup value={value} onChange={(val) => { setValue(val as string[]); handleChange(val); }} exclusive={false} aria-label="Multiple Group">
          <ToggleButton value="one" label="One" />
          <ToggleButton value="two" label="Two" />
          <ToggleButton value="three" label="Three" />
        </ToggleButtonGroup>
      );
    };
    render(<TestComponent />);

    const buttonOne = screen.getByRole('button', { name: /one/i });
    const buttonTwo = screen.getByRole('button', { name: /two/i });
    const buttonThree = screen.getByRole('button', { name: /three/i });

    expect(buttonOne).toHaveAttribute('aria-pressed', 'true');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'false');
    expect(buttonThree).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonTwo);

    expect(handleChange).toHaveBeenCalledWith(['one', 'two']);
    expect(buttonOne).toHaveAttribute('aria-pressed', 'true');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'true');
    expect(buttonThree).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonOne); // Deselect one
    expect(handleChange).toHaveBeenCalledWith(['two']);
    expect(buttonOne).toHaveAttribute('aria-pressed', 'false');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'true');
    expect(buttonThree).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ToggleButton Disabled State', () => {
  it('should not call onChange when a disabled button is clicked', () => {
    const handleChange = vi.fn();
    const TestComponent = () => {
      const [value, setValue] = useState('one');
      return (
        <ToggleButtonGroup value={value} onChange={(val) => { setValue(val as string); handleChange(val); }} exclusive aria-label="Disabled Group">
          <ToggleButton value="one" label="One" />
          <ToggleButton value="two" label="Two" disabled />
        </ToggleButtonGroup>
      );
    };
    render(<TestComponent />);

    const buttonTwo = screen.getByRole('button', { name: /two/i });
    expect(buttonTwo).toBeDisabled();

    fireEvent.click(buttonTwo);
    expect(handleChange).not.toHaveBeenCalled();
  });
});