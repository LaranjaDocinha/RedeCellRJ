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
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import errorMiddleware from './middlewares/errorMiddleware.js';
import marketingAutomationListener from './listeners/marketingAutomationListener.js';
import { initSocketListeners } from './listeners/socketEvents.js'; // Import socket listeners
import { initCronJobs } from './jobs/cronJobs.js'; // Import cron jobs
import { initWorkers } from './jobs/workers.js'; // Import BullMQ workers
import maintenanceMiddleware from './middlewares/maintenanceMiddleware.js';
import chaosMiddleware from './middlewares/chaos/chaos.js';
import { xssSanitizer } from './middlewares/sanitizationMiddleware.js'; // Added import
import { requestLoggerMiddleware } from './middlewares/requestLoggerMiddleware.js'; // Importar requestLoggerMiddleware
// Initialize event listeners
marketingAutomationListener();
initSocketListeners(); // Initialize socket listeners
initCronJobs(); // Initialize cron jobs
initWorkers(); // Initialize BullMQ workers
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
app.use(xssSanitizer); // Apply XSS sanitization globally
app.use(requestLoggerMiddleware); // Aplicar o requestLoggerMiddleware AQUI
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Ajustar conforme necessário para scripts externos
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Necessário para carregar imagens/assets em dev
}));
// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
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
import authRouter from './routes/auth.js';
import commissionRulesRoutes from './routes/commissionRulesRoutes.js';
import customer360Routes from './routes/customer360Routes.js';
import rfmRouter from './routes/rfm.js';
import marketingAutomationsRouter from './routes/marketingAutomations.js'; // Existing
import customerJourneysRouter from './routes/customerJourneys.js'; // Added import
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
import shiftReportsRouter from './routes/shiftReports.js'; // Import shift reports router
import zReportsRouter from './routes/zReports.js'; // Import Z-Reports router
import labelsRouter from './routes/labels.js'; // Added import
import marketplaceRouter from './routes/marketplace.js'; // Added import
import userKeybindsRouter from './routes/userKeybinds.js'; // Added import
import pushNotificationsRouter from './routes/pushNotifications.js'; // Added import
import ipWhitelistRouter from './routes/ipWhitelist.js'; // Added import
import { apiKeyRouter, publicApiRouter } from './routes/api.js'; // Added import
import auth2faRouter from './routes/auth2fa.js'; // Import 2FA router
app.get('/', (req, res) => {
    res.send('API is running');
});
app.use('/api/shift-reports', shiftReportsRouter); // Use shift reports router
app.use('/api/reports/z-report', zReportsRouter); // Use Z-Reports router
app.use('/api/labels', labelsRouter); // Added route
app.use('/api/marketplace', marketplaceRouter); // Added route
app.use('/api/user-keybinds', userKeybindsRouter); // Added route
app.use('/api/push', pushNotificationsRouter); // Added route
app.use('/api/ip-whitelist', ipWhitelistRouter); // Added route
app.use('/api/dev', apiKeyRouter); // API Key management routes
app.use('/public-api', publicApiRouter); // Public API routes
// Auth routes (main and 2FA)
app.use('/api/auth', authLimiter, authRouter); // Main auth routes
app.use('/api/auth', auth2faRouter); // 2FA specific routes
app.use('/api', commissionRulesRoutes);
app.use('/api', customer360Routes);
app.use('/api/rfm', rfmRouter);
app.use('/api/marketing-automations', marketingAutomationsRouter); // Existing
app.use('/api/customer-journeys', customerJourneysRouter); // Added route
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
