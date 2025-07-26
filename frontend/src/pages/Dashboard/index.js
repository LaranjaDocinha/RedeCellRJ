import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { LayoutGroup } from 'framer-motion';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';

// Widgets
import DashboardWidget from './components/DashboardWidget';
import FloatingActionButton from './components/FloatingActionButton';
import KPICards from './components/widgets/KPICards';
import SalesByPaymentMethodChart from './components/widgets/SalesByPaymentMethodChart';
import LowStockAlert from './components/widgets/LowStockAlert';
import RecentActivityFeed from './components/widgets/RecentActivityFeed';
import MonthlySalesChart from './charts/MonthlySalesChart';
import TopProductsChart from './charts/TopProductsChart';
import FocusModeModal from './components/FocusModeModal';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './_dashboard.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Map widget IDs to their components and skeleton types
const WIDGET_CONFIG = {
  kpi: { component: KPICards, skeletonType: 'kpi' },
  salesByPayment: { component: SalesByPaymentMethodChart, skeletonType: 'donut' },
  lowStock: { component: LowStockAlert, skeletonType: 'list' },
  recentActivity: { component: RecentActivityFeed, skeletonType: 'list' },
  monthlySales: { component: MonthlySalesChart, skeletonType: 'bar' },
  topProducts: { component: TopProductsChart, skeletonType: 'bar' },
};

const DashboardContent = () => {
  const {
    WIDGETS,
    layouts,
    activeWidgets,
    availableWidgets,
    timePeriod,
    focusModeWidget,
    setFocusModeWidget,
    onLayoutChange,
    onAddWidget,
    onRemoveWidget,
    onResetLayout,
    onPeriodChange,
  } = useDashboard();

  const focusedWidgetConfig = focusModeWidget ? WIDGET_CONFIG[focusModeWidget] : null;
  const FocusedComponent = focusedWidgetConfig ? focusedWidgetConfig.component : null;

  return (
    <div className="page-content">
      <LayoutGroup>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={150}
          draggableHandle=".widget-header"
        >
          {activeWidgets.map(widgetId => {
            const widgetInfo = WIDGETS[widgetId];
            const config = WIDGET_CONFIG[widgetId];
            if (!widgetInfo || !config) return null;
            
            const Component = config.component;

            return (
              <div key={widgetId}>
                <DashboardWidget
                  title={widgetInfo.title}
                  widgetId={widgetId}
                  skeletonType={config.skeletonType}
                  onRemove={() => onRemoveWidget(widgetId)}
                  onExpand={() => setFocusModeWidget(widgetId)}
                >
                  <Component />
                </DashboardWidget>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </LayoutGroup>
      <FloatingActionButton
        availableWidgets={availableWidgets}
        onAddWidget={onAddWidget}
        onResetLayout={onResetLayout}
      />
      <FocusModeModal>
        {focusedWidgetConfig && (
          <div className="focused-widget-container">
            <DashboardWidget
              title={WIDGETS[focusModeWidget].title}
              widgetId={focusModeWidget}
              skeletonType={focusedWidgetConfig.skeletonType}
              isFocused={true} // To disable certain features like remove/drag
            >
              <FocusedComponent />
            </DashboardWidget>
          </div>
        )}
      </FocusModeModal>
    </div>
  );
};

const Dashboard = () => {
  document.title = "Dashboard | PDV-Web";
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default Dashboard;