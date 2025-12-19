import './lib/telemetry.js'; // Initialize OpenTelemetry
import * as Sentry from '@sentry/node';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import errorMiddleware from './middlewares/errorMiddleware.js';
import { xssSanitizer } from './middlewares/sanitizationMiddleware.js';
import { requestLoggerMiddleware } from './middlewares/requestLoggerMiddleware.js';
import chaosMiddleware from './middlewares/chaos/chaos.js';

// Import Listeners
import whatsappListener from './listeners/whatsappListener.js';
import { initSocketListeners } from './listeners/socketEvents.js';
import { initMarketplaceListener } from './listeners/marketplaceListener.js';
import { initNotificationEventListener } from './listeners/notificationEventListener.js';
import marketingAutomationListener from './listeners/marketingAutomationListener.js';

// Import Jobs/Services initialization
import { initCronJobs } from './jobs/cronJobs.js';
import { initWorkers } from './jobs/workers.js';
import { initWhatsapp } from './services/whatsappService.js';

// Initialize event listeners and services
if (process.env.NODE_ENV !== 'test') {
  marketingAutomationListener();
  whatsappListener();
  initSocketListeners();
  initMarketplaceListener();
  initNotificationEventListener();
  initCronJobs();
  initWorkers();
  initWhatsapp();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Sentry Initialization
if (process.env.NODE_ENV !== 'test') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [Sentry.httpIntegration(), new Sentry.Integrations.Express({ app })],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Global Middlewares
app.use(express.json());
app.use(xssSanitizer);
app.use(requestLoggerMiddleware);
app.use(chaosMiddleware);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret_session_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true' },
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = ['http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Root and Uploads
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import Routers
import authRouter from './routes/auth.js';
import auth2faRouter from './routes/auth2fa.js';
import usersRouter from './routes/users.js';
import rolesRouter from './routes/roles.js';
import permissionsRouter from './routes/permissions.js';
import rolePermissionsRouter from './routes/rolePermissions.js';
import branchesRouter from './routes/branches.js';
import categoriesRouter from './routes/categories.js';
import suppliersRouter from './routes/suppliers.js';
import { createProductRouter } from './routes/products.js';
import productKitsRouter from './routes/productKits.js';
import inventoryRouter from './routes/inventory.js';
import stockTransfersRouter from './routes/stockTransfers.js';
import serializedItemsRouter from './routes/serializedItems.js';
import customersRouter from './routes/customers.js';
import customerCommunicationsRouter from './routes/customerCommunications.js';
import customerJourneysRouter from './routes/customerJourneys.js';
import storeCreditRouter from './routes/storeCreditRoutes.js';
import loyaltyRouter from './routes/loyalty.js';
import loyaltyTiersRouter from './routes/loyaltyTiers.js';
import referralsRouter from './routes/referrals.js';
import leadsRouter from './routes/leads.js';
import salesRouter from './routes/sales.js';
import salesGoalsRouter from './routes/salesGoals.js';
import returnItemsRouter from './routes/returnItems.js';
import returnsRouter from './routes/returns.js';
import receiptsRouter from './routes/receipts.js';
import tefRouter from './routes/tef.js';
import pixRouter from './routes/pix.js';
import cashDrawerRouter from './routes/cashDrawer.js';
import serviceOrdersRouter from './routes/serviceOrders.js';
import serviceOrderAttachmentsRouter from './routes/serviceOrderAttachments.js';
import diagnosticNodesRoutes from './routes/diagnosticNodesRoutes.js';
import diagnosticsRouter from './routes/diagnostics.js';
import checklistsRouter from './routes/checklists.js';
import kanbanRouter from './routes/kanban.js';
import activityFeedRouter from './routes/activityFeed.js';
import shiftsRouter from './routes/shifts.js';
import timeClockRouter from './routes/timeClock.js';
import expenseReimbursementsRouter from './routes/expenseReimbursements.js';
import performanceRouter from './routes/performance.js';
import performanceReviewsRouter from './routes/performanceReviews.js';
import gamificationRouter from './routes/gamification.js';
import badgesRouter from './routes/badges.js';
import accountingRouter from './routes/accounting.js';
import financeRouter from './routes/finance.js';
import cashFlowRouter from './routes/cashFlow.js';
import reportsRouter from './routes/reports.js';
import extendedReportsRouter from './routes/extendedReports.js';
import shiftReportsRouter from './routes/shiftReports.js';
import zReportsRouter from './routes/zReports.js';
import pnlReportRouter from './routes/pnlReport.js';
import cogsRouter from './routes/cogs.js';
import clvRouter from './routes/clv.js';
import financialDashboardRouter from './routes/financialDashboard.js';
import whatIfRouter from './routes/whatIf.js';
import dashboardRouter from './routes/dashboard.js';
import userDashboardRouter from './routes/userDashboard.js';
import searchRouter from './routes/search.js';
import notificationsRouter from './routes/notifications.js';
import pushNotificationsRouter from './routes/pushNotifications.js';
import whatsappRouter from './routes/whatsapp.js';
import emailRouter from './routes/templates.js'; // Assuming templates are for emails
import labelsRouter from './routes/labels.js';
import auditRouter from './routes/audit.js';
import backupRouter from './routes/backup.js';
import healthRouter from './routes/health.js';
import sandboxRouter from './routes/sandbox.js';
import settingsRouter from './routes/settings.js';
import brandingRouter from './routes/branding.js';
import marketplaceRouter from './routes/marketplace.js';
import marketplaceConfigRoutes from './routes/marketplaceConfigRoutes.js';
import pricingRuleRoutes from './routes/pricingRuleRoutes.js';
import userKeybindsRouter from './routes/userKeybinds.js';
import ipWhitelistRouter from './routes/ipWhitelist.js';
import { apiKeyRouter, publicApiRouter } from './routes/api.js';
import publicPortalRouter from './routes/publicPortalRoutes.js';
import techAppRouter from './routes/techAppRoutes.js';
import customer360Routes from './routes/customer360Routes.js';
import commissionRulesRoutes from './routes/commissionRulesRoutes.js';
import cycleCountsRouter from './routes/cycleCounts.js';

// Route Mounting
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/auth', auth2faRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/role-permissions', rolePermissionsRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/products', createProductRouter());
app.use('/api/product-kits', productKitsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/stock-transfers', stockTransfersRouter);
app.use('/api/serialized-items', serializedItemsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/customer-communications', customerCommunicationsRouter);
app.use('/api/customer-journeys', customerJourneysRouter);
app.use('/api/store-credit', storeCreditRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/loyalty-tiers', loyaltyTiersRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/sales-goals', salesGoalsRouter);
app.use('/api/return-items', returnItemsRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/tef', tefRouter);
app.use('/api/pix', pixRouter);
app.use('/api/cash-drawer', cashDrawerRouter);
app.use('/api/service-orders', serviceOrdersRouter);
app.use('/api/service-order-attachments', serviceOrderAttachmentsRouter);
app.use('/api/diagnostic-nodes', diagnosticNodesRoutes);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/kanban', kanbanRouter);
app.use('/api/activity-feed', activityFeedRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/time-clock', timeClockRouter);
app.use('/api/expense-reimbursements', expenseReimbursementsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/performance-reviews', performanceReviewsRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/finance', financeRouter);
app.use('/api/cash-flow', cashFlowRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/reports', extendedReportsRouter);
app.use('/api/shift-reports', shiftReportsRouter);
app.use('/api/reports/z-report', zReportsRouter);
app.use('/api/reports/pnl', pnlReportRouter);
app.use('/api/cogs', cogsRouter);
app.use('/api/clv', clvRouter);
app.use('/api/financial-dashboard', financialDashboardRouter);
app.use('/api/what-if', whatIfRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/user-dashboard', userDashboardRouter);
app.use('/api/search', searchRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/push', pushNotificationsRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/templates', emailRouter);
app.use('/api/labels', labelsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/backup', backupRouter);
app.use('/api/health', healthRouter);
app.use('/api/sandbox', sandboxRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/branding', brandingRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/admin/marketplace', marketplaceConfigRoutes);
app.use('/api/admin/pricing', pricingRuleRoutes);
app.use('/api/user-keybinds', userKeybindsRouter);
app.use('/api/ip-whitelist', ipWhitelistRouter);
app.use('/api/dev', apiKeyRouter);
app.use('/public-api', publicApiRouter);
app.use('/api/portal', publicPortalRouter);
app.use('/api/tech', techAppRouter);
app.use('/api/customer360', customer360Routes);
app.use('/api/commission-rules', commissionRulesRoutes);
app.use('/api/cycle-counts', cycleCountsRouter);

// Swagger UI
const swaggerDocument = YAML.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Socket.IO
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Error handlers
if (process.env.NODE_ENV !== 'test') {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorMiddleware);

export { app, httpServer, io };