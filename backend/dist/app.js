import './lib/telemetry.js'; // Initialize OpenTelemetry
import * as Sentry from '@sentry/node';
import express from 'express';
import http from 'http'; // Import http
import { Server } from 'socket.io'; // Import Server from socket.io
import 'dotenv/config';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import errorMiddleware from './middlewares/errorMiddleware.js';
import marketingAutomationListener from './listeners/marketingAutomationListener.js';
import maintenanceMiddleware from './middlewares/maintenanceMiddleware.js';
import chaosMiddleware from './middlewares/chaos/chaos.js';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';
// Initialize event listeners
marketingAutomationListener();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = http.createServer(app); // Create HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173'], // Allow frontend origins
        methods: ['GET', 'POST'],
    },
});
// Sentry Initialization (Conditional for test environment)
if (process.env.NODE_ENV !== 'test') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [Sentry.httpIntegration(), new Sentry.Integrations.Express({ app })],
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development',
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(maintenanceMiddleware);
}
app.use(express.json());
app.use(helmet());
// Chaos Engineering Middleware (disabled by default)
app.use(chaosMiddleware);
const allowedOrigins = ['http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret_session_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true' },
}));
// GraphQL Setup
async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await server.start();
    server.applyMiddleware({ app: app, path: '/graphql' });
}
startApolloServer();
// Import routers after app initialization
import accountingRouter from './routes/accounting.js';
import assetsRouter from './routes/assets.js';
import auditRouter from './routes/audit.js';
import authRouter from './routes/auth.js';
import branchesRouter from './routes/branches.js';
import categoriesRouter from './routes/categories.js';
import checklistsRouter from './routes/checklists.js';
import contractRoutes from './routes/contractRoutes.js';
import couponsRouter from './routes/coupons.js';
import commissionRulesRoutes from './routes/commissionRulesRoutes.js';
import customerCommunicationsRouter from './routes/customerCommunications.js';
import customersRouter from './routes/customers.js';
import storeCreditRouter from './routes/storeCreditRoutes.js';
import customer360Routes from './routes/customer360Routes.js';
import brandingRouter from './routes/branding.js'; // Import new branding router
import cycleCountsRouter from './routes/cycleCounts.js';
import dashboardRouter from './routes/dashboard.js';
import diagnosticNodesRoutes from './routes/diagnosticNodesRoutes.js';
import diagnosticsRouter from './routes/diagnostics.js';
import discountsRouter from './routes/discounts.js';
import ecommerceRouter from './routes/ecommerce.js';
import extendedReportsRouter from './routes/extendedReports.js';
import financeRouter from './routes/finance.js';
import gamificationRouter from './routes/gamification.js';
import ifixitRouter from './routes/ifixit.js';
import inventoryRouter from './routes/inventory.js';
import kanbanRouter from './routes/kanban.js';
import knowledgeBaseRouter from './routes/knowledgeBase.js';
import loyaltyRouter from './routes/loyalty.js';
import loyaltyTiersRouter from './routes/loyaltyTiers.js';
import meRouter from './routes/me.js';
import partsRouter from './routes/parts.js';
import partSuppliersRouter from './routes/partSuppliers.js';
import paymentRouter from './routes/payment.js';
import permissionsRouter from './routes/permissions.js';
import productKitsRouter from './routes/productKits.js';
import { createProductRouter } from './routes/products.js';
import publicProductsRouter from './routes/publicProducts.js';
import purchaseOrdersRouter from './routes/purchaseOrders.js';
import quotesRouter from './routes/quotes.js';
import recommendationsRouter from './routes/recommendations.js';
import reportsRouter from './routes/reports.js';
import returnItemsRouter from './routes/returnItems.js';
import returnsRouter from './routes/returns.js';
import reviewsRouter from './routes/reviews.js';
import rolesRouter from './routes/roles.js';
import salesRouter from './routes/sales.js';
import salesGoalsRouter from './routes/salesGoals.js';
import searchRouter from './routes/search.js';
import serializedItemsRouter from './routes/serializedItems.js';
import serviceOrderAttachmentsRouter from './routes/serviceOrderAttachments.js';
import serviceOrdersRouter from './routes/serviceOrders.js';
import settingsRouter from './routes/settings.js';
import stockTransfersRouter from './routes/stockTransfers.js';
import suppliersRouter from './routes/suppliers.js';
import surveysRouter from './routes/surveys.js';
import tagsRouter from './routes/tags.js';
import uploadsRouter from './routes/uploads.js';
import userDashboardRouter from './routes/userDashboard.js';
import { usersRouter } from './routes/users.js';
import rfmRouter from './routes/rfm.js';
import marketingAutomationsRouter from './routes/marketingAutomations.js';
import referralsRouter from './routes/referrals.js';
import shiftsRouter from './routes/shifts.js';
import performanceReviewsRouter from './routes/performanceReviews.js';
import timeClockRouter from './routes/timeClock.js';
import expenseReimbursementsRouter from './routes/expenseReimbursements.js';
import onboardingRouter from './routes/onboarding.js';
import activityFeedRouter from './routes/activityFeed.js';
import performanceRouter from './routes/performance.js';
import cashFlowRouter from './routes/cashFlow.js';
import whatIfRouter from './routes/whatIf.js';
import cogsRouter from './routes/cogs.js';
import clvRouter from './routes/clv.js';
import financialDashboardRouter from './routes/financialDashboard.js';
import backupRouter from './routes/backup.js';
import healthRouter from './routes/health.js';
import sandboxRouter from './routes/sandbox.js';
import templatesRouter from './routes/templates.js';
import gdprRouter from './routes/gdpr.js';
import rolePermissionsRouter from './routes/rolePermissions.js';
import pnlReportRouter from './routes/pnlReport.js';
import maintenanceRouter from './routes/maintenance.js';
import badgesRouter from './routes/badges.js';
import mobileAppRouter from './routes/mobileApp.js'; // Import new mobile app router
import pixRouter from './routes/pix.js'; // Import pix router
import whatsappRouter from './routes/whatsapp.js'; // Import whatsapp router
import tefRouter from './routes/tef.js'; // Import tef router
import receiptsRouter from './routes/receipts.js'; // Import receipts router
import cashDrawerRouter from './routes/cashDrawer.js'; // Import cash drawer router
import shiftReportsRouter from './routes/shiftReports.js'; // Import shift reports router
import zReportsRouter from './routes/zReports.js'; // Import Z-Reports router
app.get('/', (req, res) => {
    res.send('Backend do Gerenciador de Loja de Celulares no ar!');
});
app.get('/test-route', (req, res) => res.send('Test route works!'));
// Standardized API routes
app.use('/api/accounting', accountingRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/branding', brandingRouter); // Use new branding router
app.use('/api/auth', authRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/contracts', contractRoutes);
app.use('/api/coupons', couponsRouter);
app.use('/api/customer-communications', customerCommunicationsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/store-credit', storeCreditRouter);
app.use('/api/cycle-counts', cycleCountsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/diagnostic-nodes', diagnosticNodesRoutes);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/ecommerce', ecommerceRouter);
app.use('/api/extended-reports', extendedReportsRouter);
app.use('/api/finance', financeRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/ifixit', ifixitRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/kanban', kanbanRouter);
app.use('/api/kb', knowledgeBaseRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/loyalty-tiers', loyaltyTiersRouter);
app.use('/api/me', meRouter);
app.use('/api/parts', partsRouter);
app.use('/api/part-suppliers', partSuppliersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/product-kits', productKitsRouter);
app.use('/api/products', createProductRouter());
app.use('/api/public/products', publicProductsRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/return-items', returnItemsRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/sales-goals', salesGoalsRouter);
app.use('/api/search', searchRouter);
app.use('/api/serialized-items', serializedItemsRouter);
app.use('/api/service-orders', serviceOrdersRouter);
app.use('/api/service-order-attachments', serviceOrderAttachmentsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stock-transfers', stockTransfersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/surveys', surveysRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/user-dashboard', userDashboardRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/backup', backupRouter);
app.use('/api/health', healthRouter);
app.use('/api/sandbox', sandboxRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/gdpr', gdprRouter);
app.use('/api/rbac', rolePermissionsRouter);
app.use('/api/pnl-report', pnlReportRouter);
app.use('/api/users', usersRouter);
app.use('/api/mobile-app', mobileAppRouter); // Use new mobile app router
app.use('/api/pix', pixRouter); // Use pix router
app.use('/api/whatsapp', whatsappRouter); // Use whatsapp router
app.use('/api/tef', tefRouter); // Use tef router
app.use('/api/receipts', receiptsRouter); // Use receipts router
app.use('/api/cash-drawer', cashDrawerRouter); // Use cash drawer router
app.use('/api/shift-reports', shiftReportsRouter); // Use shift reports router
app.use('/api/reports/z-report', zReportsRouter); // Use Z-Reports router
app.use('/api', commissionRulesRoutes);
app.use('/api', customer360Routes);
app.use('/api/rfm', rfmRouter);
app.use('/api/marketing-automations', marketingAutomationsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/performance-reviews', performanceReviewsRouter);
app.use('/api/time-clock', timeClockRouter);
app.use('/api/expense-reimbursements', expenseReimbursementsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/activity-feed', activityFeedRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/cash-flow', cashFlowRouter);
app.use('/api/what-if', whatIfRouter);
app.use('/api/cogs', cogsRouter);
app.use('/api', clvRouter);
app.use('/api', financialDashboardRouter);
// Swagger UI
const swaggerDocument = YAML.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
});
if (process.env.NODE_ENV !== 'test') {
    app.use(Sentry.Handlers.errorHandler());
}
app.use(errorMiddleware);
app.use((err, req, res) => {
    const sentryId = res.sentry;
    res.statusCode = 500;
    res.end(sentryId ? sentryId + '\n' : 'Internal Server Error');
});
export { app, httpServer, io };
