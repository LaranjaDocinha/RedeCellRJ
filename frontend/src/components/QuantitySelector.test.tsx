import React from 'react';
import { render, screen } from '../test-utils/TestWrapper';
import userEvent from '@testing-library/user-event';
import { QuantitySelector } from './QuantitySelector';
import { vi } from 'vitest';

describe('QuantitySelector', () => {
  it('renders correctly with initial value', () => {
    render(<QuantitySelector max={10} initialValue={5} onChange={() => {}} />);
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('increments quantity on + button click', async () => {
    const handleChange = vi.fn();
    render(<QuantitySelector max={10} initialValue={5} onChange={handleChange} />);
    const incrementButton = screen.getByTestId('increment-button');
    await userEvent.click(incrementButton);

    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith(6);
  });

  it('decrements quantity on - button click', async () => {
    const handleChange = vi.fn();
    render(<QuantitySelector max={10} initialValue={5} onChange={handleChange} />);
    
    const decrementButton = screen.getByTestId('decrement-button');
    await userEvent.click(decrementButton);

    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('does not increment beyond max value', async () => {
    const handleChange = vi.fn();
    render(<QuantitySelector max={10} initialValue={10} onChange={handleChange} />);
    
    const incrementButton = screen.getByTestId('increment-button');
    expect(incrementButton).toBeDisabled();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not decrement below 1', async () => {
    const handleChange = vi.fn();
    render(<QuantitySelector max={10} initialValue={1} onChange={handleChange} />);
    
    const decrementButton = screen.getByRole('button', { name: /remove/i });
    expect(decrementButton).toBeDisabled();
    expect(handleChange).not.toHaveBeenCalled();
  });
});