-- backend/tests/full_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  loyalty_points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  UNIQUE (action, subject)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  condition VARCHAR(50),
  acquisition_date TIMESTAMP,
  ecommerce_product_id VARCHAR(255),
  last_ecommerce_sync TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variations (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(255) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 0,
  is_serialized BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sale_date TIMESTAMP NOT NULL DEFAULT current_timestamp,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method_details JSONB,
  payment_type VARCHAR(50) NOT NULL DEFAULT 'cash',
  total_installments INTEGER
);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  variation_id INTEGER NOT NULL REFERENCES product_variations(id),
  quantity INTEGER NOT NULL,
  price_at_sale DECIMAL(10, 2) NOT NULL,
  bundle_id UUID,
  cost_at_sale DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  store_credit_balance DECIMAL(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS store_credit_transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'credit' or 'debit'
  reason VARCHAR(255),
  related_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS store_credit_transactions_customer_id_idx ON store_credit_transactions (customer_id);

CREATE TABLE IF NOT EXISTS automation_runs (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER, -- Assumindo que existe uma tabela 'automations'
  customer_id INTEGER REFERENCES customers(id),
  status VARCHAR(255) NOT NULL,
  current_step INTEGER,
  next_step_due_at TIMESTAMP,
  trigger_payload JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);