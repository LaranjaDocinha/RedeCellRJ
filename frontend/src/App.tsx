import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AnimationPreferenceProvider } from './contexts/AnimationPreferenceContext';
import { AnimationProvider as CartAnimationProvider } from './contexts/CartAnimationContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BrandingProvider } from './contexts/BrandingContext'; // Import BrandingProvider
import { ProductComparisonBar } from './components/ProductComparisonBar'; // Import ProductComparisonBar

// Lazy load pages
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ProductFormPage = lazy(() => import('./pages/ProductFormPage')); // Import new form page
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const SalesHistoryPage = lazy(() => import('./pages/POS/SalesHistoryPage')); // Added SalesHistoryPage
const KanbanPage = lazy(() => import('./pages/KanbanPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const PnlReportPage = lazy(() => import('./pages/Reports/PnlReportPage'));
const CustomerDetailPage = lazy(() => import('./pages/CustomerDetailPage')); // Keep lazy for page component itself
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const TagsPage = lazy(() => import('./pages/TagsPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const PermissionsPage = lazy(() => import('./pages/PermissionsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage')); // Adicionado ProductCatalogPage
const ProductComparisonPage = lazy(() => import('./pages/ProductComparisonPage')); // Adicionado ProductComparisonPage
// const SettingsPage = require('./pages/SettingsPage').default; // Temporarily disable lazy loading for debugging
const DiscountsPage = lazy(() => import('./pages/DiscountsPage'));
const CouponsPage = lazy(() => import('./pages/CouponsPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const LoyaltyTiersPage = lazy(() => import('./pages/LoyaltyTiersPage'));
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage')); // Added LoyaltyPage
const ProductKitsPage = lazy(() => import('./pages/ProductKitsPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage')); // New: Templates Page
const WhatsAppTemplatesPage = lazy(() => import('./pages/WhatsAppTemplatesPage')); // Adicionado WhatsAppTemplatesPage
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage')); // Adicionado SystemHealthPage
const CustomizableDashboard = lazy(() => import('./pages/CustomizableDashboard')); // Adicionado CustomizableDashboard
const LeadsPage = lazy(() => import('./pages/LeadsPage')); // Adicionado LeadsPage
const RuleEnginePage = lazy(() => import('./pages/RuleEnginePage')); // Adicionado RuleEnginePage
const ReferralPage = lazy(() => import('./pages/ReferralPage')); // Moved from below

const RfmSegmentsPage = lazy(() => import('./pages/RfmSegmentsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CustomerWalletPage = lazy(() => import('./pages/CustomerWalletPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const ShiftsPage = lazy(() => import('./pages/ShiftsPage'));
const PerformanceReviewsPage = lazy(() => import('./pages/PerformanceReviewsPage'));
const TimeClockPage = lazy(() => import('./pages/TimeClockPage'));
const ExpenseReimbursementsPage = lazy(() => import('./pages/ExpenseReimbursementsPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ServiceOrderDetailPage = lazy(() => import('./pages/ServiceOrderDetailPage'));
const MyPerformancePage = lazy(() => import('./pages/MyPerformancePage'));
const CashFlowPage = lazy(() => import('./pages/CashFlowPage'));
const WhatIfPromotionPage = lazy(() => import('./pages/WhatIfPromotionPage'));
const AccountingIntegrationPage = lazy(() => import('./pages/AccountingIntegrationPage'));
const AccountsReportPage = lazy(() => import('./pages/AccountsReportPage'));
const CategoryProfitabilityPage = lazy(() => import('./pages/CategoryProfitabilityPage'));
const BreakEvenPage = lazy(() => import('./pages/BreakEvenPage'));
const PartnerApiPage = lazy(() => import('./pages/PartnerApiPage'));
const EcommerceSyncPage = lazy(() => import('./pages/EcommerceSyncPage'));
const MarketplaceSyncPage = lazy(() => import('./pages/MarketplaceSyncPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage')); // Adicionado MarketplacePage
const SmartPricingPage = lazy(() => import('./pages/SmartPricingPage')); // Adicionado SmartPricingPage
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
const GdprToolsPage = lazy(() => import('./pages/GdprToolsPage'));
const BranchSettingsPage = lazy(() => import('./pages/BranchSettingsPage'));
const SandboxPage = lazy(() => import('./pages/SandboxPage'));
const BrandingPage = lazy(() => import('./pages/BrandingPage'));
const MicroservicesPage = lazy(() => import('./pages/MicroservicesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ServiceOrdersPage = lazy(() => import('./pages/ServiceOrdersPage'));
const CustomerDisplayPage = lazy(() => import('./pages/CustomerDisplayPage'));
const AdminAuditPage = lazy(() => import('./pages/AdminAuditPage'));
const SerialHistoryPage = lazy(() => import('./pages/SerialHistoryPage'));
const StockKeeperPage = lazy(() => import('./pages/StockKeeperPage')); // Added StockKeeperPage

import AppLayout from './components/AppLayout';
import { useAuth } from './contexts/AuthContext';
import Loading from './components/Loading';
import PageTransition from './components/PageTransition';
import SkeletonLoader from './components/SkeletonLoader';

import { customerDetailLoader } from './routerLoaders'; // Import the loader

// Componente para proteger rotas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const SurveyPage = lazy(() => import('./pages/SurveyPage'));
const SurveyDashboardPage = lazy(() => import('./pages/SurveyDashboardPage'));

const CustomerPortalAuthPage = lazy(() => import('./pages/CustomerPortalAuthPage'));
const CustomerPortalTrackingPage = lazy(() => import('./pages/CustomerPortalTrackingPage'));
const TechOrderListPage = lazy(() => import('./pages/TechOrderListPage'));
const TechOrderDetailPage = lazy(() => import('./pages/TechOrderDetailPage'));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/survey",
    element: <SurveyPage />,
  },
  {
    path: "/customer-display",
    element: <CustomerDisplayPage />,
  },
  // ROTAS DO PORTAL DO CLIENTE (PÚBLICAS)
  {
    path: "/portal/auth",
    element: <Suspense fallback={<SkeletonLoader width="100%" height="100vh" />}><CustomerPortalAuthPage /></Suspense>,
  },
  {
    path: "/portal/:token",
    element: <Suspense fallback={<SkeletonLoader width="100%" height="100vh" />}><CustomerPortalTrackingPage /></Suspense>,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,

// ... (other imports)

    children: [
      { path: "/dashboard", element: <PageTransition><DashboardPage /></PageTransition> },
      { path: "/pos", element: <PageTransition><POSPage /></PageTransition> },
      { path: "/pos/sales-history", element: <PageTransition><SalesHistoryPage /></PageTransition> }, // Added SalesHistoryPage route
      { path: "/tech", element: <PageTransition><TechOrderListPage /></PageTransition> }, // Tech App list page
      { path: "/tech/:id", element: <PageTransition><TechOrderDetailPage /></PageTransition> }, // Tech App detail page
      { path: "/kanban", element: <PageTransition><KanbanPage /></PageTransition> },
      { path: "/orders", element: <PageTransition><OrdersPage /></PageTransition> },
      { path: "/products", element: <PageTransition><ProductListPage /></PageTransition> },
      { path: "/product-catalog", element: <PageTransition><ProductCatalogPage /></PageTransition> },
      { path: "/products/new", element: <PageTransition><ProductFormPage /></PageTransition> },
      { path: "/products/:id", element: <PageTransition><ProductDetailPage /></PageTransition> },
      { path: "/products/compare", element: <PageTransition><ProductComparisonPage /></PageTransition> },
      { path: "/inventory", element: <PageTransition><InventoryPage /></PageTransition> },
      { path: "/reports", element: <PageTransition><ReportsPage /></PageTransition> },
      { path: "/customers", element: <PageTransition><CustomersPage /></PageTransition> },
      { path: "/customers/:id", element: <PageTransition><CustomerDetailPage /></PageTransition>, loader: customerDetailLoader },
      { path: "/categories", element: <PageTransition><CategoriesPage /></PageTransition> },
      { path: "/tags", element: <PageTransition><TagsPage /></PageTransition> },
      { path: "/suppliers", element: <PageTransition><SuppliersPage /></PageTransition> },
      { path: "/roles", element: <PageTransition><RolesPage /></PageTransition> },
      { path: "/permissions", element: <PageTransition><PermissionsPage /></PageTransition> },
      { path: "/users", element: <PageTransition><UsersPage /></PageTransition> },
      { path: "/audit-logs", element: <PageTransition><AdminAuditPage /></PageTransition> },
      { path: "/settings", element: <PageTransition><SettingsPage /></PageTransition> },
      { path: "/discounts", element: <PageTransition><DiscountsPage /></PageTransition> },
      { path: "/coupons", element: <PageTransition><CouponsPage /></PageTransition> },
      { path: "/returns", element: <PageTransition><ReturnsPage /></PageTransition> },
      { path: "/loyalty", element: <PageTransition><LoyaltyPage /></PageTransition> }, // Added LoyaltyPage route
      { path: "/loyalty-tiers", element: <PageTransition><LoyaltyTiersPage /></PageTransition> },
      { path: "/leads", element: <PageTransition><LeadsPage /></PageTransition> }, // Nova rota Leads Page
      { path: "/product-kits", element: <PageTransition><ProductKitsPage /></PageTransition> },
      { path: "/purchase-orders", element: <PageTransition><PurchaseOrdersPage /></PageTransition> },
      { path: "/branches", element: <PageTransition><BranchesPage /></PageTransition> },
      { path: "/placeholder", element: <PageTransition><PlaceholderPage /></PageTransition> },
      { path: "/templates", element: <PageTransition><TemplatesPage /></PageTransition> },
      { path: "/whatsapp-templates", element: <PageTransition><WhatsAppTemplatesPage /></PageTransition> }, // Nova rota WhatsAppTemplates
      { path: "/system-health", element: <PageTransition><SystemHealthPage /></PageTransition> }, // Nova rota SystemHealth
      { path: "/custom-dashboard", element: <PageTransition><CustomizableDashboard /></PageTransition> }, // Nova rota Customizable Dashboard
      { path: "/referrals", element: <PageTransition><ReferralPage /></PageTransition> },
      { path: "customers/:customerId/wallet", element: <PageTransition><CustomerWalletPage /></PageTransition> },
      { path: "gamification", element: <PageTransition><GamificationPage /></PageTransition> },
      { path: "shifts", element: <PageTransition><ShiftsPage /></PageTransition> },
      { path: "performance-reviews", element: <PageTransition><PerformanceReviewsPage /></PageTransition> },
      { path: "/reviews", element: <PageTransition><PerformanceReviewsPage /></PageTransition> }, // Added route for /reviews
      { path: "time-clock", element: <PageTransition><TimeClockPage /></PageTransition> },
      { path: "/rfm-segments", element: <PageTransition><RfmSegmentsPage /></PageTransition> }, // Added route for /rfm-segments
      { path: "expense-reimbursements", element: <PageTransition><ExpenseReimbursementsPage /></PageTransition> },
      { path: "onboarding", element: <PageTransition><OnboardingPage /></PageTransition> },
      { path: "/service-orders", element: <PageTransition><ServiceOrdersPage /></PageTransition> },
      { path: "service-orders/:id", element: <PageTransition><ServiceOrderDetailPage /></PageTransition> },
      { path: "my-performance", element: <PageTransition><MyPerformancePage /></PageTransition> },
      { path: "cash-flow", element: <PageTransition><CashFlowPage /></PageTransition> },
      { path: "what-if-promotion", element: <PageTransition><WhatIfPromotionPage /></PageTransition> },
      { path: "accounting-integration", element: <PageTransition><AccountingIntegrationPage /></PageTransition> },
      { path: "accounts-report", element: <PageTransition><AccountsReportPage /></PageTransition> },
      { path: "reports/pnl", element: <PageTransition><PnlReportPage /></PageTransition> },
      { path: "category-profitability", element: <PageTransition><CategoryProfitabilityPage /></PageTransition> },
      { path: "break-even", element: <PageTransition><BreakEvenPage /></PageTransition> },
      { path: "partner-api", element: <PageTransition><PartnerApiPage /></PageTransition> },
      { path: "ecommerce-sync", element: <PageTransition><EcommerceSyncPage /></PageTransition> },
      { path: "marketplace-sync", element: <PageTransition><MarketplaceSyncPage /></PageTransition> },
      { path: "marketplace", element: <PageTransition><MarketplacePage /></PageTransition> }, // Nova rota Marketplace
      { path: "smart-pricing", element: <PageTransition><SmartPricingPage /></PageTransition> }, // Nova rota Smart Pricing
      { path: "carrier-api", element: <PageTransition><CarrierApiPage /></PageTransition> },
      { path: "webhooks", element: <PageTransition><WebhooksPage /></PageTransition> },
      { path: "wordpress-integration", element: <PageTransition><WordPressIntegrationPage /></PageTransition> },
      { path: "mobile-app-simulation", element: <PageTransition><MobileAppSimulationPage /></PageTransition> },
      { path: "bi-integration", element: <PageTransition><BiIntegrationPage /></PageTransition> },
      { path: "franchises", element: <PageTransition><FranchisesPage /></PageTransition> },
      { path: "google-shopping-integration", element: <PageTransition><GoogleShoppingIntegrationPage /></PageTransition> },
      { path: "online-scheduling", element: <PageTransition><OnlineSchedulingPage /></PageTransition> },
      { path: "/customer-portal", element: <PageTransition><CustomerPortalPage /></PageTransition> },
      { path: "/faqs", element: <PageTransition><FaqPage /></PageTransition> },
      { path: "/rules-engine", element: <PageTransition><RuleEnginePage /></PageTransition> }, // Nova rota Rule Engine
      { path: "/chat-support", element: <PageTransition><ChatSupportPage /></PageTransition> },
      { path: "ar-preview", element: <PageTransition><ARPreviewPage /></PageTransition> },
      { path: "buyback-program", element: <PageTransition><BuybackProgramPage /></PageTransition> },
      { path: "role-permissions", element: <PageTransition><RolePermissionsPage /></PageTransition> },
      { path: "survey-dashboard", element: <PageTransition><SurveyDashboardPage /></PageTransition> },
      { path: "gdpr-tools", element: <PageTransition><GdprToolsPage /></PageTransition> },
      { path: "branch-settings", element: <PageTransition><BranchSettingsPage /></PageTransition> },
      { path: "sandbox", element: <PageTransition><SandboxPage /></PageTransition> },
      { path: "branding", element: <PageTransition><BrandingPage /></PageTransition> },
      { path: "microservices", element: <PageTransition><MicroservicesPage /></PageTransition> },
      { path: "/serial-history", element: <PageTransition><SerialHistoryPage /></PageTransition> },
      { path: "/stock-keeper", element: <PageTransition><StockKeeperPage /></PageTransition> }, // Added route
    ],
  },
]);

import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { InactivityTrackerProvider, useInactivityTracker } from './contexts/InactivityTrackerContext';
import LockScreen from './components/LockScreen';
import { SoundProvider } from './contexts/SoundContext';

function App() {
  return (
    <SoundProvider>
      <InactivityTrackerProvider>
        <AppContent />
      </InactivityTrackerProvider>
    </SoundProvider>
  );
}

const AppContent: React.FC = () => {
  const { isLocked } = useInactivityTracker();

  return (
    <ThemeProvider>
      <AnimationPreferenceProvider>
        <CartAnimationProvider>
          <CartProvider>
            <Suspense fallback={<SkeletonLoader width="100%" height="100vh" />}>
              <NotificationProvider>
                <BrandingProvider> {/* Wrap with BrandingProvider */} 
                  <SocketProvider>
                    <RouterProvider router={router} />
                  </SocketProvider>
                </BrandingProvider>
              </NotificationProvider>
            </Suspense>
          </CartProvider>
        </CartAnimationProvider>
      </AnimationPreferenceProvider>
      {isLocked && <LockScreen />}
      <ProductComparisonBar /> {/* Add ProductComparisonBar here */}
    </ThemeProvider>
  );
};

export default App;
