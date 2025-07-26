require('dotenv').config();
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*****' : 'Not Set'); // Não logar a senha em produção
const express = require('express');
const cors = require('cors'); // Import cors
const { pool } = require('./db');
const fs = require('fs').promises;
const path = require('path');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const repairRoutes = require('./routes/repairRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Import dashboard routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const salesRoutes = require('./routes/salesRoutes'); // Import sales routes
const cashierRoutes = require('./routes/cashierRoutes'); // Import cashier routes
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Import report routes
const financeRoutes = require('./routes/financeRoutes'); // Import finance routes
const categoryRoutes = require('./routes/categoryRoutes'); // Import category routes
const supplierRoutes = require('./routes/supplierRoutes'); // Import supplier routes
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes'); // Import purchase order routes
const settingsRoutes = require('./routes/settingsRoutes'); // Import settings routes

const app = express();
const port = 5000;


// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'], // Allow multiple frontends to connect
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
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
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(schemaSql);
    res.status(200).send('Database schema initialized successfully!');
  } catch (err) {
    console.error('Error initializing database schema:', err);
    res.status(500).send('Failed to initialize database schema.');
  }
});

app.get('/apply-migrations', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const migrationFiles = (await fs.readdir(path.join(__dirname, 'database')))
      .filter(file => file.startsWith('migration_') && file.endsWith('.sql'))
      .sort();

    let appliedMigrations = 0;
    for (const file of migrationFiles) {
      const migrationSql = await fs.readFile(path.join(__dirname, 'database', file), 'utf8');
      await client.query(migrationSql);
      appliedMigrations++;
    }
    
    await client.query('COMMIT');
    res.status(200).send(`${appliedMigrations} migration(s) applied successfully!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error applying migrations:', err);
    res.status(500).send('Failed to apply migrations.');
  } finally {
    client.release();
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

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
