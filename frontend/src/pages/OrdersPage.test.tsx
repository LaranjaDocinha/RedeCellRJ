import React from 'react';
import { render, screen } from '@testing-library/react';
import OrdersPage from './OrdersPage';

// Mock a dependência de Styled Components, se necessário
vi.mock('./AuditLogsPage.styled', () => ({
  StyledPageContainer: 'div',
  StyledPageTitle: 'h1',
}));

describe('OrdersPage', () => {
  it('should render the page with the correct title', () => {
    render(<OrdersPage />);
    expect(screen.getByRole('heading', { name: /Ordens de Serviço/i })).toBeInTheDocument();
  });
});
