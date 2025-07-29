require('dotenv').config();
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DATABASE:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*****' : 'Not Set'); // Não logar a senha em produção
const express = require('express');
// const cors = require('cors'); // Removido
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { pool } = require('./db');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
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

// Middleware CORS manual
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Lida com requisições preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

app.get('/test-db', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
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
    await pool.query(schemaSql);
    res.status(200).send('Database schema initialized successfully!');
  } catch (err) {
    console.error('Error initializing database schema:', err);
    res.status(500).send('Failed to initialize database schema.');
  }
});

app.get('/apply-migrations', async (req, res) => {
  try {
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbName = process.env.DB_NAME || 'pdv_web';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    const dbPort = process.env.DB_PORT || 5432;

    const migrationFiles = (await fs.readdir(path.join(__dirname, 'database')))
      .filter(file => file.startsWith('migration_') && file.endsWith('.sql'))
      .sort();

    let appliedMigrations = 0;
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, 'database', file);
      const command = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${filePath}`;
      
      console.log(`Attempting to apply migration: ${file}`);
      console.log(`Executing command: ${command}`);
      const { stdout, stderr, error } = await new Promise((resolve) => {
        exec(command, { env: { ...process.env, PGPASSWORD: dbPassword } }, (err, stdout, stderr) => {
          resolve({ stdout, stderr, error: err });
        });
      });

      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        console.error('stdout:', stdout);
        console.error('stderr:', stderr);
        throw new Error(`Failed to apply migration ${file}: ${error.message || stderr}`);
      }
      console.log(`Successfully applied migration: ${file}`);
      appliedMigrations++;
    }
    
    res.status(200).send(`${appliedMigrations} migration(s) applied successfully!`);
  } catch (err) {
    console.error('Error applying migrations:', err);
    res.status(500).send('Failed to apply migrations.');
  }
});

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

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack); // Loga o stack trace do erro no console do servidor
  res.status(err.statusCode || 500).json({
    message: err.message || 'Ocorreu um erro inesperado no servidor.',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack // Não expõe o stack trace em produção
  });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});