import { render, screen, fireEvent } from '../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';
import { MemoryRouter } from 'react-router-dom';

describe('Sidebar Component', () => {
  const defaultProps = {
    isOpen: true,
    isCompact: false,
    onClose: vi.fn(),
  };

  it('should render all nav groups and items when not compact', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Vendas')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Ponto de Venda')).toBeDefined();
  });

  it('should filter items based on search input', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Pesquisar...');
    fireEvent.change(searchInput, { target: { value: 'Ponto' } });

    expect(screen.queryByText('Dashboard')).toBeNull();
    expect(screen.getByText('Ponto de Venda')).toBeDefined();
  });

  it('should hide labels and titles when compact', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isCompact={true} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Vendas')).toBeNull();
    expect(screen.queryByText('Dashboard')).toBeNull();
    // In compact mode, labels are hidden from the text content but icons remain
  });
});
