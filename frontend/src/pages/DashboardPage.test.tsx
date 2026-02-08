import { render, screen } from '../test-utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import * as ReactRouter from 'react-router-dom';
import { TestProviders } from '../test-utils/TestProviders';

// Mock router hooks
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useNavigate: vi.fn(),
    useLoaderData: vi.fn(),
    useNavigation: () => ({ state: 'idle' }),
    useLocation: () => ({ search: '' }),
  };
});

// Mock Widgets pesados para focar no layout da página
vi.mock('../components/Dashboard/SalesByMonthChartWidget', () => ({ default: () => <div data-testid="chart-sales">Sales Chart</div> }));
vi.mock('../components/Dashboard/TopSellingProductsChartWidget', () => ({ default: () => <div data-testid="chart-top">Top Products</div> }));
vi.mock('../components/Dashboard/SalesHeatmapWidget', () => ({ default: () => <div data-testid="chart-heatmap">Heatmap</div> }));
vi.mock('../components/Dashboard/StockABCWidget', () => ({ default: () => <div data-testid="widget-abc">Stock ABC</div> }));

describe('DashboardPage Integration', () => {
  const mockData = {
    totalSales: { mainPeriodSales: 10000 },
    salesForecast: { mainPeriodSalesForecast: { projected_sales: 15000 } },
    salesByMonth: { mainPeriodSalesByMonth: [] },
    topSellingProducts: { mainPeriodTopSellingProducts: [] },
    stockABC: [],
    hourlySales: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (ReactRouter.useLoaderData as any).mockReturnValue(mockData);
  });

  it('should render executive summary cards correctly', () => {
    render(<DashboardPage />, { wrapper: TestProviders });

    expect(screen.getByText(/Centro de Comando/i)).toBeDefined();
    expect(screen.getByText(/Vendas Totais/i)).toBeDefined();
    expect(screen.getByText(/R\$ 10.000/i)).toBeDefined();
    expect(screen.getByText(/Previsão Final Mês/i)).toBeDefined();
  });

  it('should render all dashboard widgets', () => {
    render(<DashboardPage />, { wrapper: TestProviders });

    expect(screen.getByTestId('chart-sales')).toBeDefined();
    expect(screen.getByTestId('chart-top')).toBeDefined();
    expect(screen.getByTestId('chart-heatmap')).toBeDefined();
    expect(screen.getByTestId('widget-abc')).toBeDefined();
  });
});
