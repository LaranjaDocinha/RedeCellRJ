import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { AnimationPreferenceProvider } from './contexts/AnimationPreferenceContext';
import { AnimationProvider as CartAnimationProvider } from './contexts/CartAnimationContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { ProjectThemeProvider } from './styles/theme';
import { SocketProvider } from './contexts/SocketContext';
import { InactivityTrackerProvider, useInactivityTracker } from './contexts/InactivityTrackerContext';
import { SoundProvider } from './contexts/SoundContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';

// Components
import AppLayout from './components/AppLayout';
import Loading from './components/Loading';
import PageTransition from './components/PageTransition';
import SkeletonLoader from './components/SkeletonLoader';
import LockScreen from './components/LockScreen';
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary';
import { SocketEventHandler } from './components/SocketEventHandler';

// Loaders
import { customerDetailLoader } from './routerLoaders';
import { productListLoader, productDetailLoader } from './loaders/productLoader';
import { posLoader } from './loaders/posLoader';
import { dashboardLoader } from './loaders/dashboardLoader';
import { techBenchLoader } from './loaders/techBenchLoader';
import { customerPortalLoader } from './loaders/customerPortalLoader';
import { cashFlowLoader, commissionsLoader } from './loaders/financeLoader';
import { customerLoader } from './loaders/customerLoader';

// Lazy Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ProductEditPage = lazy(() => import('./pages/ProductEditPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const POSPage = lazy(() => import('./pages/POSPage'));
const SalesHistoryPage = lazy(() => import('./pages/POS/SalesHistoryPage'));
const KanbanPage = lazy(() => import('./pages/KanbanPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const PnlReportPage = lazy(() => import('./pages/Reports/PnlReportPage'));
const CustomerDetailPage = lazy(() => import('./pages/CustomerDetailPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const TagsPage = lazy(() => import('./pages/TagsPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const PermissionsPage = lazy(() => import('./pages/PermissionsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ReturnsAndRefundsPage = lazy(() => import('./pages/ReturnsAndRefundsPage'));
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage'));
const ProductKitsPage = lazy(() => import('./pages/ProductKitsPage'));
const CompatibilityPage = lazy(() => import('./pages/CompatibilityPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const WhatsAppTemplatesPage = lazy(() => import('./pages/WhatsAppTemplatesPage'));
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage'));
const CustomizableDashboard = lazy(() => import('./pages/CustomizableDashboard'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const RuleEnginePage = lazy(() => import('./pages/RuleEnginePage'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));
const QuarantinePage = lazy(() => import('./pages/QuarantinePage'));
const RfmSegmentsPage = lazy(() => import('./pages/RfmSegmentsPage'));
const CashFlowPage = lazy(() => import('./pages/CashFlowPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CustomerWalletPage = lazy(() => import('./pages/CustomerWalletPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const ShiftsPage = lazy(() => import('./pages/ShiftsPage'));
const PerformanceReviewsPage = lazy(() => import('./pages/PerformanceReviewsPage'));
const TimeClockPage = lazy(() => import('./pages/TimeClockPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ServiceOrdersPage = lazy(() => import('./pages/ServiceOrdersPage'));
const ServiceOrderDetailPage = lazy(() => import('./pages/ServiceOrderDetailPage'));
const MyPerformancePage = lazy(() => import('./pages/MyPerformancePage'));
const WhatIfPromotionPage = lazy(() => import('./pages/WhatIfPromotionPage'));
const AccountingIntegrationPage = lazy(() => import('./pages/AccountingIntegrationPage'));
const AccountsReportPage = lazy(() => import('./pages/AccountsReportPage'));
const CategoryProfitabilityPage = lazy(() => import('./pages/CategoryProfitabilityPage'));
const BreakEvenPage = lazy(() => import('./pages/BreakEvenPage'));
const PartnerApiPage = lazy(() => import('./pages/PartnerApiPage'));
const EcommerceSyncPage = lazy(() => import('./pages/EcommerceSyncPage'));
const MarketplaceSyncPage = lazy(() => import('./pages/MarketplaceSyncPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const SmartPricingPage = lazy(() => import('./pages/SmartPricingPage'));
const CarrierApiPage = lazy(() => import('./pages/CarrierApiPage'));
const WebhooksPage = lazy(() => import('./pages/WebhooksPage'));
const WordPressIntegrationPage = lazy(() => import('./pages/WordPressIntegrationPage'));
const MobileAppSimulationPage = lazy(() => import('./pages/MobileAppSimulationPage'));
const BiIntegrationPage = lazy(() => import('./pages/BiIntegrationPage'));
const FranchisesPage = lazy(() => import('./pages/FranchisesPage'));
const GoogleShoppingIntegrationPage = lazy(() => import('./pages/GoogleShoppingIntegrationPage'));
const OnlineSchedulingPage = lazy(() => import('./pages/OnlineSchedulingPage'));
const CustomerPortalPage = lazy(() => import('./pages/CustomerPortalPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ChatSupportPage = lazy(() => import('./pages/ChatSupportPage'));
const ARPreviewPage = lazy(() => import('./pages/ARPreviewPage'));
const BuybackProgramPage = lazy(() => import('./pages/BuybackProgramPage'));
const RolePermissionsPage = lazy(() => import('./pages/RolePermissionsPage'));
const SurveyDashboardPage = lazy(() => import('./pages/SurveyDashboardPage'));
const GdprToolsPage = lazy(() => import('./pages/GdprToolsPage'));
const BranchSettingsPage = lazy(() => import('./pages/BranchSettingsPage'));
const SandboxPage = lazy(() => import('./pages/SandboxPage'));
const BrandingPage = lazy(() => import('./pages/BrandingPage'));
const MicroservicesPage = lazy(() => import('./pages/MicroservicesPage'));
const SerialHistoryPage = lazy(() => import('./pages/SerialHistoryPage'));
const StockKeeperPage = lazy(() => import('./pages/StockKeeperPage'));
const CustomerPortalAuthPage = lazy(() => import('./pages/CustomerPortalAuthPage'));
const CustomerPortalTrackingPage = lazy(() => import('./pages/CustomerPortalTrackingPage'));
const TechOrderListPage = lazy(() => import('./pages/TechOrderListPage'));
const TechOrderDetailPage = lazy(() => import('./pages/TechOrderDetailPage'));
const CustomerDisplayPage = lazy(() => import('./pages/CustomerDisplayPage'));
const SurveyPage = lazy(() => import('./pages/SurveyPage'));
const AdminAuditPage = lazy(() => import('./pages/AdminAuditPage'));
const ExecutiveDashboardPage = lazy(() => import('./pages/ExecutiveDashboardPage'));
const ExpenseReimbursementsPage = lazy(() => import('./pages/ExpenseReimbursementsPage'));
const KioskHomePage = lazy(() => import('./pages/Kiosk/KioskHomePage'));
const ReconciliationPage = lazy(() => import('./pages/Finance/ReconciliationPage'));
const PurchaseSuggestionPage = lazy(() => import('./pages/Inventory/PurchaseSuggestionPage'));
const ABCAnalysisPage = lazy(() => import('./pages/Inventory/ABCAnalysisPage'));
const PrintQueuePage = lazy(() => import('./pages/Print/PrintQueuePage'));
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage'));
const ProductComparisonPage = lazy(() => import('./pages/ProductComparisonPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const LeadProfilePage = lazy(() => import('./pages/LeadProfilePage'));
const ReportBuilderPage = lazy(() => import('./pages/ReportBuilderPage'));
const TechBenchPage = lazy(() => import('./pages/TechBenchPage'));
const QuoteApprovalPage = lazy(() => import('./pages/QuoteApprovalPage'));
const KioskDashboardPage = lazy(() => import('./pages/KioskDashboardPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  { path: "/login", element: <LoginScreen /> },
  { path: "/portal/auth", element: <Suspense fallback={<Loading />}><CustomerPortalAuthPage /></Suspense> },
  { path: "/portal/:token", element: <Suspense fallback={<Loading />}><CustomerPortalTrackingPage /></Suspense>, loader: customerPortalLoader },
  { path: "/kiosk", element: <Suspense fallback={<Loading />}><KioskDashboardPage /></Suspense>, loader: dashboardLoader },
  { path: "/kiosk-mode", element: <Suspense fallback={<Loading />}><KioskHomePage /></Suspense> },
  { path: "/quote/:token", element: <Suspense fallback={<Loading />}><QuoteApprovalPage /></Suspense> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/survey", element: <SurveyPage /> },
  { path: "/customer-display", element: <CustomerDisplayPage /> },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <PageTransition><HomePage /></PageTransition> },
      { path: "dashboard", element: <PageTransition><DashboardPage /></PageTransition>, loader: dashboardLoader },
      { path: "pos", element: <PageTransition><POSPage /></PageTransition>, loader: posLoader },
      { path: "pos/sales-history", element: <PageTransition><SalesHistoryPage /></PageTransition> },
      { path: "kanban", element: <PageTransition><KanbanPage /></PageTransition> },
      { path: "service-orders", element: <PageTransition><ServiceOrdersPage /></PageTransition> },
      { path: "service-orders/:id", element: <PageTransition><ServiceOrderDetailPage /></PageTransition> },
      { path: "orders", element: <PageTransition><OrdersPage /></PageTransition> },
      { path: "products", element: <PageTransition><ProductListPage /></PageTransition>, loader: productListLoader },
      { path: "products/:id", element: <PageTransition><ProductDetailPage /></PageTransition>, loader: productDetailLoader },
      { path: "products/:id/edit", element: <PageTransition><ProductEditPage /></PageTransition> },
      { path: "product-catalog", element: <PageTransition><ProductCatalogPage /></PageTransition> },
      { path: "products/compare", element: <PageTransition><ProductComparisonPage /></PageTransition> },
      { path: "reports", element: <PageTransition><ReportsPage /></PageTransition> },
      { path: "reports/builder", element: <PageTransition><ReportBuilderPage /></PageTransition> },
      { path: "pnl-report", element: <PageTransition><PnlReportPage /></PageTransition> },
      { path: "inventory", element: <PageTransition><InventoryPage /></PageTransition> },
      { path: "inventory/purchase-suggestions", element: <PageTransition><PurchaseSuggestionPage /></PageTransition> },
      { path: "inventory/abc-analysis", element: <PageTransition><ABCAnalysisPage /></PageTransition> },
      { path: "print/queue", element: <PageTransition><PrintQueuePage /></PageTransition> },
      { path: "customers", element: <PageTransition><CustomersPage /></PageTransition>, loader: customerLoader },
      { path: "customers/:id", element: <PageTransition><CustomerDetailPage /></PageTransition>, loader: customerDetailLoader },
      { path: "categories", element: <PageTransition><CategoriesPage /></PageTransition> },
      { path: "tags", element: <PageTransition><TagsPage /></PageTransition> },
      { path: "suppliers", element: <PageTransition><SuppliersPage /></PageTransition> },
      { path: "roles", element: <PageTransition><RolesPage /></PageTransition> },
      { path: "permissions", element: <PageTransition><PermissionsPage /></PageTransition> },
      { path: "users", element: <PageTransition><UsersPage /></PageTransition> },
      { path: "audit-logs", element: <PageTransition><AdminAuditPage /></PageTransition> },
      { path: "executive-dashboard", element: <PageTransition><ExecutiveDashboardPage /></PageTransition> },
      { path: "expense-reimbursements", element: <PageTransition><ExpenseReimbursementsPage /></PageTransition> },
      { path: "settings", element: <PageTransition><SettingsPage /></PageTransition> },
      { path: "promotions", element: <PageTransition><PromotionsPage /></PageTransition> },
      { path: "returns", element: <PageTransition><ReturnsAndRefundsPage /></PageTransition> },
      { path: "loyalty", element: <PageTransition><LoyaltyPage /></PageTransition> },
      { path: "leads", element: <PageTransition><LeadsPage /></PageTransition> },
      { path: "leads/:id", element: <PageTransition><LeadProfilePage /></PageTransition> },
      { path: "rule-engine", element: <PageTransition><RuleEnginePage /></PageTransition> },
      { path: "product-kits", element: <PageTransition><ProductKitsPage /></PageTransition> },
      { path: "compatibility", element: <PageTransition><CompatibilityPage /></PageTransition> },
      { path: "purchase-orders", element: <PageTransition><PurchaseOrdersPage /></PageTransition> },
      { path: "branches", element: <PageTransition><BranchesPage /></PageTransition> },
      { path: "whatsapp-templates", element: <PageTransition><WhatsAppTemplatesPage /></PageTransition> },
      { path: "system-health", element: <PageTransition><SystemHealthPage /></PageTransition> },
      { path: "custom-dashboard", element: <PageTransition><CustomizableDashboard /></PageTransition> },
      { path: "referrals", element: <PageTransition><ReferralPage /></PageTransition> },
      { path: "gamification", element: <PageTransition><GamificationPage /></PageTransition> },
      { path: "shifts", element: <PageTransition><ShiftsPage /></PageTransition> },
      { path: "time-clock", element: <PageTransition><TimeClockPage /></PageTransition> },
      { path: "quarantine", element: <PageTransition><QuarantinePage /></PageTransition> },
      { path: "reviews", element: <PageTransition><ReviewsPage /></PageTransition> },
      { path: "rfm-segments", element: <PageTransition><RfmSegmentsPage /></PageTransition> },
      { path: "cash-flow", element: <PageTransition><CashFlowPage /></PageTransition>, loader: cashFlowLoader },
      { path: "finance/reconciliation", element: <PageTransition><ReconciliationPage /></PageTransition> },
      { path: "what-if-promotion", element: <PageTransition><WhatIfPromotionPage /></PageTransition> },
      { path: "accounting-integration", element: <PageTransition><AccountingIntegrationPage /></PageTransition> },
      { path: "accounts-report", element: <PageTransition><AccountsReportPage /></PageTransition> },
      { path: "category-profitability", element: <PageTransition><CategoryProfitabilityPage /></PageTransition> },
      { path: "break-even", element: <PageTransition><BreakEvenPage /></PageTransition> },
      { path: "partner-api", element: <PageTransition><PartnerApiPage /></PageTransition> },
      { path: "ecommerce-sync", element: <PageTransition><EcommerceSyncPage /></PageTransition> },
      { path: "marketplace-sync", element: <PageTransition><MarketplaceSyncPage /></PageTransition> },
      { path: "marketplace", element: <PageTransition><MarketplacePage /></PageTransition> },
      { path: "smart-pricing", element: <PageTransition><SmartPricingPage /></PageTransition> },
      { path: "carrier-api", element: <PageTransition><CarrierApiPage /></PageTransition> },
      { path: "webhooks", element: <PageTransition><WebhooksPage /></PageTransition> },
      { path: "wordpress-integration", element: <PageTransition><WordPressIntegrationPage /></PageTransition> },
      { path: "mobile-app-simulation", element: <PageTransition><MobileAppSimulationPage /></PageTransition> },
      { path: "bi-integration", element: <PageTransition><BiIntegrationPage /></PageTransition> },
      { path: "franchises", element: <PageTransition><FranchisesPage /></PageTransition> },
      { path: "google-shopping", element: <PageTransition><GoogleShoppingIntegrationPage /></PageTransition> },
      { path: "online-scheduling", element: <PageTransition><OnlineSchedulingPage /></PageTransition> },
      { path: "customer-portal", element: <PageTransition><CustomerPortalPage /></PageTransition> },
      { path: "tech-bench", element: <PageTransition><TechBenchPage /></PageTransition>, loader: techBenchLoader },
      { path: "tech", element: <PageTransition><TechOrderListPage /></PageTransition> },
      { path: "tech/:id", element: <PageTransition><TechOrderDetailPage /></PageTransition> },
      { path: "faq", element: <PageTransition><FaqPage /></PageTransition> },
      { path: "chat-support", element: <PageTransition><ChatSupportPage /></PageTransition> },
      { path: "ar-preview", element: <PageTransition><ARPreviewPage /></PageTransition> },
      { path: "buyback-program", element: <PageTransition><BuybackProgramPage /></PageTransition> },
      { path: "role-permissions", element: <PageTransition><RolePermissionsPage /></PageTransition> },
      { path: "survey-dashboard", element: <PageTransition><SurveyDashboardPage /></PageTransition> },
      { path: "gdpr-tools", element: <PageTransition><GdprToolsPage /></PageTransition> },
      { path: "branch-settings", element: <PageTransition><BranchSettingsPage /></PageTransition> },
      { path: "sandbox", element: <PageTransition><SandboxPage /></PageTransition> },
      { path: "branding", element: <PageTransition><BrandingPage /></PageTransition> },
      { path: "microservices", element: <PageTransition><MicroservicesPage /></PageTransition> },
      { path: "stock-keeper", element: <PageTransition><StockKeeperPage /></PageTransition> },
      { path: "serial-history", element: <PageTransition><SerialHistoryPage /></PageTransition> },
      { path: "my-performance", element: <PageTransition><MyPerformancePage /></PageTransition>, loader: commissionsLoader },
    ],
  }
]);

const queryClient = new QueryClient();

// AQUI ESTÁ A CORREÇÃO CRÍTICA DA ORDEM DOS PROVIDERS
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider> 
          <SoundProvider>
            <InactivityTrackerProvider>
              <WorkspaceProvider>
                <AppContent />
              </WorkspaceProvider>
            </InactivityTrackerProvider>
          </SoundProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AppContent: React.FC = () => {
  const { isLocked } = useInactivityTracker();

  return (
    <GlobalErrorBoundary>
      <BrandingProvider>
        <ProjectThemeProvider>
          <AnimationPreferenceProvider>
            <CartAnimationProvider>
              <CartProvider>
                <NotificationProvider>
                  <Suspense fallback={<SkeletonLoader width="100%" height="100vh" />}>
                    <RouterProvider 
                      router={router} 
                      fallbackElement={<SkeletonLoader width="100%" height="100vh" />}
                    />
                  </Suspense>
                </NotificationProvider>
              </CartProvider>
            </CartAnimationProvider>
          </AnimationPreferenceProvider>
          {isLocked && <LockScreen />}
          <SocketEventHandler />
        </ProjectThemeProvider>
      </BrandingProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
