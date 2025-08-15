
import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Alert, Box, Icon } from '@mui/material';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { get } from '../../../helpers/api_helper';

// --- Reusable Components ---

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const MotionCard = motion(Card);

const KpiCard = ({ title, value, icon, color = 'primary.main' }) => (
  <MotionCard sx={{ height: '100%' }} variants={cardVariant}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </Box>
      <Icon sx={{ fontSize: 48, color }} color="inherit">{icon}</Icon>
    </CardContent>
  </MotionCard>
);

const ChartCard = ({ chartOptions, chartSeries, chartType, title }) => (
  <MotionCard sx={{ height: '100%' }} variants={cardVariant}>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type={chartType}
        width="100%"
        height={350}
      />
    </CardContent>
  </MotionCard>
);


// --- Main Dashboard Page Component ---

const BIDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [salesTrends, setSalesTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = { startDate: dateRange.start, endDate: dateRange.end };

        const [
          summaryRes,
          trendsRes,
          topProductsRes,
          categoryRes
        ] = await Promise.all([
          get('/api/dashboard/summary', { params }),
          get('/api/dashboard/sales-trends', { params: { ...params, interval: 'day' } }),
          get('/api/dashboard/top-products', { params: { ...params, limit: 5, orderBy: 'revenue' } }),
          get('/api/dashboard/sales-by-category', { params })
        ]);

        setSummary(summaryRes);
        setSalesTrends(trendsRes);
        setTopProducts(topProductsRes);
        setSalesByCategory(categoryRes);

      } catch (err) {
        setError(err.message || 'An error occurred while fetching dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // --- Chart Options ---

  const salesTrendsOptions = {
    chart: { id: 'sales-trends' },
    xaxis: {
      categories: salesTrends.map(d => new Date(d.period).toLocaleDateString()),
      title: { text: 'Date' }
    },
    yaxis: { title: { text: 'Revenue' } },
    tooltip: { x: { format: 'dd/MM/yy' } },
    stroke: { curve: 'smooth' },
  };
  const salesTrendsSeries = [{ name: 'Sales', data: salesTrends.map(d => d.total_sales) }];

  const topProductsOptions = {
    chart: { id: 'top-products' },
    xaxis: { categories: topProducts.map(p => p.product_name) },
    plotOptions: { bar: { horizontal: true } },
    tooltip: {
        x: {
            formatter: function(val) {
                return val
            }
        }
    }
  };
  const topProductsSeries = [{ name: 'Revenue', data: topProducts.map(p => p.total_revenue) }];

  const salesByCategoryOptions = {
    chart: { id: 'sales-by-category' },
    labels: salesByCategory.map(c => c.category_name),
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };
  const salesByCategorySeries = salesByCategory.map(c => parseFloat(c.total_sales_amount));


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Revenue" value={`R$${Number(summary.totalSales || 0).toLocaleString('pt-BR')}`} icon="attach_money" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Products Sold" value={summary.totalProductsSold || 0} icon="inventory_2" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="New Customers" value={summary.totalCustomers || 0} icon="person_add" color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Avg. Ticket" value={`R$${(summary.totalSales / summary.totalCustomers || 0).toFixed(2)}`} icon="receipt_long" color="error.main" />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Sales Trends (Last 30 Days)"
            chartOptions={salesTrendsOptions}
            chartSeries={salesTrendsSeries}
            chartType="area"
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Sales by Category"
            chartOptions={salesByCategoryOptions}
            chartSeries={salesByCategorySeries}
            chartType="donut"
          />
        </Grid>
        <Grid item xs={12}>
          <ChartCard
            title="Top 5 Products by Revenue"
            chartOptions={topProductsOptions}
            chartSeries={topProductsSeries}
            chartType="bar"
          />
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default BIDashboardPage;
