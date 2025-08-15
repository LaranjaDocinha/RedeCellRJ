require('dotenv').config();
console.log('--- Backend Server Starting...');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DATABASE:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '*****' : 'Not Set'); // Não logar o segredo em produção
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*****' : 'Not Set'); // Não logar a senha em produção

const express = require('express');
const cors = require('cors'); // Importa o pacote cors
const { query, getClient, redisClient } = require('./db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

// Route imports
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const repairRoutes = require('./routes/repairRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const salesRoutes = require('./routes/salesRoutes');
const cashierRoutes = require('./routes/cashierRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const reportRoutes = require('./routes/reportRoutes');
const financeRoutes = require('./routes/financeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const searchRoutes = require('./routes/searchRoutes');
const roleRoutes = require('./routes/roleRoutes');
const leadRoutes = require('./routes/leadRoutes');
const customerInteractionRoutes = require('./routes/customerInteractionRoutes');
const checklistTemplateRoutes = require('./routes/checklistTemplateRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const stockTransferRoutes = require('./routes/stockTransferRoutes');
const usedProductRoutes = require('./routes/usedProductRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const npsRoutes = require('./routes/npsRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const commissionRuleRoutes = require('./routes/commissionRuleRoutes'); // New import
const cashFlowRoutes = require('./routes/cashFlowRoutes');
const bankReconciliationRoutes = require('./routes/bankReconciliationRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes'); // New import
const calendarRoutes = require('./routes/calendarRoutes');
const expenseRoutes = require('././routes/expenseRoutes');
const branchRoutes = require('./routes/branchRoutes');
const loginSettingsRoutes = require('./routes/loginSettingsRoutes');

// Sentry setup
// const Sentry = require('@sentry/node');
// const { Integrations } = require('@sentry/tracing'); // For performance monitoring

// Sentry.init({
//   dsn: process.env.SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE', // Replace with your actual DSN
//   integrations: [
//     // Enable HTTP calls tracing
//     new Sentry.Integrations.Http({ tracing: true }),
//     // Enable Express.js middleware tracing
//     new Integrations.Express({ app: app }), // Use the 'app' instance here
//   ],
//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production.
//   tracesSampleRate: 1.0,
// });

// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
// Swagger/OpenAPI setup
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'PDV Web API',
      version: '1.0.0',
      description: 'Documentação da API do sistema PDV Web',
      contact: {
        name: 'Seu Nome/Empresa',
        url: 'http://www.example.com',
        email: 'info@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);







const app = express();
const port = 5000;

// Middlewares de Segurança
app.use(helmet()); // Aplica cabeçalhos de segurança, incluindo CSP

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Limita cada IP a 1000 requisições por janela
  standardHeaders: true, // Retorna informações do limite nos cabeçalhos `RateLimit-*`
  legacyHeaders: false, // Desabilita os cabeçalhos `X-RateLimit-*`
});
app.use(limiter); // Aplica o limitador de requisições a todas as rotas

// Configuração do CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
  optionsSuccessStatus: 204 // Para requisições preflight
};
app.use(cors(corsOptions));

// Habilita o pre-flight para todas as rotas
// Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// // Habilita o pre-flight para todas as rotas
// app.options('*', cors(corsOptions));

app.use(express.json());

// The request handler must be the first middleware on the app
// app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
// app.use(Sentry.Handlers.tracingHandler());

// Configuração do logger de requisições
const winston = require('winston');
const expressWinston = require('express-winston');
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    // Add Sentry transport for Winston
    // new Sentry.Integrations.Winston({
    //   level: 'error', // Only send errors to Sentry
    // }),
  ],
  meta: true, // whether to log req, res, and other meta data (default method to log these is using winston.transports.Console)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. 
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true.
  colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: green, yellow, red).
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

// Basic app.get routes
app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

app.get('/test-db', async (req, res) => {
  try {
    await query('SELECT NOW()');
    res.status(200).send('Database connected successfully!');
  } catch (err) {
    console.error('Database connection error', err);
    res.status(500).send('Database connection failed.');
  }
});

app.get('/init-db', async (req, res) => {
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema_consolidated.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await query(schemaSql);
    res.status(200).send('Database schema initialized successfully!');
  } catch (err) {
    console.error('Error initializing database schema:', err);
    res.status(500).send('Failed to initialize database schema.');
  }
});

app.get('/apply-migrations', async (req, res) => {
  console.log('\n[MIGRATION] Starting migration process...');
  const client = await getClient();

  try {
    // 1. Garante que a tabela de migrações exista
    console.log('[MIGRATION] Ensuring schema_migrations table exists.');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY
      );
    `);

    // 2. Pega as migrações já aplicadas
    const appliedMigrationsResult = await client.query('SELECT version FROM schema_migrations');
    const appliedVersions = new Set(appliedMigrationsResult.rows.map(r => r.version));
    console.log('[MIGRATION] Applied versions found:', Array.from(appliedVersions));

    // 3. Lê todos os arquivos de migração da pasta
    const migrationFiles = (await fs.readdir(path.join(__dirname, 'database')))
      .filter(file => file.startsWith('migration_') && file.endsWith('.sql'))
      .sort();
    console.log('[MIGRATION] All migration files found:', migrationFiles);

    let newMigrationsApplied = 0;
    for (const file of migrationFiles) {
      if (appliedVersions.has(file)) {
        continue; // Pula migração já aplicada
      }

      console.log(`[MIGRATION] Applying new migration: ${file}...`);
      const filePath = path.join(__dirname, 'database', file);
      const sql = await fs.readFile(filePath, 'utf8');
      // console.log(`[MIGRATION] SQL to be executed for ${file}:\n---\n${sql}\n---`);

      // 4. Executa a nova migração dentro de uma transação
      try {
        await client.query('BEGIN');
        console.log(`[MIGRATION] BEGIN transaction for ${file}`);
        await client.query(sql);
        console.log(`[MIGRATION] SQL for ${file} executed successfully.`);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        console.log(`[MIGRATION] ${file} registered in schema_migrations.`);
        await client.query('COMMIT');
        console.log(`[MIGRATION] COMMIT transaction for ${file}`);
        newMigrationsApplied++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[MIGRATION] ROLLBACK transaction for ${file}. Error:`, err);
        throw err; // Lança o erro para ser pego pelo catch principal
      }
    }

    if (newMigrationsApplied > 0) {
      console.log(`[MIGRATION] Success: ${newMigrationsApplied} new migration(s) applied.`);
      res.status(200).send(`${newMigrationsApplied} new migration(s) applied successfully!`);
    } else {
      console.log('[MIGRATION] Success: Database is already up to date.');
      res.status(200).send('Database is already up to date.');
    }

  } catch (err) {
    console.error('[MIGRATION] A critical error occurred during the migration process:', err);
    res.status(500).send(`Failed to apply migrations: ${err.message}`); // Include error message
  } finally {
    client.release();
    console.log('[MIGRATION] Client released. Migration process finished.\n');
  }
});

// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes
// app.use routes

// app.use routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes); // Use product routes
app.use('/api/repairs', repairRoutes);
app.use('/api/dashboard', dashboardRoutes); // Use dashboard routes
app.use('/api/users', userRoutes); // Use user routes
app.use('/api/sales', salesRoutes); // Use sales routes
app.use('/api/cashier', cashierRoutes); // Use cashier routes
app.use('/api/payment-methods', paymentMethodRoutes); // Use payment method routes
app.use('/api/reports', reportRoutes); // Use report routes
app.use('/api/finance', financeRoutes); // Use finance routes
app.use('/api/categories', categoryRoutes); // Use category routes
app.use('/api/suppliers', supplierRoutes); // Use supplier routes
app.use('/api/purchase-orders', purchaseOrderRoutes); // Use purchase order routes
app.use('/api/settings', settingsRoutes); // Use settings routes
app.use('/api/notifications', notificationRoutes); // Use notification routes
app.use('/api/technicians', technicianRoutes); // Use technician routes
app.use('/api/search', searchRoutes); // Use search routes
app.use('/api/roles', roleRoutes); // Use role routes
app.use('/api/leads', leadRoutes); // Use lead routes
app.use('/api/customer-interactions', customerInteractionRoutes); // Use customer interaction routes
app.use('/api/checklist-templates', checklistTemplateRoutes); // Use checklist template routes
app.use('/api/checklists', checklistRoutes); // Use checklist routes
app.use('/api/stock/transfers', stockTransferRoutes); // Use stock transfer routes
app.use('/api/used-products', usedProductRoutes); // Use used products routes
app.use('/api/gift-cards', giftCardRoutes); // Use gift card routes
app.use('/api/quotations', quotationRoutes); // Use quotation routes
app.use('/api/appointments', appointmentRoutes); // Use appointment routes
app.use('/api/marketing', marketingRoutes); // Use marketing routes
app.use('/api/nps-surveys', npsRoutes); // Use NPS routes
app.use('/api/nps', npsRoutes); // Use NPS routes
app.use('/api/commissions', commissionRoutes); // Use commission routes
app.use('/api/commission-rules', commissionRuleRoutes); // Use commission rule routes // New use
app.use('/api/cash-flow', cashFlowRoutes); // Use cash flow routes
app.use('/api/bank-reconciliation', bankReconciliationRoutes); // Use bank reconciliation routes
app.use('/api/bank-accounts', bankAccountRoutes); // Use bank account routes // New use
app.use('/api/calendar', calendarRoutes); // Use calendar routes
app.use('/api/expenses', expenseRoutes); // Use expense routes
app.use('/api/branches', branchRoutes); // Use branch routes
app.use('/api/settings', loginSettingsRoutes); // Use login settings routes;

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Global error handler (if needed, add AppError import)
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Ocorreu um erro inesperado no servidor.',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});