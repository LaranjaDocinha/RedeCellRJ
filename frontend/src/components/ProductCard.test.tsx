import { render, screen, fireEvent } from '../test-utils/test-utils';
import { ProductCard } from './ProductCard';
import { vi } from 'vitest';
import { TestProviders } from '../test-utils/TestProviders';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    imageUrl: 'test-image.jpg',
    name: 'Test Product',
    price: 10.00,
    rating: 4.5,
    onAddToCart: vi.fn(),
  };

  it('renders product card', () => {
    render(
      <TestProviders><ProductCard {...mockProduct} /></TestProviders> // Wrapped with TestProviders
    );
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 10.00/i)).toBeInTheDocument();
    expect(screen.getByText(/⭐ 4.5/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Test Product/i })).toHaveAttribute('src', 'test-image.jpg');
  });

  it('calls onAddToCart when "Adicionar ao Carrinho" button is clicked', async () => {
    render(
      <TestProviders><ProductCard {...mockProduct} /></TestProviders> // Wrapped with TestProviders
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Adicionar ao Carrinho/i }));
    
    expect(mockProduct.onAddToCart).toHaveBeenCalledTimes(1);
  });
});