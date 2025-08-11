import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout/Layout';

// Loaders
import { dashboardLoader } from './loaders/dashboardLoader';
import { ProductProvider } from './context/ProductContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import LoginCustomizer from './pages/Settings/LoginCustomizer'; // New import
import SettingsPage from './pages/SettingsPage';
import ChecklistTemplatesPage from './pages/ChecklistTemplatesPage';
import StockTransferPage from './pages/StockTransferPage';

// Pages (Lazy Loaded)
const Pdv = lazy(() => import('./pages/Pdv'));
const Products = lazy(() => import('./pages/Products'));
const Repairs = lazy(() => import('./pages/Repairs'));
const RepairForm = lazy(() => import('./pages/Repairs/components/RepairForm'));
const Customers = lazy(() => import('./pages/Customers'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const ReturnsPage = lazy(() => import('./pages/Returns'));
const CashierPage = lazy(() => import('./pages/Cashier'));
const SalesHistory = lazy(() => import('./pages/SalesHistory'));
const StockManagement = lazy(() => import('./pages/StockManagement'));
const AccountsPayable = lazy(() => import('./pages/Finance/AccountsPayable'));
const AccountsReceivable = lazy(() => import('./pages/Finance/AccountsReceivable'));
const Users = lazy(() => import('./pages/Users'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const SalesReport = lazy(() => import('./pages/Reports/Sales'));
const ProfitabilityReport = lazy(() => import('./pages/Reports/ProfitabilityReport'));
const CustomerReport = lazy(() => import('./pages/Reports/Customers'));
const Logout = lazy(() => import('./pages/Authentication/Logout'));
const Login = lazy(() => import('./pages/Authentication/Login'));
const TechniciansPage = lazy(() => import('./pages/Technicians'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const TechnicianKanban = lazy(() => import('./pages/TechnicianKanban'));
const CustomerHubPage = lazy(() => import('./pages/CustomerHubPage'));
const KanbanMetrics = lazy(() => import('./pages/KanbanMetrics'));
const RolesAndPermissions = lazy(() => import('./pages/RolesAndPermissions'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Leads = lazy(() => import('./pages/Leads'));
const Expenses = lazy(() => import('./pages/Expenses'));
const FinanceDashboard = lazy(() => import('./pages/Finance/FinanceDashboard'));
const CustomerInteractions = lazy(() => import('./pages/CustomerInteractions'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const UsedProductsPage = lazy(() => import('./pages/UsedProducts/UsedProductsPage'));
const GiftCardsPage = lazy(() => import('./pages/GiftCards/GiftCardsPage'));
const QuotationsPage = lazy(() => import('./pages/Quotations/QuotationsPage'));
const AppointmentBookingPage = lazy(() => import('./pages/Appointments/AppointmentBookingPage'));
const AppointmentManagementPage = lazy(() => import('./pages/Appointments/AppointmentManagementPage'));
const MarketingCampaignsPage = lazy(() => import('./pages/Marketing/MarketingCampaignsPage'));
const CampaignReportsPage = lazy(() => import('./pages/Marketing/CampaignReportsPage'));
const NpsSurveyPage = lazy(() => import('./pages/NPS/NpsSurveyPage'));
const NpsReportsPage = lazy(() => import('./pages/NPS/NpsReportsPage'));
const WarrantyManagementPage = lazy(() => import('./pages/Warranty/WarrantyManagementPage'));
const DeviceHistoryPage = lazy(() => import('./pages/DeviceHistory/DeviceHistoryPage'));
const CashFlowProjectionsPage = lazy(() => import('./pages/CashFlow/CashFlowProjectionsPage'));
const CashFlowReportPage = lazy(() => import('./pages/CashFlow/CashFlowReportPage'));
const BankAccountsPage = lazy(() => import('./pages/BankAccounts/BankAccountsPage'));
const CommissionRulesPage = lazy(() => import('./pages/Commissions/CommissionRulesPage'));
const CalculatedCommissionsPage = lazy(() => import('./pages/Commissions/CalculatedCommissionsPage'));
const CommissionPaymentsPage = lazy(() => import('./pages/Commissions/CommissionPaymentsPage'));
const TechnicianPerformanceReportPage = lazy(() => import('./pages/Reports/TechnicianPerformance/TechnicianPerformanceReportPage'));
const ProductProfitabilityReportPage = lazy(() => import('./pages/Reports/ProductProfitability/ProductProfitabilityReportPage'));
const ABCAnalysisPage = lazy(() => import('./pages/Reports/ABCAnalysis/ABCAnalysisPage'));
const BIDashboardPage = lazy(() => import('./pages/BIDashboard/BIDashboardPage'));
const PainelAdministrativo = lazy(() => import('./pages/PainelAdministrativo/PainelAdministrativo'));

const router = createBrowserRouter([
  {
    // Public routes (accessible without authentication)
    path: '/login',
    element: <Login />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    // Protected routes (require authentication)
    element: <ProtectedRoute />,
    children: [
      {
        path: '/', // Root path, if authenticated, goes to dashboard
        element: <Layout />,
        children: [
          { index: true, element: <Navigate replace to='/bi-dashboard' /> }, // Redirect / to /dashboard if authenticated
          { path: 'calendar', element: <CalendarPage />, handle: { title: 'Agenda', icon: 'calendar' } },
          { path: 'pdv', element: <Pdv />, handle: { title: 'PDV', icon: 'cart' } },
          { path: 'cashier', element: <CashierPage />, handle: { title: 'Caixa', icon: 'wallet' } },
          { 
            path: 'products', 
            element: <ProductProvider><Products /></ProductProvider>,
            handle: { title: 'Produtos', icon: 'package' }
          },
          { path: 'repairs', element: <Repairs />, handle: { title: 'Reparos', icon: 'wrench' } },
          { path: 'repairs/new', element: <RepairForm />, handle: { title: 'Novo Reparo', icon: 'plus-circle' } },
          { path: 'repairs/:repairId', element: <RepairForm />, handle: { title: 'Editar Reparo', icon: 'edit' } },
          { path: 'customers', element: <Customers />, handle: { title: 'Clientes', icon: 'user-pin' } },
          { path: 'customers/:id/hub', element: <CustomerHubPage />, handle: { title: 'Hub do Cliente', icon: 'user-detail' } },
          { path: 'suppliers', element: <Suppliers />, handle: { title: 'Fornecedores', icon: 'store-alt' } },
          { path: 'purchase-orders/*', element: <PurchaseOrders />, handle: { title: 'Ordens de Compra', icon: 'file-blank' } },
          { path: 'returns', element: <ReturnsPage />, handle: { title: 'Devoluções', icon: 'revision' } },
          
          { path: '/settings', element: <SettingsPage />, handle: { title: 'Configurações', icon: 'cog' } },
          { path: '/settings/login-customization', element: <LoginCustomizer />, handle: { title: 'Personalizar Login', icon: 'palette' } }, // New route
          { path: '/settings/checklist-templates', element: <ChecklistTemplatesPage />, handle: { title: 'Templates de Checklist', icon: 'list-check' } },
          { path: '/stock/transfers', element: <StockTransferPage />, handle: { title: 'Transferência de Estoque', icon: 'transfer' } },
          { path: 'sales-history', element: <SalesHistory />, handle: { title: 'Histórico de Vendas', icon: 'history' } },
          { path: 'stock', element: <StockManagement />, handle: { title: 'Gestão de Estoque', icon: 'box' } },
          { path: 'finance/payables', element: <AccountsPayable />, handle: { title: 'Contas a Pagar', icon: 'arrow-to-bottom' } },
          { path: 'api/finance/receivables', element: <AccountsReceivable />, handle: { title: 'Contas a Receber', icon: 'arrow-from-bottom' } },
          { path: 'users', element: <Users />, handle: { title: 'Usuários', icon: 'group' } },
          { path: 'reports', element: <ReportsPage />, handle: { title: 'Relatórios', icon: 'bar-chart-alt-2' } },
          { path: 'reports/sales', element: <SalesReport />, handle: { title: 'Relatório de Vendas', icon: 'chart' } },
          { path: 'reports/profitability', element: <ProfitabilityReport />, handle: { title: 'Relatório de Lucratividade', icon: 'dollar-circle' } },
          { path: 'reports/customers', element: <CustomerReport />, handle: { title: 'Relatório de Clientes', icon: 'user-voice' } },
          { path: 'user-profile/:id', element: <UserProfilePage />, handle: { title: 'Perfil do Usuário', icon: 'user-circle' } },
          { path: 'technicians', element: <TechniciansPage />, handle: { title: 'Técnicos', icon: 'user-plus' } },
          { path: 'technician-kanban', element: <TechnicianKanban />, handle: { title: 'Kanban de Técnicos', icon: 'layout' } },
          { path: 'kanban-metrics', element: <KanbanMetrics />, handle: { title: 'Métricas do Kanban', icon: 'tachometer' } },
          { path: 'roles-and-permissions', element: <RolesAndPermissions />, handle: { title: 'Cargos e Permissões', icon: 'shield-quarter' } },
          { path: 'audit-logs', element: <AuditLogs />, handle: { title: 'Logs de Auditoria', icon: 'file-find' } },
          { path: 'leads', element: <Leads />, handle: { title: 'Leads', icon: 'user-voice' } },
          { path: 'expenses', element: <Expenses />, handle: { title: 'Despesas', icon: 'wallet' } },
          { path: 'finance-dashboard', element: <FinanceDashboard />, handle: { title: 'Dashboard Financeiro', icon: 'dollar-circle' } },
          { path: 'customer-interactions', element: <CustomerInteractions />, handle: { title: 'Interações com Clientes', icon: 'conversation' } },
          { path: 'used-products', element: <UsedProductsPage />, handle: { title: 'Produtos Usados', icon: 'recycle' } },
          { path: 'gift-cards', element: <GiftCardsPage />, handle: { title: 'Vale-Presentes', icon: 'gift' } },
          { path: 'quotations', element: <QuotationsPage />, handle: { title: 'Orçamentos', icon: 'file' } },
          { path: 'appointments/book', element: <AppointmentBookingPage />, handle: { title: 'Agendar Horário', icon: 'calendar-plus' } },
          { path: 'appointments/manage', element: <AppointmentManagementPage />, handle: { title: 'Gerenciar Agenda', icon: 'calendar-check' } },
          { path: 'marketing/campaigns', element: <MarketingCampaignsPage />, handle: { title: 'Campanhas de Marketing', icon: 'bullhorn' } },
          { path: 'marketing/reports', element: <CampaignReportsPage />, handle: { title: 'Relatórios de Campanha', icon: 'bar-chart-square' } },
          { path: 'nps/survey', element: <NpsSurveyPage />, handle: { title: 'Pesquisa NPS', icon: 'smile' } },
          { path: 'nps/reports', element: <NpsReportsPage />, handle: { title: 'Relatórios NPS', icon: 'line-chart' } },
          { path: 'repairs/warranty', element: <WarrantyManagementPage />, handle: { title: 'Garantias', icon: 'check-shield' } },
          { path: 'device-history', element: <DeviceHistoryPage />, handle: { title: 'Histórico do Dispositivo', icon: 'mobile' } },
          { path: 'finance/cash-flow-projections', element: <CashFlowProjectionsPage />, handle: { title: 'Projeção de Caixa', icon: 'trending-up' } },
          { path: 'finance/cash-flow-report', element: <CashFlowReportPage />, handle: { title: 'Relatório de Caixa', icon: 'file-blank' } },
          { path: 'finance/bank-accounts', element: <BankAccountsPage />, handle: { title: 'Contas Bancárias', icon: 'bank' } },
          { path: 'commissions/rules', element: <CommissionRulesPage />, handle: { title: 'Regras de Comissão', icon: 'sitemap' } },
          { path: 'commissions/calculated', element: <CalculatedCommissionsPage />, handle: { title: 'Comissões Calculadas', icon: 'calculator' } },
          { path: 'commissions/payments', element: <CommissionPaymentsPage />, handle: { title: 'Pagamento de Comissões', icon: 'money-withdraw' } },
          { path: 'reports/technician-performance', element: <TechnicianPerformanceReportPage />, handle: { title: 'Desempenho de Técnicos', icon: 'user-check' } },
          { path: 'reports/product-profitability', element: <ProductProfitabilityReportPage />, handle: { title: 'Lucratividade por Produto', icon: 'dollar' } },
          { path: 'reports/abc-analysis', element: <ABCAnalysisPage />, handle: { title: 'Análise ABC', icon: 'sort-a-z' } },
          { path: 'bi-dashboard', element: <BIDashboardPage />, handle: { title: 'BI Dashboard', icon: 'area' } },
          { path: 'painel-administrativo', element: <PainelAdministrativo />, handle: { title: 'Painel Administrativo', icon: 'shield-alt-2' } },
        ],
      },
    ],
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
