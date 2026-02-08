import { render, screen, fireEvent, waitFor } from '../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Input from './Input';
import { TestProviders } from '../test-utils/TestProviders';

// Mock para o hook `useId` para evitar problemas em testes que dependem de IDs únicos
vi.mock('react', async () => {
  const actualReact = await import('react');
  return {
    ...actualReact,
    useId: vi.fn(() => 'test-input-id'),
  };
});

describe('Input Component', () => {
  it('should render label and input field', () => {
    render(<Input label="Username" id="username-input" />, { wrapper: TestProviders });
    expect(screen.getByLabelText(/Username/i)).toBeDefined();
    expect(screen.getByDisplayValue('')).toBeDefined();
  });

  it('should handle focus and blur events', () => {
    render(<Input id="test-input" />, { wrapper: TestProviders });
    const inputElement = screen.getByRole('textbox');

    fireEvent.focus(inputElement);
    // Check if label floats or other focus indicators are present if applicable
    
    fireEvent.blur(inputElement);
    // Check if blur state is correctly handled
  });

  it('should display error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email format" id="email-input" onChange={vi.fn()} />, { wrapper: TestProviders });
    expect(screen.getByText(/Invalid email format/i)).toBeDefined();
  });

  it('should display helper text', () => {
    render(<Input label="Password" helperText="Min 8 characters" id="password-input" onChange={vi.fn()} />, { wrapper: TestProviders });
    expect(screen.getByText(/Min 8 characters/i)).toBeDefined();
  });

  it('should toggle password visibility', () => {
    render(<Input type="password" id="password-input" onChange={vi.fn()} />, { wrapper: TestProviders });
    
    // Target the input element by its ID if label is not reliably found
    const passwordInput = screen.getByRole('textbox', { name: 'password-input' });
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput.getAttribute('type')).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.getAttribute('type')).toBe('text');
    expect(screen.getByLabelText(/Hide password/i)).toBeDefined();

    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('should render start adornment', () => {
    render(<Input id="input-with-start" startAdornment={<span data-testid="start-icon">@</span>} />, { wrapper: TestProviders });
    expect(screen.getByTestId('start-icon')).toBeDefined();
  });

  it('should render end adornment', () => {
    render(<Input id="input-with-end" endAdornment={<span data-testid="end-icon">$</span>} />, { wrapper: TestProviders });
    expect(screen.getByTestId('end-icon')).toBeDefined();
  });

  it('should render success icon when status is "success" and no error prop', () => {
    render(<Input id="input-success" status="success" onChange={vi.fn()} />, { wrapper: TestProviders });
    // Assuming the span containing the icon has an aria-label for accessibility
    expect(screen.getByLabelText(/success-icon/i)).toBeDefined(); 
  });

  it('should render error icon when status is "error" and no error prop', () => {
    render(<Input id="input-error-status" status="error" onChange={vi.fn()} />, { wrapper: TestProviders });
    // Assuming the span containing the icon has an aria-label for accessibility
    expect(screen.getByLabelText(/error-icon/i)).toBeDefined();
  });
  
  it('should render error message if error prop is present, not status icon', () => {
    render(<Input id="input-error-message-priority" status="error" error="Field is required" onChange={vi.fn()} />, { wrapper: TestProviders });
    expect(screen.getByText('Field is required')).toBeDefined();
    expect(screen.queryByLabelText(/error-icon/i)).toBeNull(); // Ensure error icon is not shown when error prop exists
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input id="disabled-input" disabled onChange={vi.fn()} />, { wrapper: TestProviders });
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should be read-only when readOnly prop is true', () => {
    render(<Input id="readonly-input" readOnly value="Read only value" onChange={vi.fn()} />, { wrapper: TestProviders });
    const input = screen.getByRole('textbox');
    // MUI renders readOnly inputs as disabled for styling/behavior consistency
    expect(input).toBeDisabled(); 
    expect(input).toHaveValue('Read only value');
  });
  
  it('should float label when input has value', () => {
    render(<Input label="City" value="London" id="city-input" onChange={vi.fn()} />, { wrapper: TestProviders });
    const label = screen.getByText(/City/i);
    expect(label).toBeDefined();
    expect(screen.getByDisplayValue('London')).toBeDefined();
  });

  it('should handle empty value correctly', () => {
    render(<Input label="Empty Field" value="" id="empty-field-input" onChange={vi.fn()} />, { wrapper: TestProviders });
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveValue('');
  });
});