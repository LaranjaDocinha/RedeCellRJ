import React, { lazy, Suspense } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import DashboardWidget from './DashboardWidget';
import { Grid } from '@mui/material'; // Import Grid from MUI
import { AnimatePresence, motion } from 'framer-motion';
import TotalSalesWidget from './TotalSalesWidget';
const SalesByMonthChartWidget = lazy(() => import('./SalesByMonthChartWidget'));
const TopSellingProductsChartWidget = lazy(() => import('./TopSellingProductsChartWidget'));
const LoyaltyPointsWidget = lazy(() => import('./LoyaltyPointsWidget'));
const SalesGoalsWidget = lazy(() => import('./SalesGoalsWidget'));
const RecentSalesWidget = lazy(() => import('./RecentSalesWidget'));
const CategoryProfitabilityWidget = lazy(() => import('./CategoryProfitabilityWidget'));
const SalespersonPerformanceWidget = lazy(() => import('./SalespersonPerformanceWidget'));
const AnnualSalesComparisonWidget = lazy(() => import('./AnnualSalesComparisonWidget'));
const CriticalStockWidget = lazy(() => import('./CriticalStockWidget'));
const MostActiveCustomersWidget = lazy(() => import('./MostActiveCustomersWidget'));
const SalesByChannelWidget = lazy(() => import('./SalesByChannelWidget'));
const PriceTrendsWidget = lazy(() => import('./PriceTrendsWidget'));
const ProductPerformanceWidget = lazy(() => import('./ProductPerformanceWidget'));
const RevenueByHourWidget = lazy(() => import('./RevenueByHourWidget'));
const ReturnMetricsWidget = lazy(() => import('./ReturnMetricsWidget'));
const CustomerSegmentationWidget = lazy(() => import('./CustomerSegmentationWidget'));
import AbandonedCartsWidget from './AbandonedCartsWidget';
import SlowMovingProductsWidget from './SlowMovingProductsWidget'; // Added
import SalesForecastWidget from './SalesForecastWidget'; // Added
import AverageTicketWidget from './AverageTicketWidget'; // Added
import SalesHeatmapWidget from './SalesHeatmapWidget'; // Added
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';

/**
 * @interface WidgetConfig
 * @description Define a configuração de um widget no dashboard.
 * @property {string} id - Identificador único do widget.
 * @property {boolean} visible - Indica se o widget está visível.
 * @property {number} order - A ordem de exibição do widget.
 * @property {React.FC<any>} component - O componente React do widget.
 * @property {string} title - O título do widget.
 */
interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  component: React.FC<any>;
  title: string;
}

/**
 * @interface DashboardData
 * @description Define a estrutura dos dados principais do dashboard.
 * @property {number} totalSales - O valor total das vendas.
 * @property {Array<{ month: string; monthly_sales: number }>} salesByMonth - Vendas mensais.
 * @property {Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>} topSellingProducts - Produtos mais vendidos.
 * @property {Array<{ id: number; total_amount: number; sale_date: string }>} recentSales - Vendas recentes.
 */
interface DashboardData {
  totalSales: number;
  salesByMonth: Array<{ month: string; monthly_sales: number }>;
  topSellingProducts: Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>;
  recentSales: Array<{ id: number; total_amount: number; sale_date: string }>;
  slowMovingProducts: any[]; // Added
  salesForecast: any; // Added
  averageTicketBySalesperson: any[]; // Added
  salesHeatmap: any[]; // Added
}

/**
 * @interface DashboardWidgetRendererProps
 * @description Propriedades para o componente DashboardWidgetRenderer.
 * @property {WidgetConfig[]} widgets - Lista de configurações dos widgets.
 * @property {DashboardData | null} data - Dados do dashboard.
 * @property {(event: any) => void} onDragEnd - Função de callback para o evento de drag-end.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 * @property {number} columns - Número de colunas para o layout do grid.
 */
interface DashboardWidgetRendererProps {
  widgets: WidgetConfig[];
  data: DashboardData | null;
  onDragEnd: (event: any) => void;
  selectedPeriod: string;
  columns: number; // Add columns prop
}

/**
 * @constant WIDGET_COMPONENTS
 * @description Mapeamento de IDs de widgets para seus respectivos componentes React.
 */
const WIDGET_COMPONENTS: { [key: string]: React.FC<any> } = {
  totalSales: TotalSalesWidget,
  salesByMonthChart: SalesByMonthChartWidget,
  topSellingProductsChart: TopSellingProductsChartWidget,
  salesGoals: SalesGoalsWidget,
  loyaltyPoints: LoyaltyPointsWidget,
  recentSales: RecentSalesWidget,
  categoryProfitability: CategoryProfitabilityWidget,
  salespersonPerformance: SalespersonPerformanceWidget,
  annualSalesComparison: AnnualSalesComparisonWidget,
  criticalStock: CriticalStockWidget,
  mostActiveCustomers: MostActiveCustomersWidget,
  salesByChannel: SalesByChannelWidget,
  priceTrends: PriceTrendsWidget,
  productPerformance: ProductPerformanceWidget,
  revenueByHour: RevenueByHourWidget,
  returnMetrics: ReturnMetricsWidget,
  customerSegmentation: CustomerSegmentationWidget,
  abandonedCarts: AbandonedCartsWidget,
  slowMovingProducts: SlowMovingProductsWidget, // Added
  salesForecast: SalesForecastWidget, // Added
  averageTicket: AverageTicketWidget, // Added
  salesHeatmap: SalesHeatmapWidget, // Added
};

/**
 * @function DashboardWidgetRenderer
 * @description Componente responsável por renderizar os widgets do dashboard, incluindo a funcionalidade de drag-and-drop.
 * @param {DashboardWidgetRendererProps} props - As propriedades do componente.
 * @returns {React.FC} O componente DashboardWidgetRenderer.
 */
const DashboardWidgetRenderer: React.FC<DashboardWidgetRendererProps> = ({ widgets, data, onDragEnd, selectedPeriod, columns }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getGridItemSize = () => {
    switch (columns) {
      case 1: return 12;
      case 2: return 6;
      case 3: return 4;
      case 4: return 3;
      default: return 6; // Default to 2 columns
    }
  };

  const gridItemSize = getGridItemSize();

  if (!data) {
    return (
      <Grid container spacing={2}> {/* Use MUI Grid */}
        {widgets.filter(w => w.visible).map((widget) => (
          <Grid item xs={12} sm={gridItemSize} md={gridItemSize} lg={gridItemSize} key={widget.id}>
            <DashboardWidget id={widget.id} title={widget.title} isSortable>
              <Suspense fallback={<DashboardWidgetSkeleton />}>
                <DashboardWidgetSkeleton />
              </Suspense>
            </DashboardWidget>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={widgets.map(w => w.id)} strategy={sortableKeyboardCoordinates}>
        <AnimatePresence>
          <Grid container spacing={2}> {/* Use MUI Grid */}
            {widgets.filter(w => w.visible).map((widget) => {
              const WidgetComponent = WIDGET_COMPONENTS[widget.id];
              if (!WidgetComponent) return null;

              let widgetProps = { selectedPeriod };
              if (widget.id === 'totalSales') {
                widgetProps = { ...widgetProps, totalSales: data.totalSales };
              } else if (widget.id === 'salesByMonthChart') {
                widgetProps = { ...widgetProps, salesByMonth: data.salesByMonth };
              } else if (widget.id === 'topSellingProductsChart') {
                widgetProps = { ...widgetProps, topSellingProducts: data.topSellingProducts };
              } else if (widget.id === 'salesGoals') {
                // SalesGoalsWidget busca seus próprios dados, mas pode usar selectedPeriod para a query
              } else if (widget.id === 'loyaltyPoints') {
                // LoyaltyPointsWidget busca seus próprios dados, mas pode usar selectedPeriod para a query
              } else if (widget.id === 'recentSales') {
                widgetProps = { ...widgetProps, recentSales: data.recentSales };
              } else if (widget.id === 'slowMovingProducts') {
                widgetProps = { ...widgetProps, data: data.slowMovingProducts };
              } else if (widget.id === 'salesForecast') {
                widgetProps = { ...widgetProps, data: data.salesForecast };
              } else if (widget.id === 'averageTicket') {
                widgetProps = { ...widgetProps, data: data.averageTicketBySalesperson };
              } else if (widget.id === 'salesHeatmap') {
                widgetProps = { ...widgetProps, data: data.salesHeatmap };
              }

              return (
                <Grid item xs={12} sm={gridItemSize} md={gridItemSize} lg={gridItemSize} key={widget.id}>
                  <DashboardWidget id={widget.id} title={widget.title} isSortable>
                    <Suspense fallback={<DashboardWidgetSkeleton />}>
                      <WidgetComponent {...widgetProps} />
                    </Suspense>
                  </DashboardWidget>
                </Grid>
              );
            })}
          </Grid>
        </AnimatePresence>
      </SortableContext>
    </DndContext>
  );
};

export default DashboardWidgetRenderer;
