import './lib/telemetry.js'; // Initialize OpenTelemetry
import * as Sentry from '@sentry/node';
import express, { Router, Request, Response, NextFunction } from 'express';
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
import crypto from 'crypto';
import compression from 'compression';

import errorMiddleware from './middlewares/errorMiddleware.js';
import { xssSanitizer } from './middlewares/sanitizationMiddleware.js';
import { requestLoggerMiddleware } from './middlewares/requestLoggerMiddleware.js';
import { performanceTracer } from './middlewares/performanceTracer.js'; // Import tracer
import chaosMiddleware from './middlewares/chaos/chaos.js';
import { idempotencyMiddleware } from './middlewares/idempotency.js';

// Import Listeners
import { initSocketListeners } from './listeners/socketEvents.js';
import { initMarketplaceListener } from './listeners/marketplaceListener.js';
import { initNotificationEventListener } from './listeners/notificationEventListener.js';
import { initSystemNotificationListener } from './listeners/systemNotificationListener.js';
import marketingAutomationListener from './listeners/marketingAutomationListener.js';

// Import Jobs/Services initialization
import { initCronJobs } from './jobs/cronJobs.js';
import { initWorkers } from './jobs/workers.js';

// Import Routers
import partsRouter from './routes/parts.js';
import compatibilityRouter from './routes/compatibility.js';
import authRouter from './routes/auth.js';
import auth2faRouter from './routes/auth2fa.js';
import { usersRouter } from './routes/users.js';
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
// import storeCreditRouter from './routes/storeCreditRoutes.js'; // REMOVED: File not found
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
import financeRouter from './routes/financeRoutes.js';
import cashFlowRouter from './routes/cashFlow.js';
import shiftReportsRouter from './routes/shiftReports.js';
import reportsRouter from './routes/reports.js';
import whatIfRouter from './routes/whatIf.js';
import dashboardRouter from './routes/dashboard.js';
import executiveDashboardRouter from './routes/executiveDashboard.js';
import userDashboardRouter from './routes/userDashboard.js';
import searchRouter from './routes/search.js';
import notificationsRouter from './routes/notifications.js';
import pushNotificationsRouter from './routes/pushNotifications.js';
import whatsappRouter from './routes/whatsapp.js';
import emailRouter from './routes/templates.js';
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
import tagsRouter from './routes/tags.js';
import accountsRouter from './routes/accounts.js';
import userKeybindsRouter from './routes/userKeybinds.js';
import ipWhitelistRouter from './routes/ipWhitelist.js';
import { apiKeyRouter, publicApiRouter } from './routes/api.js';
import publicPortalRouter from './routes/publicPortalRoutes.js';
import techAppRouter from './routes/techAppRoutes.js';
import aiDiagnosticRouter from './routes/aiDiagnosticRoutes.js';
import deliveryRouter from './routes/deliveryRoutes.js';
import printRouter from './routes/printRoutes.js';
import rmaRouter from './routes/rmaRoutes.js';
import customer360Routes from './routes/customer360Routes.js';
import commissionRulesRoutes from './routes/commissionRulesRoutes.js';
import cycleCountsRouter from './routes/cycleCounts.js';
import couponsRouter from './routes/coupons.js';
import quarantineRouter from './routes/quarantine.js';
import reviewsRouter from './routes/reviews.js';
import discountsRouter from './routes/discounts.js';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { badgeQueue, rfmQueue, whatsappQueue, defaultQueue } from './jobs/queue.js';

// Initialize event listeners and services
if (process.env.NODE_ENV !== 'test') {
  marketingAutomationListener();
  initMarketplaceListener();
  initNotificationEventListener();
  initSystemNotificationListener();
  initCronJobs();
  initWorkers();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(compression());
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket Listeners after io is created
if (process.env.NODE_ENV !== 'test') {
  initSocketListeners(io);
}

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

// Generate nonce for CSP
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Global Middlewares
app.use(performanceTracer);
app.use(express.json());
app.use(xssSanitizer);
app.use(requestLoggerMiddleware);
app.use(idempotencyMiddleware); // Idempotency check before business logic
app.use(chaosMiddleware); // Chaos monkey injection
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
        scriptSrc: [
          "'self'",
          // Allow scripts with the correct nonce
          (req: any, res: any) => `'nonce-${res.locals.nonce}'`,
          // Note: unsafe-inline is still often needed for libraries that inject styles/scripts dynamically
          // ideally we should remove it, but for now we keep it to prevent breaking the UI
          "'unsafe-inline'",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:3001', 'ws://localhost:3001', 'https://api.redecellrj.com.br'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
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

// Bull Board Setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

if (badgeQueue && rfmQueue && whatsappQueue && defaultQueue) {
  createBullBoard({
    queues: [
      new BullMQAdapter(badgeQueue),
      new BullMQAdapter(rfmQueue),
      new BullMQAdapter(whatsappQueue),
      new BullMQAdapter(defaultQueue),
    ],
    serverAdapter: serverAdapter,
  });
}

app.use('/admin/queues', serverAdapter.getRouter());

// Route Mounting
const v1Router = Router();

v1Router.use('/auth', authLimiter, authRouter);
v1Router.use('/auth', auth2faRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/roles', rolesRouter);
v1Router.use('/permissions', permissionsRouter);
v1Router.use('/role-permissions', rolePermissionsRouter);
v1Router.use('/branches', branchesRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/suppliers', suppliersRouter);
v1Router.use('/products', createProductRouter());
v1Router.use('/product-kits', productKitsRouter);
v1Router.use('/inventory', inventoryRouter);
v1Router.use('/stock-transfers', stockTransfersRouter);
v1Router.use('/serialized-items', serializedItemsRouter);
v1Router.use('/customers', customersRouter);
v1Router.use('/customer-communications', customerCommunicationsRouter);
v1Router.use('/customer-journeys', customerJourneysRouter);
// v1Router.use('/store-credit', storeCreditRouter); // REMOVED: File not found
v1Router.use('/loyalty', loyaltyRouter);
v1Router.use('/loyalty-tiers', loyaltyTiersRouter);
v1Router.use('/referrals', referralsRouter);
v1Router.use('/leads', leadsRouter);
v1Router.use('/sales', salesRouter);
v1Router.use('/sales-goals', salesGoalsRouter);
v1Router.use('/coupons', couponsRouter);
v1Router.use('/discounts', discountsRouter);
v1Router.use('/reviews', reviewsRouter);
v1Router.use('/return-items', returnItemsRouter);
v1Router.use('/returns', returnsRouter);
v1Router.use('/quarantine', quarantineRouter);
v1Router.use('/receipts', receiptsRouter);
v1Router.use('/tef', tefRouter);
v1Router.use('/pix', pixRouter);
v1Router.use('/cash-drawer', cashDrawerRouter);
v1Router.use('/parts', partsRouter);
v1Router.use('/compatibility', compatibilityRouter);
v1Router.use('/service-orders', serviceOrdersRouter);
v1Router.use('/service-order-attachments', serviceOrderAttachmentsRouter);
v1Router.use('/diagnostic-nodes', diagnosticNodesRoutes);
v1Router.use('/diagnostics', diagnosticsRouter);
v1Router.use('/checklists', checklistsRouter);
v1Router.use('/kanban', kanbanRouter);
v1Router.use('/activity-feed', activityFeedRouter);
v1Router.use('/shifts', shiftsRouter);
v1Router.use('/time-clock', timeClockRouter);
v1Router.use('/expense-reimbursements', expenseReimbursementsRouter);
v1Router.use('/performance', performanceRouter);
v1Router.use('/performance-reviews', performanceReviewsRouter);
v1Router.use('/gamification', gamificationRouter);
v1Router.use('/badges', badgesRouter);
v1Router.use('/accounting', accountingRouter);
v1Router.use('/finance', financeRouter);
v1Router.use('/cash-flow', cashFlowRouter);
v1Router.use('/reports', reportsRouter);
v1Router.use('/shift-reports', shiftReportsRouter);
v1Router.use('/what-if', whatIfRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/executive-dashboard', executiveDashboardRouter);
v1Router.use('/user-dashboard', userDashboardRouter);
v1Router.use('/search', searchRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/push', pushNotificationsRouter);
v1Router.use('/whatsapp', whatsappRouter);
v1Router.use('/templates', emailRouter);
v1Router.use('/labels', labelsRouter);
v1Router.use('/audit', auditRouter);
v1Router.use('/backup', backupRouter);
v1Router.use('/health', healthRouter);
v1Router.use('/sandbox', sandboxRouter);
v1Router.use('/settings', settingsRouter);
v1Router.use('/branding', brandingRouter);
v1Router.use('/marketplace', marketplaceRouter);
v1Router.use('/admin/marketplace', marketplaceConfigRoutes);
v1Router.use('/admin/pricing', pricingRuleRoutes);
v1Router.use('/tags', tagsRouter);
v1Router.use('/accounts', accountsRouter);
v1Router.use('/user-keybinds', userKeybindsRouter);
v1Router.use('/ip-whitelist', ipWhitelistRouter);
v1Router.use('/dev', apiKeyRouter);
v1Router.use('/public', publicApiRouter);
v1Router.use('/portal', publicPortalRouter);
v1Router.use('/tech', techAppRouter);
v1Router.use('/ai', aiDiagnosticRouter);
v1Router.use('/delivery', deliveryRouter);
v1Router.use('/print', printRouter);
v1Router.use('/rma', rmaRouter);
v1Router.use('/customer360', customer360Routes);
v1Router.use('/commission-rules', commissionRulesRoutes);
v1Router.use('/cycle-counts', cycleCountsRouter);

app.use('/api/v1', v1Router);
app.use('/api', v1Router);

// Swagger UI
const swaggerDocument = YAML.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Socket.IO
// Socket listeners are already initialized via initSocketListeners(io) above

// Serve Frontend Static Files (Production/Self-Hosting Mode)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' || process.env.SELF_HOSTED === 'true') {
  app.use(express.static(frontendDistPath));
  
  // SPA Fallback: Any route not handled by API returns index.html
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next(); // Let API 404 handler deal with it
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    },
  });
});

// Error handlers
if (process.env.NODE_ENV !== 'test') {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorMiddleware);

export { app, httpServer, io };
