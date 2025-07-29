import React from 'react';
import { Container } from 'reactstrap';
import { motion } from 'framer-motion';

import DateRangePicker from '../../components/Common/DateRangePicker';
import { useDashboard } from '../../context/DashboardContext';

// Importar os novos componentes de gráfico
import MonthlySalesChart from './components/charts/MonthlySalesChart';
import SalesByPaymentMethodChart from './components/charts/SalesByPaymentMethodChart';
import DashboardSkeleton from './components/DashboardSkeleton';
import RecentActivityFeed from './components/RecentActivityFeed';
import DonutChart from '../../components/Dashboard/DonutChart';
import LowStockProducts from '../../components/Dashboard/LowStockProducts';

import KpiWidget from '../../components/Dashboard/KpiWidget';
import ChartWidget from '../../components/Dashboard/ChartWidget';
import useTopProductsData from '../../hooks/useTopProductsData';
import useSalesByCategoryData from '../../hooks/useSalesByCategoryData';
import useLowStockProductsData from '../../hooks/useLowStockProductsData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import './DashboardV2.scss';

const DashboardV2 = () => {
  const { loading, dashboardData, startDate, endDate, setDateRange } = useDashboard();
  const { data: topProductsData, isLoading: topProductsLoading, error: topProductsError } = useTopProductsData();
  const { data: salesByCategoryData, isLoading: salesByCategoryLoading, error: salesByCategoryError } = useSalesByCategoryData();
  const { data: lowStockProductsData, isLoading: lowStockProductsLoading, error: lowStockProductsError } = useLowStockProductsData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { widgets } = dashboardData;

  return (
    <div className='page-content'>
      <Container fluid>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <div className="dashboard-grid">
            <div className="grid-item-kpis">
              <KpiWidget />
            </div>
            <div className="grid-item-main-chart">
              <ChartWidget title="Vendas Mensais">
                <MonthlySalesChart data={widgets?.monthlySales} />
              </ChartWidget>
            </div>
            <div className="grid-item-side-widget-1">
              <ChartWidget
                title="Produtos Mais Vendidos"
                data={topProductsData}
                isLoading={topProductsLoading}
                error={topProductsError}
              >
                {(data) => (
                  <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                    <Legend />
                    <Bar dataKey="Vendas" fill="#007BFF" />
                  </BarChart>
                )}
              </ChartWidget>
            </div>
            <div className="grid-item-side-widget-2">
              <DonutChart data={salesByCategoryData} title="Vendas por Categoria" />
            </div>
            <div className="grid-item-side-widget-3">
              <LowStockProducts products={lowStockProductsData} />
            </div>
            <div className="grid-item-side-widget-4">
              <RecentActivityFeed activities={widgets?.recentActivity} />
            </div>
          </div>

          <div className="dashboard-footer">
            <DateRangePicker
              initialEndDate={endDate}
              initialStartDate={startDate}
              onDateChange={setDateRange}
            />
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default DashboardV2;
