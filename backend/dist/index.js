import * as Sentry from '@sentry/node';
import express from 'express';
import http from 'http'; // Import http
import { Server } from 'socket.io'; // Import Server from socket.io
import 'dotenv/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csurf from 'csurf';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRouter from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import customersRouter from './routes/customers.js'; // Import customersRouter
import categoriesRouter from './routes/categories.js'; // Import categoriesRouter
import tagsRouter from './routes/tags.js'; // Import tagsRouter
import suppliersRouter from './routes/suppliers.js'; // Import suppliersRouter
import branchesRouter from './routes/branches.js'; // Import branchesRouter
import dashboardRouter from './routes/dashboard.js';
import { createProductRouter } from './routes/products.js';
import { salesRouter } from './routes/sales.js';
import kanbanRouter from './routes/kanban.js';
import searchRouter from './routes/search.js';
import userDashboardRouter from './routes/userDashboard.js';
import reportsRouter from './routes/reports.js';
import paymentRouter from './routes/payment.js';
import inventoryRouter from './routes/inventory.js';
import rolesRouter from './routes/roles.js'; // Import rolesRouter
import permissionsRouter from './routes/permissions.js'; // Import permissionsRouter
import auditRouter from './routes/audit.js'; // Import auditRouter
import settingsRouter from './routes/settings.js'; // Import settingsRouter
import discountsRouter from './routes/discounts.js'; // Import discountsRouter
import couponsRouter from './routes/coupons.js'; // Import couponsRouter
import returnsRouter from './routes/returns.js'; // Import returnsRouter
import loyaltyTiersRouter from './routes/loyaltyTiers.js'; // Import loyaltyTiersRouter
import productKitsRouter from './routes/productKits.js'; // Import productKitsRouter
import purchaseOrdersRouter from './routes/purchaseOrders.js'; // Import purchaseOrdersRouter
import reviewsRouter from './routes/reviews.js'; // Import reviewsRouter
import uploadsRouter from './routes/uploads.js'; // Import uploadsRouter
import errorMiddleware from './middlewares/errorMiddleware.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = http.createServer(app); // Create HTTP server
export const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3001", "http://localhost:5000"], // Allow frontend origins
        methods: ["GET", "POST"]
    }
});
// Sentry Initialization (Conditional for test environment)
if (process.env.NODE_ENV !== 'test') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            Sentry.httpIntegration(),
            new Sentry.Integrations.Express({ app }),
        ],
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development',
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
}
app.use(express.json());
app.use(helmet());
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
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(csurf({ cookie: true }));
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);
// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.get('/', (req, res) => {
    res.send('Backend do Gerenciador de Loja de Celular está funcionando!');
});
// API Routes
app.use('/uploads', uploadsRouter); // Add uploadsRouter
app.use('/products', createProductRouter());
app.use('/auth', authRouter);
app.use('/sales', salesRouter);
app.use('/dashboard', dashboardRouter);
app.use('/users', usersRouter);
app.use('/customers', customersRouter); // Add customersRouter
app.use('/categories', categoriesRouter); // Add categoriesRouter
app.use('/tags', tagsRouter); // Add tagsRouter
app.use('/suppliers', suppliersRouter); // Add suppliersRouter
app.use('/branches', branchesRouter); // Add branchesRouter
app.use('/roles', rolesRouter); // Add rolesRouter
app.use('/permissions', permissionsRouter); // Add permissionsRouter
app.use('/audit', auditRouter); // Add auditRouter
app.use('/settings', settingsRouter); // Add settingsRouter
app.use('/discounts', discountsRouter); // Add discountsRouter
app.use('/coupons', couponsRouter); // Add couponsRouter
app.use('/returns', returnsRouter); // Add returnsRouter
app.use('/loyalty-tiers', loyaltyTiersRouter); // Add loyaltyTiersRouter
app.use('/product-kits', productKitsRouter); // Add productKitsRouter
app.use('/purchase-orders', purchaseOrdersRouter); // Add purchaseOrdersRouter
app.use('/reviews', reviewsRouter); // Add reviewsRouter
app.use('/api/kanban', kanbanRouter);
app.use('/api/search', searchRouter);
app.use('/api/user-dashboard', userDashboardRouter); // Added user-dashboard route
app.use('/api/reports', reportsRouter);
app.use('/api/payment', paymentRouter); // Added payment route
app.use('/api/inventory', inventoryRouter); // Added inventory route
app.get('/test-route', (req, res) => res.send('Test route works!'));
// Swagger UI
const swaggerDocument = YAML.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
    // Example: Emit a notification after a delay
    setTimeout(() => {
        socket.emit('newOrderNotification', { message: 'Novo pedido recebido! #123', orderId: '123' });
    }, 5000);
});
if (process.env.NODE_ENV !== 'test') {
    app.use(Sentry.Handlers.errorHandler());
}
app.use(errorMiddleware);
app.use((err, req, res, next) => {
    const sentryId = res.sentry;
    res.statusCode = 500;
    res.end(sentryId ? sentryId + '\n' : 'Internal Server Error');
});
export default httpServer;
