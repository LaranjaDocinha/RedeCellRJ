import React, { useEffect, useState } from 'react';
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import TotalSalesWidget from '../components/Dashboard/TotalSalesWidget';
import SalesByMonthChartWidget from '../components/Dashboard/SalesByMonthChartWidget';
import TopSellingProductsChartWidget from '../components/Dashboard/TopSellingProductsChartWidget';
import LoyaltyPointsWidget from '../components/Dashboard/LoyaltyPointsWidget'; // Import LoyaltyPointsWidget
import RecentSalesWidget from '../components/Dashboard/RecentSalesWidget'; // Import RecentSalesWidget
import { DashboardGrid } from './DashboardPage.styled';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { getSettings, updateSettings } from '../hooks/useUserDashboardApi';
import DashboardWidget from '../components/Dashboard/DashboardWidget';
import ManageWidgetsModal from '../components/Dashboard/ManageWidgetsModal'; // Import the modal
import { FaCog } from 'react-icons/fa'; // Import the cog icon
import styled from 'styled-components'; // Import styled-components for the button

// Styled button for managing widgets
const ManageWidgetsButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  transition: background-color 0.2s ease-in-out;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

interface DashboardData {
  totalSales: number;
  salesByMonth: Array<{ month: string; monthly_sales: number }>;
  topSellingProducts: Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>;
  recentSales: Array<{ id: number; total_amount: number; sale_date: string }>; // Add recentSales
}

interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number; // Add order property
  component: React.FC<any>;
  title: string; // Add title property for modal
}

const WIDGET_COMPONENTS: { [key: string]: React.FC<any> } = {
  totalSales: TotalSalesWidget,
  salesByMonthChart: SalesByMonthChartWidget,
  topSellingProductsChart: TopSellingProductsChartWidget,
  loyaltyPoints: LoyaltyPointsWidget,
  recentSales: RecentSalesWidget, // Add RecentSalesWidget
};

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    [
      { id: 'totalSales', title: 'Total Sales', visible: true, order: 0, component: TotalSalesWidget },
      { id: 'salesByMonthChart', title: 'Sales by Month', visible: true, order: 1, component: SalesByMonthChartWidget },
      { id: 'topSellingProductsChart', title: 'Top Selling Products', visible: true, order: 2, component: TopSellingProductsChartWidget },
      { id: 'loyaltyPoints', title: 'Loyalty Points', visible: true, order: 3, component: LoyaltyPointsWidget },
      { id: 'recentSales', title: 'Recent Sales', visible: true, order: 4, component: RecentSalesWidget }, // Add RecentSalesWidget
    ] // Default order and visibility
  );
  const [isManageModalOpen, setManageModalOpen] = useState(false); // State for modal
  const { addNotification } = useNotification();
  const { token, isAuthenticated, user } = useAuth();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:3000/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error: any) {
        addNotification(`Failed to fetch dashboard data: ${error.message}`, 'error');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addNotification, token]);

  // Fetch user dashboard settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!isAuthenticated || !user?.id) return;
      try {
        const userSettings = await getSettings(token);
        if (userSettings && userSettings.widgets) {
          // Merge default widgets with user settings
          const mergedWidgets = widgets.map(defaultWidget => {
            const userWidget = userSettings.widgets.find((s: any) => s.id === defaultWidget.id);
            return { ...defaultWidget, ...userWidget };
          }).sort((a, b) => a.order - b.order); // Sort by user's order
          setWidgets(mergedWidgets);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
        // TODO: Show error notification
      }
    };
    fetchUserSettings();
  }, [isAuthenticated, user?.id, token]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Update order property for persistence
        const updatedOrder = newOrder.map((widget, index) => ({ ...widget, order: index }));
        
        // Persist to backend
        if (isAuthenticated && user?.id) {
          updateSettings(token, { widgets: updatedOrder })
            .catch(err => console.error('Failed to save dashboard settings:', err));
        }

        return updatedOrder;
      });
    }
  };

  const handleSaveWidgets = async (updatedWidgets: WidgetConfig[]) => {
    const sortedWidgets = updatedWidgets.map((w, index) => ({ ...w, order: index })).sort((a, b) => a.order - b.order);
    setWidgets(sortedWidgets);

    if (isAuthenticated && user?.id) {
      try {
        await updateSettings(token, { widgets: sortedWidgets });
        addNotification('Dashboard settings saved successfully!', 'success');
      } catch (err) {
        console.error('Failed to save dashboard settings:', err);
        addNotification('Failed to save dashboard settings.', 'error');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!data) {
    return <div className="dashboard-page">No dashboard data available.</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <ManageWidgetsButton onClick={() => setManageModalOpen(true)} data-tut="manage-widgets-button">
        <FaCog /> Manage Widgets
      </ManageWidgetsButton>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={sortableKeyboardCoordinates}>
          <DashboardGrid>
            {widgets.filter(w => w.visible).map((widget) => {
              const WidgetComponent = WIDGET_COMPONENTS[widget.id];
              if (!WidgetComponent) return null;

              // Pass data to specific widgets
              let widgetProps = {};
              let dataTutAttribute = ''; // Initialize data-tut attribute

              if (widget.id === 'totalSales') {
                widgetProps = { totalSales: data.totalSales };
                dataTutAttribute = 'total-sales-widget';
              } else if (widget.id === 'salesByMonthChart') {
                widgetProps = { salesByMonth: data.salesByMonth };
                dataTutAttribute = 'sales-by-month-chart';
              } else if (widget.id === 'topSellingProductsChart') {
                widgetProps = { topSellingProducts: data.topSellingProducts };
                dataTutAttribute = 'top-selling-products-chart';
              } else if (widget.id === 'loyaltyPoints') {
                // LoyaltyPointsWidget fetches its own data, no props needed
                dataTutAttribute = 'loyalty-points-widget';
              } else if (widget.id === 'recentSales') {
                // RecentSalesWidget fetches its own data, but we can pass data if available
                widgetProps = { recentSales: data.recentSales };
                dataTutAttribute = 'recent-sales-widget';
              }

              return (
                <DashboardWidget key={widget.id} id={widget.id} title={widget.title} isSortable data-tut={dataTutAttribute}>
                  <WidgetComponent {...widgetProps} />
                </DashboardWidget>
              );
            })}
          </DashboardGrid>
        </SortableContext>
      </DndContext>

      <ManageWidgetsModal
        isOpen={isManageModalOpen}
        onClose={() => setManageModalOpen(false)}
        widgets={widgets.map(w => ({ id: w.id, title: w.title, visible: w.visible }))}
        onSave={handleSaveWidgets}
      />
    </div>
  );
};

export default DashboardPage;