import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter, Category } from './CategoryFilter';
import { vi } from 'vitest';

describe('CategoryFilter', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Electronics', count: 10 },
    { id: '2', name: 'Books', count: 5 },
    { id: '3', name: 'Clothing', count: 0 },
  ];
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders category filter', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
      />,
    );
    expect(screen.getByText(/Electronics \(10\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Books \(5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Clothing \(0\)/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when a category is clicked', async () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
      />,
    );
    await userEvent.click(screen.getByText(/Electronics \(10\)/i));
    expect(mockOnFilterChange).toHaveBeenCalledWith('1');
  });

  it('deselects a category when clicked again', async () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
      />,
    );
    await userEvent.click(screen.getByText(/Electronics \(10\)/i)); // Select
    await userEvent.click(screen.getByText(/Electronics \(10\)/i)); // Deselect
    expect(mockOnFilterChange).toHaveBeenCalledWith(null);
  });

  it('disables chip when category count is 0', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
      />,
    );
    expect(screen.getByRole('button', { name: /Clothing \(0\)/i })).toHaveClass('Mui-disabled');
  });
});
