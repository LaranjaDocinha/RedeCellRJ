
import React from 'react';
import DashboardPage from './DashboardPage';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '../test-utils/TestWrapper';
import { axe } from 'jest-axe';

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      token: 'mock-token',
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com' },
    }),
  };
});

// Mock the useNotification hook
vi.mock('../components/NotificationProvider', async () => {
  const actual = await vi.importActual('../components/NotificationProvider');
  return {
    ...actual,
    useNotification: () => ({
      addNotification: vi.fn(),
    }),
  };
});

// Mock the useUserDashboardApi hook
vi.mock('../hooks/useUserDashboardApi', () => ({
  getSettings: vi.fn(() => Promise.resolve({ widgets: [] })),
  updateSettings: vi.fn(() => Promise.resolve()),
}));



const mockDashboardData = {
  totalSales: 1234.56,
  salesByMonth: [
    { month: 'Jan', monthly_sales: 100 },
    { month: 'Feb', monthly_sales: 200 },
  ],
  topSellingProducts: [
    { product_name: 'Product A', variation_color: 'Red', total_quantity_sold: 50 },
    { product_name: 'Product B', variation_color: 'Blue', total_quantity_sold: 30 },
  ],
  recentSales: [],
};

describe('DashboardPage Accessibility', () => {
  beforeEach(() => {
    // Mock fetch for dashboard data
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('http://localhost:3000/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData),
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <Router>
        <DashboardPage />
      </Router>
    );
    // Wait for data to load
    await screen.findByText('$1234.56'); 
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
