import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout/Layout';

// Pages (Lazy Loaded)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pdv = lazy(() => import('./pages/Pdv'));
const Products = lazy(() => import('./pages/Products'));
const Repairs = lazy(() => import('./pages/Repairs'));
const RepairForm = lazy(() => import('./pages/Repairs/components/RepairForm'));
const Customers = lazy(() => import('./pages/Customers'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const ReturnsPage = lazy(() => import('./pages/Returns'));
const CashierPage = lazy(() => import('./pages/Cashier'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const SalesHistory = lazy(() => import('./pages/SalesHistory'));
const StockManagement = lazy(() => import('./pages/StockManagement'));
const Finance = lazy(() => import('./pages/Finance'));
const Users = lazy(() => import('./pages/Users'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const SalesReport = lazy(() => import('./pages/Reports/Sales'));
const ProfitabilityReport = lazy(() => import('./pages/Reports/Profitability'));
const CustomerReport = lazy(() => import('./pages/Reports/Customers'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'pdv', element: <Pdv /> },
      { path: 'products', element: <Products /> },
      { path: 'repairs', element: <Repairs /> },
      { path: 'repairs/new', element: <RepairForm /> },
      { path: 'customers', element: <Customers /> },
      { path: 'suppliers', element: <Suppliers /> },
      { path: 'purchase-orders/*', element: <PurchaseOrders /> },
      { path: 'returns', element: <ReturnsPage /> },
      { path: 'cashier', element: <CashierPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'sales-history', element: <SalesHistory /> },
      { path: 'stock', element: <StockManagement /> },
      { path: 'finance', element: <Finance /> },
      { path: 'users', element: <Users /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'reports/sales', element: <SalesReport /> },
      { path: 'reports/profitability', element: <ProfitabilityReport /> },
      { path: 'reports/customers', element: <CustomerReport /> },
    ],
  },
]);

export default router;