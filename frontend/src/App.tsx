
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Lazy load pages
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const KanbanPage = lazy(() => import('./pages/KanbanPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage')); // Lazy load CustomersPage
const CategoriesPage = lazy(() => import('./pages/CategoriesPage')); // Lazy load CategoriesPage
const TagsPage = lazy(() => import('./pages/TagsPage')); // Lazy load TagsPage
const SuppliersPage = lazy(() => import('./pages/SuppliersPage')); // Lazy load SuppliersPage
const RolesPage = lazy(() => import('./pages/RolesPage')); // Lazy load RolesPage
const PermissionsPage = lazy(() => import('./pages/PermissionsPage')); // Lazy load PermissionsPage
const UsersPage = lazy(() => import('./pages/UsersPage')); // Lazy load UsersPage
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage')); // Lazy load AuditLogsPage
const SettingsPage = lazy(() => import('./pages/SettingsPage')); // Lazy load SettingsPage
const DiscountsPage = lazy(() => import('./pages/DiscountsPage')); // Lazy load DiscountsPage
const CouponsPage = lazy(() => import('./pages/CouponsPage')); // Lazy load CouponsPage
const ReturnsPage = lazy(() => import('./pages/ReturnsPage')); // Lazy load ReturnsPage
const LoyaltyTiersPage = lazy(() => import('./pages/LoyaltyTiersPage')); // Lazy load LoyaltyTiersPage
const ProductKitsPage = lazy(() => import('./pages/ProductKitsPage')); // Lazy load ProductKitsPage
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage')); // Lazy load PurchaseOrdersPage
const BranchesPage = lazy(() => import('./pages/BranchesPage')); // Lazy load BranchesPage

import AppLayout from './components/AppLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import Loading from './components/Loading';
import PageTransition from './components/PageTransition';
import SkeletonLoader from './components/SkeletonLoader';
import GuidedTour from './components/GuidedTour';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider
import { io } from 'socket.io-client'; // Import socket.io-client
import { RealtimeNotification } from './components/RealtimeNotification'; // Import RealtimeNotification

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

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <PageTransition><p>Welcome to RedecellRJ POS!</p></PageTransition> },
      { path: "products", element: <PageTransition><ProductListPage /></PageTransition> },
      { path: "products/:id", element: <PageTransition><ProductDetailPage /></PageTransition> },
      { path: "dashboard", element: <PageTransition><DashboardPage /></PageTransition> },
      { path: "pos", element: <PageTransition><POSPage /></PageTransition> },
      { path: "kanban", element: <PageTransition><KanbanPage /></PageTransition> },
      { path: "inventory", element: <PageTransition><InventoryPage /></PageTransition> },
      { path: "reports", element: <PageTransition><ReportsPage /></PageTransition> },
      { path: "customers", element: <PageTransition><CustomersPage /></PageTransition> }, // Add CustomersPage route
      { path: "categories", element: <PageTransition><CategoriesPage /></PageTransition> }, // Add CategoriesPage route
      { path: "tags", element: <PageTransition><TagsPage /></PageTransition> },
      { path: "suppliers", element: <PageTransition><SuppliersPage /></PageTransition> }, // Add SuppliersPage route
      { path: "roles", element: <PageTransition><RolesPage /></PageTransition> }, // Add RolesPage route
      { path: "permissions", element: <PageTransition><PermissionsPage /></PageTransition> }, // Add PermissionsPage route
      { path: "users-management", element: <PageTransition><UsersPage /></PageTransition> }, // Add UsersPage route
      { path: "audit-logs", element: <PageTransition><AuditLogsPage /></PageTransition> }, // Add AuditLogsPage route
      { path: "settings", element: <PageTransition><SettingsPage /></PageTransition> }, // Add SettingsPage route
      { path: "discounts", element: <PageTransition><DiscountsPage /></PageTransition> }, // Add DiscountsPage route
      { path: "coupons", element: <PageTransition><CouponsPage /></PageTransition> }, // Add CouponsPage route
      { path: "returns", element: <PageTransition><ReturnsPage /></PageTransition> }, // Add ReturnsPage route
      { path: "loyalty-tiers", element: <PageTransition><LoyaltyTiersPage /></PageTransition> }, // Add LoyaltyTiersPage route
      { path: "product-kits", element: <PageTransition><ProductKitsPage /></PageTransition> }, // Add ProductKitsPage route
      { path: "purchase-orders", element: <PageTransition><PurchaseOrdersPage /></PageTransition> }, // Add PurchaseOrdersPage route
      { path: "branches", element: <PageTransition><BranchesPage /></PageTransition> } // Add BranchesPage route
    ],
  },
]);

const dashboardTourSteps = [
  // ... (tour steps remain the same)
];

function App() {
  const { isAuthenticated } = useAuth();
  const { addToast } = useNotification(); // Get addToast from NotificationProvider
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000'); // Connect to your backend Socket.IO server

    socket.on('newOrderNotification', (data) => {
      setNotification({ message: `New Order: ${data.orderId} - ${data.message}`, type: 'success' });
      addToast(`New Order: ${data.orderId} - ${data.message}`, 'success');
    });

    socket.on('lowStockNotification', (data) => {
      setNotification({ message: `Low Stock: Product ${data.productId}, Variation ${data.variationId} - ${data.currentStock} units (Threshold: ${data.threshold})`, type: 'warning' });
      addToast(`Low Stock: Product ${data.productId}, Variation ${data.variationId} - ${data.currentStock} units (Threshold: ${data.threshold})`, 'warning');
    });

    return () => {
      socket.disconnect();
    };
  }, [addToast]);

  return (
    <Suspense fallback={<SkeletonLoader width="100%" height="100vh" />}>
      <RouterProvider router={router} />
      {isAuthenticated && (
        <GuidedTour tourKey="dashboardTour" steps={dashboardTourSteps} />
      )}
      {notification && (
        <RealtimeNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Suspense>
  );
}

export default App;
