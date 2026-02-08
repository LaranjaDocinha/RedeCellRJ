import { render, screen, fireEvent } from '../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  it('should render label or children correctly', () => {
    render(<Button label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeDefined();

    render(<Button>Child Content</Button>);
    expect(screen.getByText('Child Content')).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading spinner and be disabled when loading prop is true', () => {
    render(<Button loading label="Loading" />);
    
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.getByLabelText(/Loading carregando/i)).toBeDefined();
  });
});