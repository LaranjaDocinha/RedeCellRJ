import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceOrdersPage from './ServiceOrdersPage';
import React from 'react';

// Mock minimalista de contextos
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token', user: { id: '1', name: 'Admin' } }),
}));

vi.mock('../contexts/NotificationContext', () => ({
  useNotification: () => ({ addNotification: vi.fn() }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock de UI
vi.mock('../components/ServiceOrderForm', () => ({ default: () => <div data-testid="so-form" /> }));
vi.mock('../components/PageTransition', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('../components/ErrorBoundary', () => ({ default: ({ children }: any) => <div>{children}</div> }));

describe('ServiceOrdersPage Direct Data Test', () => {
  const mockOrders = [
    { 
      id: 1, 
      customer_name: 'John Tech', 
      product_description: 'iPhone 13', 
      status: 'Aguardando Avaliação', // Status que aparece na aba padrão (Triagem)
      updated_at: new Date().toISOString(),
      estimated_cost: 500,
      customer_phone: '123456'
    }
  ];

  it('should render and show injected order data in triage tab', () => {
    render(<ServiceOrdersPage initialOrders={mockOrders} />);
    
    expect(screen.getByText(/Centro Técnico/i)).toBeDefined();
    
    // Na aba Triagem (padrão), John Tech deve aparecer
    expect(screen.getByText(/John Tech/i)).toBeDefined();
    expect(screen.getByText(/Aguardando Avaliação/i)).toBeDefined();
  });

  it('should open modal on button click', () => {
    render(<ServiceOrdersPage initialOrders={mockOrders} />);
    const btn = screen.getByText(/Receber Aparelho/i);
    fireEvent.click(btn);
    expect(screen.getByTestId('so-form')).toBeDefined();
  });
});
